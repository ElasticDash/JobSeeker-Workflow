#!/usr/bin/env node
// fetch-ats-jobs.mjs
//
// Usage:
//   node .claude/skills/fetch-ats-jobs/fetch-ats-jobs.mjs \
//     --sources .temp/grokbot/sources.csv \
//     --out .temp/grokbot/fetched_jobs \
//     --days 7
//
// Reads a sources.csv (columns: source,kind,platform,url,...) and, for every
// row whose `kind` is "company" and whose `platform` is one of the ATS
// providers that expose a public JSON jobs API (greenhouse, ashby, lever,
// workday), fetches that company's open postings directly from the ATS's own
// JSON endpoint instead of via the TinyFish/browser investigation the rest of
// sources.csv records. Keeps only postings first published within the last
// `--days` days (default 7).
//
// Rows with kind "board" (Work at a Startup, Wellfound, Built In, HiringCafe,
// ...) or platform "custom" are skipped and reported as such in the summary:
// multi-company boards and bespoke career pages don't expose a uniform JSON
// API the way Greenhouse/Ashby/Lever/Workday do, so pulling those stays a
// separate (browser-driven) effort.
//
// Writes one JSON file per company to --out, plus _summary.json/.csv and
// all_jobs.json (every in-window job across every company, flattened, for a
// later local job-matching pass against a candidate profile).

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const SUPPORTED_PLATFORMS = new Set(['greenhouse', 'ashby', 'lever', 'workday']);
const USER_AGENT = 'Mozilla/5.0 (compatible; JobSeekerWorkflow-fetch-ats-jobs/1.0)';

function parseArgs(argv) {
    const args = { sources: null, out: null, days: 7, companyConcurrency: 5, workdayDelayMs: 150 };
    for (let i = 0; i < argv.length; i += 1) {
        const a = argv[i];
        if (a === '--sources') args.sources = argv[++i];
        else if (a === '--out') args.out = argv[++i];
        else if (a === '--days') args.days = Number(argv[++i]);
        else if (a === '--concurrency') args.companyConcurrency = Number(argv[++i]);
        else if (a === '--workday-delay-ms') args.workdayDelayMs = Number(argv[++i]);
    }
    return args;
}

// --- minimal RFC4180-ish CSV parser (handles quoted fields, "" escapes, embedded commas/newlines) ---
function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i += 1) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"') {
                if (text[i + 1] === '"') { field += '"'; i += 1; }
                else inQuotes = false;
            } else {
                field += c;
            }
        } else if (c === '"') {
            inQuotes = true;
        } else if (c === ',') {
            row.push(field); field = '';
        } else if (c === '\r') {
            // ignore, \n handles the line break
        } else if (c === '\n') {
            row.push(field); field = '';
            rows.push(row); row = [];
        } else {
            field += c;
        }
    }
    if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
    const nonEmpty = rows.filter((r) => !(r.length === 1 && r[0] === ''));
    const header = nonEmpty[0];
    return nonEmpty.slice(1).map((r) => {
        const obj = {};
        header.forEach((h, idx) => { obj[h] = r[idx] ?? ''; });
        return obj;
    });
}

function slugify(s) {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'company';
}

async function fetchJson(url, options = {}, { timeoutMs = 20000, retries = 1 } = {}) {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: { 'User-Agent': USER_AGENT, ...(options.headers || {}) },
            });
            clearTimeout(timer);
            const text = await res.text();
            if (!res.ok) {
                if (attempt < retries) continue;
                return { ok: false, status: res.status, error: text.slice(0, 300) };
            }
            try {
                return { ok: true, status: res.status, data: JSON.parse(text) };
            } catch {
                if (attempt < retries) continue;
                return { ok: false, status: res.status, error: 'non-JSON response' };
            }
        } catch (err) {
            clearTimeout(timer);
            if (attempt < retries) continue;
            return { ok: false, status: null, error: err.message };
        }
    }
    return { ok: false, status: null, error: 'unreachable' };
}

