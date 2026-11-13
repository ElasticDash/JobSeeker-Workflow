#!/usr/bin/env node
// push-applications.mjs
//
// Usage:
//   node push-applications.mjs --env dev|prod --campaign <campaignId> [--admin-ed-user-id <id>]
//   (a JSON array of application objects is piped in via stdin)
//
// --admin-ed-user-id (or WIDEAPPLY_ADMIN_ED_USER_ID in the env file below) is
// required by the backend's requireWideapplyAdmin middleware on every write -
// it must resolve to a real, active admin account. Without it every POST
// 400s with "adminEdUserId is required and must identify a real admin
// account." See push-document.mjs for the same pattern.
//
// Reads ELASTICDASH_BE_BASE_URL and WIDEAPPLY_APPLICATIONS_SERVICE_KEY from
// <repo>/.secrets/wideapply-applications-skill/.env.<env> — inside this
// repo, but outside .claude/skills/ (which is treated as distributable
// skill definitions, not a place for real credentials) and gitignored
// wholesale (see .gitignore's `.secrets/` line), so it never gets committed
// or swept up by a skill-package listing. Never prints the key, the
// Authorization header, or the env file's contents — only status/counts/
// errors from the response.
//
// Unlike push-leads.mjs (one POST, array body), the applications endpoint
// only accepts one application per POST, so this script loops and does one
// request per item, collecting per-item success/failure rather than
// aborting the whole batch on the first error.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { blacklistReason } from '../company-blacklist/company-blacklist.mjs';
import { cleanCompanyWebsite, applicationsWithoutWebsite } from './company-website.mjs';
import { reviewJobUrls, forcedAtsFor } from './job-url-platform.mjs';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const APPLICATION_STATUSES = ['found', 'applied', 'screening', 'interview', 'offer', 'closed'];

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--env') args.env = argv[++i];
        else if (argv[i] === '--campaign') args.campaign = argv[++i];
        else if (argv[i] === '--admin-ed-user-id') args.adminEdUserId = argv[++i];
    }
    return args;
}

