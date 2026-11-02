#!/usr/bin/env node
// Post-pull verifier for Hirebase results (added 2026-11-02, user directive).
//
// Why: Hirebase's own fields were wrong on two real jobs. (1) yoe_range is one
// parsed number: a posting listing "5+ years IT, 3+ years Linux, 2+ years
// Python" came back as {min: 3}, passed the 2-3 band, but the real bar was 5.
// (2) date_posted is not trustworthy for boards that publish no posted date:
// a Zoho Recruit job opened 2026-06-22 came back as 2026-11-01 (all 17 Zoho
// jobs in that pull shared one date), so the 48-hour window let it through.
//
// Usage:
//   node verify-hirebase-jobs.mjs <saved-results.json> --yoe-ceiling 3 \
//        [--window-days 2] [--tolerance-days 1] [--out <dir>] [--concurrency 5]
//
// Input: a saved Hirebase search response (object with jobs[]) or a jobs array.
// Writes to --out (default: next to the input):
//   verified_kept.json   passed both checks (date fresh or board trustworthy)
//   needs_render.json    date could not be read from the page (JS-rendered,
//                        e.g. Kronos). The caller must open the page with a
//                        rendered fetch (TinyFish fetch_content) and read the
//                        posted date; DROP the job if it still has none.
//   verify_dropped.json  dropped, each with dropReason
// Every job gets: verifiedPostedAt, dateStatus, yearsFound, yearsReview.
//
// IMPORTANT: Hirebase's `description` / `requirements_summary` are rewritten
// summaries (confirmed 2026-11-02: a posting saying "5+ years IT" came back as
// "3+ years of experience in software development"), so scanning them alone
// cannot catch a missed requirement. The verifier therefore also fetches the
// posting page itself and scans ITS text. Pages that are JS shells (too little
// text) get pageReadable=false; the caller must read those with a rendered
// fetch and run:  node verify-hirebase-jobs.mjs --scan-text <file> --yoe-ceiling N
//
// Years rule: a "general" years number (total/professional/IT/software
// experience, not tied to one tool) above the ceiling drops the job. A number
// tied to one skill above the ceiling is NOT auto-dropped; it lands in
// yearsReview for the caller's paid-Experience-entries-only skill check.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

function parseArgs(argv) {
    const a = { file: null, scanText: null, ceiling: null, windowDays: 2, tolerance: 1, out: null, concurrency: 5 };
    for (let i = 0; i < argv.length; i += 1) {
        const x = argv[i];
        if (x === '--yoe-ceiling') a.ceiling = Number(argv[++i]);
        else if (x === '--window-days') a.windowDays = Number(argv[++i]);
        else if (x === '--tolerance-days') a.tolerance = Number(argv[++i]);
        else if (x === '--out') a.out = argv[++i];
        else if (x === '--scan-text') a.scanText = argv[++i];
        else if (x === '--concurrency') a.concurrency = Number(argv[++i]);
        else if (!x.startsWith('--')) a.file = x;
    }
    return a;
}

// ---------- years scan ----------
const QUALIFIERS = new Set(['relevant', 'professional', 'industry', 'software', 'engineering', 'development', 'work', 'working', 'total', 'related', 'hands-on', 'handson', 'it', 'programming', 'overall', 'full-time', 'fulltime', 'practical', 'proven', 'progressive', 'technical', 'commercial', 'applicable', 'of', 'in', 'an', 'a', 'the', 'and', 'or']);
const GENERAL_NOUNS = /\b(software|engineering|development|information technology|it environment|industry|field|environment|role|similar|related|professional|technology|technical|the field|a similar)\b/i;

export function scanYears(text) {
    const out = [];
    if (!text) return out;
    const t = text.replace(/\s+/g, ' ');
    const re = /(\d{1,2})\s*(?:\+|plus)?\s*(?:(?:-|–|to)\s*(\d{1,2})\s*\+?\s*)?(?:years?|yrs?)\b/gi;
    let m;
    while ((m = re.exec(t))) {
        const n = Number(m[1]);
        const after = t.slice(m.index + m[0].length, m.index + m[0].length + 110);
        const before = t.slice(Math.max(0, m.index - 40), m.index);
        if (!/experience|exp\b/i.test(after.slice(0, 80)) && !/experience[:\s]*$|experience.{0,25}$/i.test(before)) continue; // company age, tenure, etc.
        if (/^\W*(old|of age|ago|in business|of history)/i.test(after)) continue;
        // words between the number and "experience"
        const expIdx = after.toLowerCase().indexOf('experience');
        let scope = 'skill';
        if (expIdx >= 0) {
            const between = after.slice(0, expIdx).toLowerCase().replace(/[^a-z\- ]/g, ' ').split(/\s+/).filter(Boolean);
            const allQualifiers = between.every((w) => QUALIFIERS.has(w));
            const tail = after.slice(expIdx + 'experience'.length, expIdx + 'experience'.length + 70);
            const tailStart = tail.trim().toLowerCase();
            const withTool = /^(with|using|working with|writing|building with)\b/.test(tailStart);
            const inGeneral = /^(in|within|as|from)\b/.test(tailStart) && GENERAL_NOUNS.test(tail.slice(0, 45));
            if (allQualifiers && !withTool && (inGeneral || !/^(in|within)\b/.test(tailStart))) scope = 'general';
        } else if (/experience\W*$/i.test(before)) {
            scope = 'general'; // "Experience: 5+ years"
        }
        out.push({ n, scope, text: t.slice(Math.max(0, m.index - 15), m.index + m[0].length + 70).trim() });
    }
    return out;
}

