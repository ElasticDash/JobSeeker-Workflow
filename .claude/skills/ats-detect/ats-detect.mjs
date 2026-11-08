#!/usr/bin/env node
// ats-detect.mjs (added 2026-11-08, user directive). Deterministic, no AI.
//
// Finds out whether a job link is really a Greenhouse application, including the case where a company embeds
// Greenhouse inside its own careers site (careers.acme.com/jobs?gh_jid=123). Greenhouse only for now; the DETECTORS
// table is where Ashby / Lever / Workday rows get added later.
//
// Tiers, cheapest first; a job stops at the first tier that answers:
//   1 url      host is greenhouse.io, or the URL carries gh_jid. No request.
//   2 cache    the job's host was already resolved (ATS is a company-level fact). No request.
//   3 html     one plain GET, regex the static HTML for the embed loader, grnhse_app, or greenhouse job links.
//              The loader script is in the raw HTML even though the iframe is injected after window load.
//   4 render   NOT done here. If the HTML is an empty shell, the result is { ats: null, needsRender: true } and the
//              caller decides (a headless render with a *.greenhouse.io network listener).
//   unknown    { ats: null }.
//
// Library:  import { detectAts, detectFromUrl, detectFromHtml } from '.../ats-detect.mjs'
// CLI:      node .claude/skills/ats-detect/ats-detect.mjs <jobs.json> [--out <file>] [--no-fetch]
//   <jobs.json> is an array (or { jobs | applications | data }) of objects with jobPostUrl / url / application_link.
//   Adds atsDetected ('greenhouse' | null), atsBoardToken, atsJobId, atsVia, atsNeedsRender, and prints a summary.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const CACHE_FILE = join(REPO_ROOT, '.temp', 'ats-detect-cache.json');
const USER_AGENT = 'Mozilla/5.0 (compatible; JobSeekerWorkflow-ats-detect/1.0)';

const GH_HOST = /(^|\.)greenhouse\.io$/;
const TOKEN = '([A-Za-z0-9_-]+)';

// Patterns against static HTML, strongest first. Each returns the board token in group 1 when it has one.
const GH_HTML = [
    new RegExp(`greenhouse\\.io/embed/job_board/js\\?for=${TOKEN}`, 'i'),
    new RegExp(`job-boards(?:\\.eu)?\\.greenhouse\\.io/embed/job_app\\?for=${TOKEN}`, 'i'),
    new RegExp(`boards(?:\\.eu)?\\.greenhouse\\.io/embed/job_app\\?for=${TOKEN}`, 'i'),
    new RegExp(`(?:job-)?boards(?:\\.eu)?\\.greenhouse\\.io/${TOKEN}/jobs/\\d+`, 'i'),
    new RegExp(`boards-api\\.greenhouse\\.io/v1/boards/${TOKEN}/`, 'i')
];
const RESERVED = new Set(['embed', 'v1', 'js']);

const parse = (url) => { try { return new URL(String(url ?? '').trim()); } catch { return null; } };

function result(token, jobId, via) {
    return {
        ats: 'greenhouse', boardToken: token || null, jobId: jobId || null, via,
        applyUrl: token && jobId ? `https://job-boards.greenhouse.io/${token}/jobs/${jobId}` : null,
        formSchemaUrl: token && jobId ? `https://boards-api.greenhouse.io/v1/boards/${token}/jobs/${jobId}?questions=true` : null
    };
}

/** Tier 1: URL only. Returns a result, or null. */
export function detectFromUrl(url) {
    const u = parse(url);
    if (!u) return null;
    const host = u.hostname.toLowerCase();
    const ghJid = u.searchParams.get('gh_jid') || u.searchParams.get('token');
    if (GH_HOST.test(host)) {
        const m = u.pathname.match(new RegExp(`^/${TOKEN}/jobs/(\\d+)`));
        const fromEmbed = u.searchParams.get('for');
        const token = (m && !RESERVED.has(m[1]) ? m[1] : null) || fromEmbed;
        return result(token, (m && m[2]) || ghJid, 'url-host');
    }
    if (u.searchParams.get('gh_jid')) return result(null, u.searchParams.get('gh_jid'), 'url-gh_jid');
    return null;
}