function lastPathSegment(url) {
    try {
        const u = new URL(url);
        const segs = u.pathname.split('/').filter(Boolean);
        return segs[segs.length - 1] || null;
    } catch {
        return null;
    }
}

// --- platform-specific slug/tenant extraction ---

function extractGreenhouseSlug(url) {
    const seg = lastPathSegment(url);
    return seg ? decodeURIComponent(seg) : null;
}

function extractAshbySlug(url) {
    const seg = lastPathSegment(url);
    return seg ? decodeURIComponent(seg) : null;
}

function extractLeverSlug(url) {
    const seg = lastPathSegment(url);
    return seg ? decodeURIComponent(seg) : null;
}

function extractWorkday(url) {
    try {
        const u = new URL(url);
        // host: {tenant}.{wdHost}.myworkdayjobs.com
        const hostParts = u.hostname.split('.');
        const wdIdx = hostParts.findIndex((p) => /^wd\d+$/i.test(p));
        if (wdIdx < 1) return null;
        const tenant = hostParts[wdIdx - 1];
        const wdHost = hostParts[wdIdx];
        const segs = u.pathname.split('/').filter(Boolean);
        if (segs.length === 0) return null;
        const site = decodeURIComponent(segs[segs.length - 1]);
        const basePath = `/${segs.join('/')}`;
        return { tenant, wdHost, site, basePath };
    } catch {
        return null;
    }
}

// --- fetchers, one per ATS ---

async function fetchGreenhouse(slug, cutoff) {
    const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs?content=true`;
    const res = await fetchJson(url);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status ?? '?'}: ${res.error}` };
    const all = res.data.jobs || [];
    const jobs = all
        .filter((j) => j.first_published && new Date(j.first_published) >= cutoff)
        .map((j) => ({
            title: j.title,
            location: j.location?.name ?? null,
            postedAt: j.first_published,
            updatedAt: j.updated_at,
            url: j.absolute_url,
            descriptionHtml: j.content ?? null,
            sourceId: String(j.id),
        }));
    return { ok: true, totalOpen: all.length, jobs };
}

async function fetchAshby(slug, cutoff) {
    const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(slug)}?includeCompensation=true`;
    const res = await fetchJson(url);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status ?? '?'}: ${res.error}` };
    const all = res.data.jobs || [];
    const jobs = all
        .filter((j) => j.publishedAt && new Date(j.publishedAt) >= cutoff)
        .map((j) => ({
            title: j.title,
            location: j.location ?? null,
            isRemote: j.isRemote ?? null,
            postedAt: j.publishedAt,
            url: j.jobUrl,
            descriptionHtml: j.descriptionHtml ?? null,
            sourceId: j.id,
        }));
    return { ok: true, totalOpen: all.length, jobs };
}

async function fetchLever(slug, cutoff) {
    const url = `https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`;
    const res = await fetchJson(url);
    if (!res.ok) return { ok: false, error: `HTTP ${res.status ?? '?'}: ${res.error}` };
    const all = Array.isArray(res.data) ? res.data : [];
    const jobs = all
        .filter((j) => typeof j.createdAt === 'number' && new Date(j.createdAt) >= cutoff)
        .map((j) => ({
            title: j.text,
            location: j.categories?.location ?? null,
            team: j.categories?.team ?? null,
            postedAt: new Date(j.createdAt).toISOString(),
            url: j.hostedUrl,
            descriptionHtml: j.description ?? j.descriptionPlain ?? null,
            sourceId: j.id,
        }));
    return { ok: true, totalOpen: all.length, jobs };
}

function parseWorkdayPostedOn(text) {
    if (!text) return Infinity;
    const t = text.trim().toLowerCase();
    if (t.includes('today')) return 0;
    if (t.includes('yesterday')) return 1;
    const m = t.match(/(\d+)\+?\s*day/);
    if (m) return Number(m[1]);
    return Infinity;
}