// ---------- posted-date extraction ----------
function parseDate(s) {
    if (!s) return null;
    const d = new Date(String(s).replace(/\\-/g, '-'));
    return Number.isNaN(d.getTime()) ? null : d;
}

export function extractPostedDate(html) {
    const h = html.replace(/\\x22/g, '"').replace(/\\u0022/g, '"').replace(/\\-/g, '-');
    let m;
    if ((m = h.match(/"datePosted"\s*:\s*"([^"]+)"/i))) { const d = parseDate(m[1]); if (d) return { date: d, via: 'json-ld datePosted' }; }
    if ((m = h.match(/"Date_Opened"\s*:\s*"(\d{4}-\d{2}-\d{2})"/))) { const d = parseDate(m[1]); if (d) return { date: d, via: 'zoho Date_Opened' }; }
    if ((m = h.match(/property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i))) { const d = parseDate(m[1]); if (d) return { date: d, via: 'meta published_time' }; }
    const text = h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    if ((m = text.match(/(?:date posted|posted on|posted|date opened|opened on)\s*[:\-]?\s*((?:[A-Z][a-z]{2,8}\.? \d{1,2},? \d{4})|(?:\d{4}-\d{2}-\d{2})|(?:\d{1,2}\/\d{1,2}\/\d{4}))/i))) { const d = parseDate(m[1]); if (d) return { date: d, via: 'page text' }; }
    return null;
}

function stripHtml(html) {
    return html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
}

function candidateUrls(job) {
    const link = job.application_link || '';
    const urls = [];
    const z = link.match(/^(https?:\/\/[^/]*zohorecruit\.[^/]+)\/jobs\/(?:Careers\/)?(\d{10,})/i);
    if (z) urls.push(`${z[1]}/jobs/Careers/${z[2]}`); // server-rendered variant carries Date_Opened
    if (link) urls.push(link);
    return [...new Set(urls)];
}

async function fetchText(url) {
    try {
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), 20000);
        const res = await fetch(url, { redirect: 'follow', signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobSeekerWorkflow-verify/1.0)' } });
        clearTimeout(timer);
        if (!res.ok) return null;
        return await res.text();
    } catch { return null; }
}

async function runPool(items, n, worker) {
    let next = 0;
    await Promise.all(Array.from({ length: n }, async () => {
        while (true) { const i = next; next += 1; if (i >= items.length) return; await worker(items[i]); }
    }));
}

// A board is date-unreliable if it is a known one, or if >=3 of its jobs in
// this batch share one date_posted for >=80% of them (a crawl-date tell).
const KNOWN_UNRELIABLE = new Set(['zohorecruit', 'kronos', 'manatal']);
function unreliableBoards(jobs) {
    const by = new Map();
    for (const j of jobs) {
        const b = j.job_board || '?';
        if (!by.has(b)) by.set(b, []);
        by.get(b).push(j.date_posted);
    }
    const set = new Set(KNOWN_UNRELIABLE);
    for (const [b, dates] of by) {
        if (dates.length < 3) continue;
        const counts = new Map();
        for (const d of dates) counts.set(d, (counts.get(d) || 0) + 1);
        if (Math.max(...counts.values()) / dates.length >= 0.8) set.add(b);
    }
    return set;
}

