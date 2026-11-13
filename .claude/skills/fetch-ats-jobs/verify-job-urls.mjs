// verify-job-urls.mjs
//
// Page-level URL check for fetch-ats-jobs.mjs. An ATS JSON API listing a job does not mean the public
// page for it still exists: Cursor's Ashby API listed 116 jobs while jobs.ashbyhq.com/cursor and every
// job page under it returned 404 (the company moved its postings to cursor.com/careers), and the
// 8 Cursor rows logged from it had to be fixed by hand (2026-11-11). So every kept job's URL is fetched.
//
// Per job: try job.url, then any company-specific replacement URL (COMPANY_URL_OVERRIDES).
//   live        job.url answered 200
//   rewritten   job.url was dead, a replacement answered 200; job.url is now the replacement,
//               job.urlOriginal keeps the ATS URL
//   dead        every candidate answered 404/410 (or a closed-posting redirect): dropped by default
//   unverified  timeout, 429, 5xx or network error: kept, but flagged so it is not mistaken for live
//
// To handle another company whose hosted board is gone, add a row to COMPANY_URL_OVERRIDES.

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

export function slugifyTitle(title) {
    return String(title || '').toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// key: lowercase company name as it appears in sources.csv (a "(...)" suffix is ignored)
export const COMPANY_URL_OVERRIDES = {
    cursor: (job) => [`https://cursor.com/careers/${slugifyTitle(job.title)}`],
};

function overrideKey(company) {
    return String(company || '').toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
}

export function candidateUrls(job) {
    const extra = COMPANY_URL_OVERRIDES[overrideKey(job.company)];
    return [job.url, ...(extra ? extra(job) : [])].filter(Boolean);
}

// -> 'live' | 'dead' | 'unknown'
export async function probeUrl(url, { fetchImpl = fetch, timeoutMs = 15000 } = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetchImpl(url, { headers: { 'user-agent': BROWSER_UA, accept: 'text/html' }, redirect: 'follow', signal: ctrl.signal });
        if (res.status === 404 || res.status === 410) return 'dead';
        if (res.status !== 200) return 'unknown';
        // Greenhouse redirects a closed posting to its board with ?error=true
        if (/[?&]error=true\b/.test(res.url || '')) return 'dead';
        return 'live';
    } catch {
        return 'unknown';
    } finally {
        clearTimeout(timer);
    }
}

export async function resolveJobUrl(job, opts = {}) {
    const urls = candidateUrls(job);
    let sawUnknown = false;
    for (let i = 0; i < urls.length; i += 1) {
        const state = await probeUrl(urls[i], opts);
        if (state === 'live') {
            if (i === 0) return { urlStatus: 'live', url: job.url };
            return { urlStatus: 'rewritten', url: urls[i], urlOriginal: job.url };
        }
        if (state === 'unknown') sawUnknown = true;
    }
    return { urlStatus: sawUnknown ? 'unverified' : 'dead', url: job.url };
}

// Mutates each job (url, urlStatus, urlOriginal); returns counts and the dead list.
export async function verifyJobUrls(jobs, { concurrency = 8, ...opts } = {}) {
    const counts = { live: 0, rewritten: 0, dead: 0, unverified: 0 };
    let next = 0;
    async function worker() {
        while (next < jobs.length) {
            const j = jobs[next++];
            const r = await resolveJobUrl(j, opts);
            j.urlStatus = r.urlStatus;
            if (r.urlOriginal) j.urlOriginal = r.urlOriginal;
            j.url = r.url;
            counts[r.urlStatus] += 1;
        }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));
    return counts;
}
