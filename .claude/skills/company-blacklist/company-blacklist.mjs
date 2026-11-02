#!/usr/bin/env node
// Shared company blacklist (added 2026-10-30, user directive: never fetch any
// job from Amazon). Source of truth: blacklist.json next to this file.
//
// Library:  import { isBlacklisted, blacklistReason } from '.../company-blacklist.mjs'
// CLI:      node .claude/skills/company-blacklist/company-blacklist.mjs <jobs.json> [--out <dir>]
//   <jobs.json> is an array, or an object with jobs[] / data[] / applications[].
//   Writes <dir>/blacklist_kept.json and <dir>/blacklist_dropped.json.
//
// Enforced in code at: fetch-ats-jobs.mjs (drops at fetch) and
// push-applications.mjs (the single write path every channel uses, so a
// blacklisted job can never be logged even if an upstream screen missed it).
// Enforced by instruction at every matcher skill's post-receipt step.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LIST = JSON.parse(readFileSync(join(HERE, 'blacklist.json'), 'utf8')).companies || [];

const SUFFIX_RE = /\b(inc|llc|ltd|limited|corp|corporation|co|company|plc|gmbh|lp|llp)\b/g;
export function normalizeCompany(name) {
    return String(name || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').replace(SUFFIX_RE, ' ').replace(/\s+/g, ' ').trim();
}

function hostOf(url) {
    try { return new URL(url).hostname.toLowerCase(); } catch { return ''; }
}

function companyNames(j) {
    return [j.company, j.company_name, j.companyName, j.company_object?.name, j.organization?.name, j.employer].filter((x) => typeof x === 'string' && x.trim());
}

// Returns the matching blacklist entry's name, or null.
export function blacklistReason(j) {
    const names = companyNames(j).map(normalizeCompany);
    const urls = [j.url, j.jobPostUrl, j.application_link, j.final_url, j.jobUrl, j.hostedUrl, j.absolute_url].filter(Boolean);
    for (const e of LIST) {
        const aliases = (e.aliases || []).map(normalizeCompany);
        const prefixes = (e.prefixMatch || []).map((p) => p.toLowerCase());
        if (names.some((n) => aliases.includes(n) || prefixes.some((p) => (n + ' ').startsWith(p)))) return e.name;
        const hosts = (e.urlHosts || []).map((h) => h.toLowerCase());
        if (urls.some((u) => { const h = hostOf(u); return h && hosts.some((x) => h === x || h.endsWith('.' + x)); })) return e.name;
    }
    return null;
}

export const isBlacklisted = (j) => blacklistReason(j) !== null;

function main() {
    const argv = process.argv.slice(2);
    const file = argv.find((a, i) => !a.startsWith('--') && argv[i - 1] !== '--out');
    if (!file) { console.error('Usage: node company-blacklist.mjs <jobs.json> [--out <dir>]'); process.exitCode = 1; return; }
    const oi = argv.indexOf('--out');
    const outDir = oi >= 0 ? argv[oi + 1] : dirname(file);
    const raw = JSON.parse(readFileSync(file, 'utf8'));
    const jobs = Array.isArray(raw) ? raw : (raw.jobs || raw.data || raw.applications || []);
    const kept = []; const dropped = [];
    for (const j of jobs) { const r = blacklistReason(j); if (r) { j.blacklistedBy = r; dropped.push(j); } else kept.push(j); }
    writeFileSync(join(outDir, 'blacklist_kept.json'), JSON.stringify(kept, null, 2));
    writeFileSync(join(outDir, 'blacklist_dropped.json'), JSON.stringify(dropped, null, 2));
    console.log(`Blacklist: ${jobs.length} in -> ${kept.length} kept, ${dropped.length} dropped.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