async function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function fetchWorkday(parsed, cutoffDate, days, delayMs) {
    const { tenant, wdHost, site, basePath } = parsed;
    const listUrl = `https://${tenant}.${wdHost}.myworkdayjobs.com/wday/cxs/${tenant}/${site}/jobs`;
    const limit = 20;
    const maxPages = 250; // hard safety cap (5000 postings) in case sort-by-recency assumption fails
    let offset = 0;
    let total = null;
    const candidates = [];
    for (let page = 0; page < maxPages; page += 1) {
        const res = await fetchJson(listUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appliedFacets: {}, limit, offset, searchText: '' }),
        });
        if (!res.ok) {
            if (page === 0) return { ok: false, error: `HTTP ${res.status ?? '?'}: ${res.error}` };
            break; // partial results are still useful
        }
        if (total === null) total = res.data.total ?? null;
        const postings = res.data.jobPostings || [];
        if (postings.length === 0) break;
        let sawFresh = false;
        for (const p of postings) {
            const daysAgo = parseWorkdayPostedOn(p.postedOn);
            if (daysAgo <= days) {
                sawFresh = true;
                candidates.push(p);
            }
        }
        // results are sorted by recency (newest first); once a whole page is
        // older than the window, nothing further will qualify.
        if (!sawFresh) break;
        offset += limit;
        if (offset >= (total ?? Infinity)) break;
        await sleep(delayMs);
    }

    // Fetch each candidate's detail page for an exact startDate + full description.
    const jobs = [];
    for (const p of candidates) {
        const detailUrl = `https://${tenant}.${wdHost}.myworkdayjobs.com/wday/cxs/${tenant}/${site}${p.externalPath}`;
        const detail = await fetchJson(detailUrl);
        const info = detail.ok ? detail.data.jobPostingInfo : null;
        const postedAt = info?.startDate ?? null;
        if (postedAt && new Date(postedAt) < cutoffDate) {
            // detail-level exact date disagrees with the relative-text estimate; drop it.
            continue;
        }
        jobs.push({
            title: p.title,
            location: p.locationsText ?? null,
            remoteType: p.remoteType ?? info?.remoteType ?? null,
            postedAt: postedAt ?? null,
            postedOnText: p.postedOn,
            url: `https://${tenant}.${wdHost}.myworkdayjobs.com${basePath}${p.externalPath}`,
            descriptionHtml: info?.jobDescription ?? null,
            sourceId: info?.jobReqId ?? (p.bulletFields || [])[0] ?? null,
        });
        await sleep(delayMs);
    }
    return { ok: true, totalOpen: total, jobs };
}

async function runPool(items, concurrency, worker) {
    const results = new Array(items.length);
    let next = 0;
    async function lane() {
        while (true) {
            const i = next; next += 1;
            if (i >= items.length) return;
            results[i] = await worker(items[i], i);
        }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, lane));
    return results;
}

