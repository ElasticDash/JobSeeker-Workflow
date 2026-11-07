#!/usr/bin/env node
// push-filtered-jobs.mjs
//
// Usage:
//   node push-filtered-jobs.mjs --env dev|prod --campaign <campaignId> [--admin-ed-user-id <id>] [--file <path>]
//   (a JSON array of filtered-job objects comes from --file, or stdin when --file is omitted)
//
// Pushes jobs the workflow's AI (Claude Code / GrokBot) rejected on FIT, with the reason, to
// POST /api/wideapply/admin/campaigns/:campaignId/filtered-jobs (ElasticDash-BE, AH-499).
// Jobs dropped by title, freshness (48h), US-location, the company blacklist or the seen-jobs cache are not
// AI fit judgments and must never be in the input; the blacklist is also enforced here as a last line of defense.
//
// Reads ELASTICDASH_BE_BASE_URL and WIDEAPPLY_APPLICATIONS_SERVICE_KEY from
// <repo>/.secrets/wideapply-applications-skill/.env.<env>, the same file push-applications.mjs uses. Never prints
// the key or the Authorization header. The endpoint takes up to 200 jobs per request, so this sends chunks of 200
// and reports per-item results.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { blacklistReason } from '../company-blacklist/company-blacklist.mjs';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

export const FILTER_STAGES = ['matcher_stack', 'jd_fit_gate', 'bulk_score', 'handoff'];
export const FILTER_REASON_CODES = ['skill_mismatch', 'yoe_mismatch', 'domain_gap', 'clearance', 'relocation', 'work_authorization', 'other'];
export const FILTERED_BY = ['claude_code', 'grokbot'];
export const CHUNK_SIZE = 200;

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--env') args.env = argv[++i];
        else if (argv[i] === '--campaign') args.campaign = argv[++i];
        else if (argv[i] === '--admin-ed-user-id') args.adminEdUserId = argv[++i];
        else if (argv[i] === '--file') args.file = argv[++i];
    }
    return args;
}

function loadEnvFile(path) {
    if (!existsSync(path)) throw new Error(`Env file not found: ${path}. Create it first — see push-wideapply-applications' SKILL.md.`);
    const env = {};
    for (const line of readFileSync(path, 'utf8').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
    return env;
}

async function readStdin() {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
}

/** Returns a message if the item cannot be sent, else null. Mirrors the BE's own validation. */
export function validateJob(job) {
    if (!job || typeof job !== 'object') return 'not an object';
    if (!String(job.company || '').trim() || !String(job.role || '').trim()) return 'company and role are required';
    if (!String(job.filterReason || '').trim()) return 'filterReason is required';
    if (!FILTER_STAGES.includes(job.filterStage)) return `filterStage must be one of ${FILTER_STAGES.join(', ')}`;
    if (!FILTER_REASON_CODES.includes(job.filterReasonCode)) return `filterReasonCode must be one of ${FILTER_REASON_CODES.join(', ')}`;
    if (job.filteredBy != null && !FILTERED_BY.includes(job.filteredBy)) return `filteredBy must be one of ${FILTERED_BY.join(', ')}`;
    return null;
}

export const chunk = (items, size = CHUNK_SIZE) => {
    const out = [];
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
};

async function main() {
    const { env, campaign, adminEdUserId, file } = parseArgs(process.argv.slice(2));
    if (!env || !['dev', 'prod'].includes(env) || !campaign) {
        console.error('Usage: node push-filtered-jobs.mjs --env dev|prod --campaign <campaignId> [--admin-ed-user-id <id>] [--file <path>]  (JSON array via --file or stdin)');
        process.exitCode = 1;
        return;
    }

    let jobs;
    try {
        jobs = JSON.parse(file ? readFileSync(file, 'utf8') : await readStdin());
    } catch {
        console.error('Input must be a JSON array of filtered-job objects.');
        process.exitCode = 1;
        return;
    }
    if (!Array.isArray(jobs) || jobs.length === 0) {
        console.error('Nothing to push: input must be a non-empty array.');
        process.exitCode = 1;
        return;
    }

    // Validate and blacklist-screen client-side so one bad item never costs a round trip; both are reported, not fatal.
    const skipped = [];
    const sendable = [];
    jobs.forEach((job, index) => {
        const invalid = validateJob(job);
        if (invalid) return skipped.push({ index, company: job?.company, role: job?.role, error: invalid });
        const why = blacklistReason(job);
        if (why) return skipped.push({ index, company: job.company, role: job.role, error: `Blacklisted company (${why}); not recorded.` });
        sendable.push({ index, job });
    });
    if (sendable.length === 0) {
        console.log(JSON.stringify({ ok: false, env, campaign, created: 0, updated: 0, rejected: 0, skipped }));
        process.exitCode = 1;
        return;
    }

    let vars;
    try {
        vars = loadEnvFile(join(REPO_ROOT, '.secrets', 'wideapply-applications-skill', `.env.${env}`));
    } catch (err) {
        console.error(err.message);
        process.exitCode = 1;
        return;
    }
    const baseUrl = vars.ELASTICDASH_BE_BASE_URL;
    const key = vars.WIDEAPPLY_APPLICATIONS_SERVICE_KEY;
    if (!baseUrl || !key) {
        console.error('The env file is missing ELASTICDASH_BE_BASE_URL or WIDEAPPLY_APPLICATIONS_SERVICE_KEY.');
        process.exitCode = 1;
        return;
    }
    const resolvedAdminEdUserId = adminEdUserId || vars.WIDEAPPLY_ADMIN_ED_USER_ID || undefined;
    const url = `${baseUrl.replace(/\/$/, '')}/api/wideapply/admin/campaigns/${campaign}/filtered-jobs`;

    const totals = { created: 0, updated: 0, rejected: 0 };
    const failures = [];
    for (const batch of chunk(sendable)) {
        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
                body: JSON.stringify({ jobs: batch.map((b) => b.job), adminEdUserId: resolvedAdminEdUserId }),
            });
        } catch {
            failures.push({ error: `Could not reach ${baseUrl}.`, count: batch.length });
            continue;
        }
        const raw = await response.text();
        let parsed = null;
        try { parsed = JSON.parse(raw); } catch { /* raw stays the fallback message */ }
        if (!response.ok) {
            failures.push({ status: response.status, error: parsed?.message ?? (raw || 'Unknown error'), count: batch.length });
            continue;
        }
        const result = parsed?.result ?? parsed;
        totals.created += result.created || 0;
        totals.updated += result.updated || 0;
        totals.rejected += result.rejected || 0;
        (result.results || []).filter((r) => r.status === 'rejected').forEach((r) => {
            const original = batch[r.index];
            skipped.push({ index: original?.index, company: original?.job.company, role: original?.job.role, error: r.error });
        });
    }

    const ok = failures.length === 0 && totals.rejected === 0;
    console.log(JSON.stringify({ ok, env, campaign, ...totals, skipped, failures }));
    if (failures.length) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