export async function verifyJobs(jobs, a) {
    const now = Date.now();
    const maxAgeMs = (a.windowDays + a.tolerance) * 86400000;
    const unreliable = unreliableBoards(jobs);

    const kept = []; const dropped = []; const needsRender = [];

    // 1) years scan (no network)
    const afterYears = [];
    for (const j of jobs) {
        const found = scanYears(`${j.description || ''}\n${j.requirements_summary || ''}`);
        j.yearsFound = found;
        j.yearsReview = found.filter((f) => f.scope === 'skill' && f.n > a.ceiling);
        const general = found.filter((f) => f.scope === 'general' && f.n > a.ceiling);
        if (general.length) {
            j.dropReason = `years: general requirement "${general[0].text}" exceeds ceiling ${a.ceiling}`;
            dropped.push(j);
        } else afterYears.push(j);
    }

    // 2) page fetch -> date check + page-level years scan
    await runPool(afterYears, a.concurrency, async (j) => {
        const board = j.job_board || '?';
        const listed = parseDate(j.date_posted);
        const flagged = unreliable.has(board);

        // trusted board with an out-of-window listed date: drop without a fetch
        if (!flagged && listed && now - listed.getTime() > maxAgeMs) {
            j.dateStatus = 'board-trusted';
            j.dropReason = `date: listed ${j.date_posted}, outside ${a.windowDays}d window`;
            dropped.push(j); return;
        }

        let hit = null; let pageText = '';
        for (const u of candidateUrls(j)) {
            const html = await fetchText(u);
            if (!html) continue;
            if (!hit) hit = extractPostedDate(html);
            const t = stripHtml(html);
            if (t.length > pageText.length) pageText = t;
            if (hit && pageText.length > 800) break;
        }
        j.pageReadable = pageText.length > 800;
        if (j.pageReadable) {
            j.pageYearsFound = scanYears(pageText);
            const g = j.pageYearsFound.filter((f) => f.scope === 'general' && f.n > a.ceiling);
            const sk = j.pageYearsFound.filter((f) => f.scope === 'skill' && f.n > a.ceiling);
            j.yearsReview = [...(j.yearsReview || []), ...sk];
            if (g.length) {
                j.dropReason = `years: posting page says "${g[0].text}", exceeds ceiling ${a.ceiling}`;
                dropped.push(j); return;
            }
        }

        if (!flagged) {
            j.dateStatus = 'board-trusted';
            (j.pageReadable ? kept : needsRender).push(j);
            if (!j.pageReadable) j.renderReason = 'page text unreadable: read it with a rendered fetch and run --scan-text';
            return;
        }
        if (!hit) { j.dateStatus = 'unverified'; j.renderReason = 'no posted date found in page HTML: read it with a rendered fetch, drop if still undated'; needsRender.push(j); return; }
        j.verifiedPostedAt = hit.date.toISOString().slice(0, 10);
        j.dateStatus = `verified via ${hit.via}`;
        if (now - hit.date.getTime() > maxAgeMs) { j.dropReason = `date: page says posted ${j.verifiedPostedAt} (Hirebase said ${j.date_posted}), outside ${a.windowDays}d window`; dropped.push(j); return; }
        if (!j.pageReadable) { j.renderReason = 'date verified but page text unreadable: run --scan-text on a rendered fetch'; needsRender.push(j); return; }
        kept.push(j);
    });

    return { kept, needsRender, dropped, unreliable };
}

async function main() {
    const a = parseArgs(process.argv.slice(2));
    if (a.scanText) {
        if (a.ceiling == null || Number.isNaN(a.ceiling)) { console.error('--scan-text needs --yoe-ceiling <years>'); process.exitCode = 1; return; }
        const found = scanYears(readFileSync(a.scanText, 'utf8'));
        const general = found.filter((f) => f.scope === 'general' && f.n > a.ceiling);
        console.log(JSON.stringify({ verdict: general.length ? 'DROP' : 'OK', general, found }, null, 2));
        return;
    }
    if (!a.file || a.ceiling == null || Number.isNaN(a.ceiling)) {
        console.error('Usage: node verify-hirebase-jobs.mjs <saved-results.json> --yoe-ceiling <years> [--window-days 2] [--tolerance-days 1] [--out <dir>]');
        process.exitCode = 1;
        return;
    }
    const raw = JSON.parse(readFileSync(a.file, 'utf8'));
    const jobs = Array.isArray(raw) ? raw : (raw.jobs || []);
    const outDir = a.out || dirname(a.file);
    const { kept, needsRender, dropped, unreliable } = await verifyJobs(jobs, a);
    writeFileSync(join(outDir, 'verified_kept.json'), JSON.stringify(kept, null, 2));
    writeFileSync(join(outDir, 'needs_render.json'), JSON.stringify(needsRender, null, 2));
    writeFileSync(join(outDir, 'verify_dropped.json'), JSON.stringify(dropped, null, 2));
    const byReason = (p) => dropped.filter((d) => d.dropReason.startsWith(p)).length;
    console.log(`Verify: ${jobs.length} in -> ${kept.length} kept, ${needsRender.length} need a rendered date check, ${dropped.length} dropped (${byReason('years')} years, ${byReason('date')} date).`);
    console.log(`Date-unreliable boards this batch: ${[...unreliable].join(', ')}`);
    const review = kept.filter((j) => j.yearsReview.length).length;
    if (review) console.log(`${review} kept job(s) have a skill-specific years number above ${a.ceiling}: check yearsReview against paid Experience entries.`);
    console.log(`Wrote verified_kept.json, needs_render.json, verify_dropped.json to ${outDir}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