/** Tier 3: static HTML. Returns a result, or null. */
export function detectFromHtml(html, pageUrl) {
    const h = String(html ?? '');
    for (const re of GH_HTML) {
        const m = h.match(re);
        if (m && !RESERVED.has(m[1])) {
            const jobId = (h.match(new RegExp(`${m[1]}/jobs/(\\d+)`, 'i')) || [])[1] || parse(pageUrl)?.searchParams.get('gh_jid') || null;
            return result(m[1], jobId, 'html');
        }
    }
    if (/id=["']grnhse_app["']/.test(h) || /\bwindow\.Grnhse\b/.test(h) || /grnhse_iframe/.test(h)) {
        return result(null, parse(pageUrl)?.searchParams.get('gh_jid') || null, 'html-container');
    }
    return null;
}

// An SPA shell: almost no text and a root mount point. The embed may be injected after load, so HTML says nothing.
export function looksLikeShell(html) {
    const text = String(html ?? '').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length < 400 && /id=["'](root|app|__next|__nuxt)["']/.test(String(html ?? ''));
}

function loadCache() { try { return JSON.parse(readFileSync(CACHE_FILE, 'utf8')); } catch { return {}; } }
function saveCache(c) { mkdirSync(dirname(CACHE_FILE), { recursive: true }); writeFileSync(CACHE_FILE, JSON.stringify(c, null, 2)); }

async function fetchHtml(url, fetchImpl = fetch) {
    try {
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 15000);
        const res = await fetchImpl(url, { redirect: 'follow', signal: ctl.signal, headers: { 'User-Agent': USER_AGENT } });
        clearTimeout(t);
        return res.ok ? await res.text() : null;
    } catch { return null; }
}

/**
 * detectAts(url, { cache, fetchImpl, noFetch }) -> { ats, boardToken, jobId, via, applyUrl, formSchemaUrl, needsRender }
 * ats is 'greenhouse' or null. `cache` is a plain object keyed by host (mutated); persist it with the CLI.
 */
export async function detectAts(url, { cache = {}, fetchImpl, noFetch = false } = {}) {
    const byUrl = detectFromUrl(url);
    if (byUrl) {
        if (byUrl.boardToken) { const h = parse(url).hostname.toLowerCase(); if (!GH_HOST.test(h)) cache[h] = { ats: 'greenhouse', boardToken: byUrl.boardToken }; }
        else if (cache[parse(url)?.hostname?.toLowerCase()]) byUrl.boardToken = cache[parse(url).hostname.toLowerCase()].boardToken;
        return finalize(byUrl);
    }
    const u = parse(url);
    if (!u) return { ats: null, via: 'bad-url' };
    const host = u.hostname.toLowerCase();
    if (cache[host]?.ats === 'greenhouse') return finalize(result(cache[host].boardToken, null, 'cache'));
    if (cache[host]?.ats === 'none') return { ats: null, via: 'cache-none' };
    if (noFetch) return { ats: null, via: 'unknown' };
    const html = await fetchHtml(u.href, fetchImpl);
    if (html == null) return { ats: null, via: 'fetch-failed' };
    const byHtml = detectFromHtml(html, u.href);
    if (byHtml) {
        cache[host] = { ats: 'greenhouse', boardToken: byHtml.boardToken };
        return finalize(byHtml);
    }
    if (looksLikeShell(html)) return { ats: null, via: 'shell', needsRender: true };
    cache[host] = { ats: 'none' };
    return { ats: null, via: 'html-no-match' };
}

function finalize(r) {
    // A cache hit knows the board but not this job; keep what the URL gave.
    return r;
}

async function main() {
    const argv = process.argv.slice(2);
    const file = argv.find((a, i) => !a.startsWith('--') && argv[i - 1] !== '--out');
    if (!file) { console.error('Usage: node ats-detect.mjs <jobs.json> [--out <file>] [--no-fetch]'); process.exitCode = 1; return; }
    const oi = argv.indexOf('--out');
    const raw = JSON.parse(readFileSync(file, 'utf8'));
    const jobs = Array.isArray(raw) ? raw : (raw.jobs || raw.applications || raw.data || []);
    const cache = existsSync(CACHE_FILE) ? loadCache() : {};
    const counts = { greenhouse: 0, unknown: 0, needsRender: 0 };
    for (const j of jobs) {
        const url = j.jobPostUrl || j.url || j.application_link || j.final_url;
        const r = await detectAts(url, { cache, noFetch: argv.includes('--no-fetch') });
        j.atsDetected = r.ats;
        j.atsBoardToken = r.boardToken ?? null;
        j.atsJobId = r.jobId ?? null;
        j.atsVia = r.via;
        j.atsNeedsRender = !!r.needsRender;
        if (r.ats) counts.greenhouse += 1; else if (r.needsRender) counts.needsRender += 1; else counts.unknown += 1;
    }
    saveCache(cache);
    writeFileSync(oi >= 0 ? argv[oi + 1] : file, JSON.stringify(Array.isArray(raw) ? jobs : raw, null, 2));
    console.log(`ATS detect: ${jobs.length} jobs -> ${counts.greenhouse} greenhouse, ${counts.needsRender} need a rendered check, ${counts.unknown} unknown.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