async function processRow(row, days, workdayDelayMs) {
    const company = row.source;
    const platform = (row.platform || '').trim().toLowerCase();
    const kind = (row.kind || '').trim().toLowerCase();
    const url = row.url;
    const cutoff = new Date(Date.now() - days * 86400000);

    if (kind !== 'company') {
        return { company, platform, kind, url, skipped: true, reason: `kind "${kind}" is a multi-company board, not a single-company ATS JSON endpoint` };
    }
    if (!SUPPORTED_PLATFORMS.has(platform)) {
        return { company, platform, kind, url, skipped: true, reason: `platform "${platform || '(blank)'}" has no generic public JSON jobs API` };
    }

    try {
        let result;
        if (platform === 'greenhouse') {
            const slug = extractGreenhouseSlug(url);
            if (!slug) return { company, platform, kind, url, skipped: true, reason: 'could not extract Greenhouse board slug from URL' };
            result = await fetchGreenhouse(slug, cutoff);
        } else if (platform === 'ashby') {
            const slug = extractAshbySlug(url);
            if (!slug) return { company, platform, kind, url, skipped: true, reason: 'could not extract Ashby org slug from URL' };
            result = await fetchAshby(slug, cutoff);
        } else if (platform === 'lever') {
            const slug = extractLeverSlug(url);
            if (!slug) return { company, platform, kind, url, skipped: true, reason: 'could not extract Lever org slug from URL' };
            result = await fetchLever(slug, cutoff);
        } else if (platform === 'workday') {
            const parsed = extractWorkday(url);
            if (!parsed) return { company, platform, kind, url, skipped: true, reason: 'could not extract Workday tenant/site from URL' };
            result = await fetchWorkday(parsed, cutoff, days, workdayDelayMs);
        }

        if (!result.ok) {
            return { company, platform, kind, url, skipped: true, reason: `fetch failed: ${result.error}` };
        }
        return {
            company, platform, kind, url, skipped: false,
            totalOpen: result.totalOpen ?? null,
            jobsInWindow: result.jobs.length,
            jobs: result.jobs.map((j) => ({ company, platform, ...j })),
        };
    } catch (err) {
        return { company, platform, kind, url, skipped: true, reason: `unhandled error: ${err.message}` };
    }
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (!args.sources) {
        console.error('Usage: node fetch-ats-jobs.mjs --sources <sources.csv> [--out <dir>] [--days 7] [--concurrency 5]');
        process.exitCode = 1;
        return;
    }
    const sourcesPath = args.sources.startsWith('/') ? args.sources : join(REPO_ROOT, args.sources);
    const outDir = args.out
        ? (args.out.startsWith('/') ? args.out : join(REPO_ROOT, args.out))
        : join(REPO_ROOT, '.temp', 'grokbot', 'fetched_jobs');
    mkdirSync(outDir, { recursive: true });

    const csvText = readFileSync(sourcesPath, 'utf8');
    const rows = parseCsv(csvText);
    console.log(`Loaded ${rows.length} rows from ${sourcesPath}. Fetching postings within ${args.days} days...`);

    const results = await runPool(rows, args.companyConcurrency, (row) => processRow(row, args.days, args.workdayDelayMs));

    const summary = [];
    const allJobs = [];
    for (const r of results) {
        if (r.skipped) {
            summary.push({ company: r.company, platform: r.platform, kind: r.kind, url: r.url, skipped: true, reason: r.reason, totalOpen: null, jobsInWindow: null });
            console.log(`  SKIP   ${r.company} (${r.platform || r.kind}) — ${r.reason}`);
            continue;
        }
        summary.push({ company: r.company, platform: r.platform, kind: r.kind, url: r.url, skipped: false, reason: null, totalOpen: r.totalOpen, jobsInWindow: r.jobsInWindow });
        console.log(`  OK     ${r.company} (${r.platform}) — ${r.jobsInWindow}/${r.totalOpen ?? '?'} open postings within window`);
        const fileName = `${r.platform}_${slugify(r.company)}.json`;
        writeFileSync(join(outDir, fileName), JSON.stringify({
            company: r.company, platform: r.platform, sourceUrl: r.url,
            fetchedAt: new Date().toISOString(), windowDays: args.days,
            totalOpenPostings: r.totalOpen, jobsInWindow: r.jobs.length,
            jobs: r.jobs,
        }, null, 2), 'utf8');
        allJobs.push(...r.jobs);
    }

    writeFileSync(join(outDir, '_summary.json'), JSON.stringify(summary, null, 2), 'utf8');
    const csvHeader = 'company,platform,kind,skipped,reason,totalOpen,jobsInWindow,url';
    const csvLines = summary.map((s) => [
        s.company, s.platform, s.kind, s.skipped, (s.reason || '').replace(/"/g, '""'),
        s.totalOpen ?? '', s.jobsInWindow ?? '', s.url,
    ].map((v) => `"${String(v)}"`).join(','));
    writeFileSync(join(outDir, '_summary.csv'), [csvHeader, ...csvLines].join('\n'), 'utf8');
    writeFileSync(join(outDir, 'all_jobs.json'), JSON.stringify(allJobs, null, 2), 'utf8');

    const okCount = summary.filter((s) => !s.skipped).length;
    const skipCount = summary.length - okCount;
    console.log(`\nDone. ${okCount} companies fetched, ${skipCount} skipped, ${allJobs.length} jobs within ${args.days} days total.`);
    console.log(`Per-company files + _summary.json/.csv + all_jobs.json written to ${outDir}`);
}

main();