function loadEnvFile(path) {
    if (!existsSync(path)) {
        throw new Error(`Env file not found: ${path}. Create it first — see this skill's SKILL.md.`);
    }
    const text = readFileSync(path, 'utf8');
    const env = {};
    for (const line of text.split('\n')) {
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

async function main() {
    const { env, campaign, adminEdUserId } = parseArgs(process.argv.slice(2));
    if (!env || !['dev', 'prod'].includes(env)) {
        console.error('Usage: node push-applications.mjs --env dev|prod --campaign <campaignId> [--admin-ed-user-id <id>]  (applications JSON array via stdin)');
        process.exitCode = 1;
        return;
    }
    if (!campaign) {
        console.error('--campaign is required.');
        process.exitCode = 1;
        return;
    }

    let applications;
    try {
        applications = JSON.parse(await readStdin());
    } catch {
        console.error('stdin must be a JSON array of application objects.');
        process.exitCode = 1;
        return;
    }
    if (!Array.isArray(applications) || applications.length === 0) {
        console.error('applications must be a non-empty array.');
        process.exitCode = 1;
        return;
    }
    for (const [i, app] of applications.entries()) {
        if (!app || !String(app.company || '').trim() || !String(app.role || '').trim()) {
            console.error(`Item ${i} is missing company and/or role — both are required.`);
            process.exitCode = 1;
            return;
        }
        if (app.status && !APPLICATION_STATUSES.includes(app.status)) {
            console.error(`Item ${i} has invalid status "${app.status}". Must be one of: ${APPLICATION_STATUSES.join(', ')}`);
            process.exitCode = 1;
            return;
        }
    }

    // companyWebsite (2026-11-06): the BE 400s a malformed value and that would fail the whole application, so a
    // value that is not a plausible company site (LinkedIn, a job board, an ATS host...) is dropped here and reported.
    const droppedWebsites = [];
    for (const [i, app] of applications.entries()) {
        if (app.companyWebsite === undefined || app.companyWebsite === null) continue;
        const cleaned = cleanCompanyWebsite(app.companyWebsite);
        if (!cleaned) droppedWebsites.push({ index: i, company: app.company, value: String(app.companyWebsite) });
        app.companyWebsite = cleaned || undefined;
    }
    if (droppedWebsites.length) console.error(`companyWebsite: dropped ${droppedWebsites.length} value(s) that are not a company site: ${droppedWebsites.map((d) => `${d.company} (${d.value})`).join(', ')}`);

    // Visible, never blocking: rows still without a website cannot get a BE-written cover letter (find-company-website).
    const noWebsite = applicationsWithoutWebsite(applications);
    if (noWebsite.length) console.error(`companyWebsite: ${noWebsite.length} application(s) still have no company website: ${noWebsite.map((a) => a.company).join(', ')}`);

    // Job board URLs (AH-504): auto-apply can only drive the employer's ATS. A Built In URL is never logged (user
    // directive 2026-11-01), so it is skipped and reported. LinkedIn, Wellfound and other boards may still be applied
    // to, so they are pushed but listed, which keeps a skipped ATS-resolution step visible instead of silent.
    // forcedAts (2026-11-11): kept only when the link host does not already show the ATS (the BE 400s otherwise) and
    // the value is one the BE accepts; anything else is removed here so one bad value cannot fail the application.
    for (const app of applications) {
        if (app.forcedAts === undefined || app.forcedAts === null) continue;
        const ok = forcedAtsFor(app.forcedAts, app.jobPostUrl);
        if (!ok) console.error(`forcedAts: dropped "${app.forcedAts}" for ${app.company} (${app.role}): link host already recognised or ATS not forceable.`);
        app.forcedAts = ok;
    }
    const urlReview = reviewJobUrls(applications);
    const refusedBuiltIn = urlReview.refused.map((r) => ({ index: r.index, ok: false, company: r.company, role: r.role, error: 'Built In only, no ATS URL found; not written. Resolve the employer ATS URL first.' }));
    if (refusedBuiltIn.length) {
        const drop = new Set(urlReview.refused.map((r) => r.index));
        applications = applications.filter((_, i) => !drop.has(i));
        console.error(`jobPostUrl: skipped ${refusedBuiltIn.length} Built In application(s) with no ATS URL: ${urlReview.refused.map((r) => r.company).join(', ')}`);
    }
    const onBoardNow = reviewJobUrls(applications).onBoard;
    if (onBoardNow.length) console.error(`jobPostUrl: ${onBoardNow.length} application(s) still point at a job board, not an employer ATS: ${onBoardNow.map((r) => `${r.company} (${r.platform})`).join(', ')}`);
    console.error(`jobPostUrl: ${urlReview.counts.employerAts} employer ATS, ${urlReview.counts.board} job board, ${urlReview.counts.unknown} other`);

    // Company blacklist (2026-10-30): never write these, regardless of which
    // channel sourced them. Skipped and reported, not an abort.
    const blocked = [...refusedBuiltIn];
    applications = applications.filter((app, i) => {
        const why = blacklistReason(app);
        if (why) blocked.push({ index: i, ok: false, company: app.company, role: app.role, error: `Blacklisted company (${why}); not written.` });
        return !why;
    });
    if (blocked.length) console.error(`Skipped ${blocked.length} application(s) (blacklist or Built In): ${blocked.map((b) => b.company).join(', ')}`);
    if (applications.length === 0) {
        console.error('Nothing left to push after blacklist.');
        process.exitCode = blocked.length ? 0 : 1;
        return;
    }

    const envFile = join(REPO_ROOT, '.secrets', 'wideapply-applications-skill', `.env.${env}`);
    let vars;
    try {
        vars = loadEnvFile(envFile);
    } catch (err) {
        console.error(err.message);
        process.exitCode = 1;
        return;
    }

    const baseUrl = vars.ELASTICDASH_BE_BASE_URL;
    const key = vars.WIDEAPPLY_APPLICATIONS_SERVICE_KEY;
    if (!baseUrl || !key) {
        console.error(`${envFile} is missing ELASTICDASH_BE_BASE_URL or WIDEAPPLY_APPLICATIONS_SERVICE_KEY.`);
        process.exitCode = 1;
        return;
    }

    const resolvedAdminEdUserId = adminEdUserId || vars.WIDEAPPLY_ADMIN_ED_USER_ID || '';

    const url = `${baseUrl.replace(/\/$/, '')}/api/wideapply/admin/campaigns/${campaign}/applications`;
    const results = [];
    let anyFailed = false;

    for (const [i, app] of applications.entries()) {
        // status defaults to 'found' here (the whole point of this skill) —
        // the backend itself defaults an omitted status to 'applied', so an
        // explicit default has to be set client-side or every push would
        // silently land as 'applied' instead.
        const body = { status: 'found', ...app, adminEdUserId: resolvedAdminEdUserId || undefined };

        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${key}`,
                },
                body: JSON.stringify(body),
            });
        } catch {
            results.push({ index: i, ok: false, company: app.company, role: app.role, error: `Could not reach ${baseUrl}.` });
            anyFailed = true;
            continue;
        }

        const rawBody = await response.text();
        let parsed = null;
        try {
            parsed = JSON.parse(rawBody);
        } catch {
            // rawBody stays the fallback message below.
        }

        if (!response.ok) {
            const message = parsed?.message ?? (rawBody || 'Unknown error');
            // A 408 here is the backend's own timeout response, not proof the insert
            // failed — confirmed on a real dev run where an item reported as a 408
            // had actually been created server-side anyway. Treat any timeout as a
            // presumed success and never retry it: retrying risks a duplicate insert
            // of a row that already landed. No `id` is available from a timeout
            // response, so this can't be confirmed from here — check the dashboard
            // if the id is needed.
            const isTimeout = response.status === 408 || /timeout/i.test(message);
            if (isTimeout) {
                results.push({
                    index: i,
                    ok: true,
                    company: app.company,
                    role: app.role,
                    id: null,
                    assumedSuccess: true,
                    note: `Request timed out (${message}) — presumed to have succeeded server-side; do not retry.`,
                });
                continue;
            }
            results.push({ index: i, ok: false, company: app.company, role: app.role, status: response.status, error: message });
            anyFailed = true;
            continue;
        }

        const created = parsed?.result ?? parsed;
        results.push({ index: i, ok: true, company: app.company, role: app.role, id: created?.id ?? null });
    }

    console.log(JSON.stringify({ ok: !anyFailed, env, campaign, count: results.length, results }));
    if (anyFailed) process.exitCode = 1;
}

main();
