#!/usr/bin/env node
// regenerate-resume.mjs
//
// Usage:
//   node regenerate-resume.mjs --env dev|prod --campaign <campaignId> --application <applicationId> [--admin-ed-user-id <id>] [--poll-interval-ms 3000] [--poll-timeout-ms 120000]
//
// Drives wideapply-campaign-pipeline's Stage 2a backend-generation path end
// to end, as three calls against ElasticDash-BE's admin campaign-application
// routes:
//   1. POST .../applications/:applicationId/regenerate-resume  { adminEdUserId }
//      Kicks off generation server-side (LLM call runs in the background,
//      this call just marks tailored_resume_status = 'generating').
//   2. GET  .../applications/:applicationId  (polled on an interval until
//      tailored_resume_status leaves 'generating' -- 'ready' or 'error')
//   3. POST .../applications/:applicationId/generate-resume-files { adminEdUserId }
//      Renders tailored_resume_text into the .docx/.pdf pair and attaches
//      them directly as the application's cv_source/cv documents server-side
//      -- no local file, no push-resume-to-application call needed after this.
//
// Reads ELASTICDASH_BE_BASE_URL, WIDEAPPLY_RESUME_ADMIN_SERVICE_KEY and the
// optional WIDEAPPLY_ADMIN_ED_USER_ID from
// <repo>/.secrets/wideapply-resume-admin-skill/.env.<env> -- same pattern as
// every other scoped-key skill in this repo. Never prints the key, the
// Authorization header, or the env file's contents -- only status/errors.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function parseArgs(argv) {
    const args = { pollIntervalMs: 3000, pollTimeoutMs: 120000 };
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--env') args.env = argv[++i];
        else if (argv[i] === '--campaign') args.campaign = argv[++i];
        else if (argv[i] === '--application') args.application = argv[++i];
        else if (argv[i] === '--admin-ed-user-id') args.adminEdUserId = argv[++i];
        else if (argv[i] === '--poll-interval-ms') args.pollIntervalMs = Number(argv[++i]);
        else if (argv[i] === '--poll-timeout-ms') args.pollTimeoutMs = Number(argv[++i]);
    }
    return args;
}

function loadEnvFile(path) {
    if (!existsSync(path)) {
        throw new Error(`Env file not found: ${path}. Create it first -- see this skill's SKILL.md ("One-time setup").`);
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

async function readErrorMessage(response) {
    const rawBody = await response.text();
    try {
        const parsed = JSON.parse(rawBody);
        return parsed?.message ?? rawBody ?? 'Unknown error';
    } catch {
        return rawBody || 'Unknown error';
    }
}

async function postAction({ baseUrl, key, campaign, application, action, adminEdUserId }) {
    const url = `${baseUrl.replace(/\/$/, '')}/api/wideapply/admin/campaigns/${campaign}/applications/${application}/${action}`;
    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
            body: JSON.stringify({ adminEdUserId: adminEdUserId || undefined }),
        });
    } catch {
        return { ok: false, error: `Could not reach ${baseUrl} to call ${action}.` };
    }
    if (!response.ok) {
        return { ok: false, status: response.status, error: await readErrorMessage(response) };
    }
    const rawBody = await response.text();
    let parsed = null;
    try { parsed = JSON.parse(rawBody); } catch { /* leave null */ }
    return { ok: true, result: parsed };
}

async function getApplication({ baseUrl, key, campaign, application }) {
    const url = `${baseUrl.replace(/\/$/, '')}/api/wideapply/admin/campaigns/${campaign}/applications/${application}`;
    let response;
    try {
        response = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    } catch {
        return { ok: false, error: `Could not reach ${baseUrl} to read the application.` };
    }
    if (!response.ok) {
        return { ok: false, status: response.status, error: await readErrorMessage(response) };
    }
    const rawBody = await response.text();
    let parsed = null;
    try { parsed = JSON.parse(rawBody); } catch { /* leave null */ }
    const app = parsed?.result ?? parsed ?? {};
    return { ok: true, app };
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollUntilDone({ baseUrl, key, campaign, application, pollIntervalMs, pollTimeoutMs }) {
    const deadline = Date.now() + pollTimeoutMs;
    for (;;) {
        const got = await getApplication({ baseUrl, key, campaign, application });
        if (!got.ok) return got;
        const status = got.app?.tailored_resume_status;
        if (status !== 'generating') {
            return { ok: true, status, app: got.app };
        }
        if (Date.now() >= deadline) {
            return { ok: false, error: `Timed out after ${pollTimeoutMs}ms waiting for tailored_resume_status to leave 'generating'.` };
        }
        await sleep(pollIntervalMs);
    }
}

async function main() {
    const { env, campaign, application, adminEdUserId, pollIntervalMs, pollTimeoutMs } = parseArgs(process.argv.slice(2));
    if (!env || !['dev', 'prod'].includes(env)) {
        console.error('Usage: node regenerate-resume.mjs --env dev|prod --campaign <campaignId> --application <applicationId> [--admin-ed-user-id <id>]');
        process.exitCode = 1;
        return;
    }
    if (!campaign) {
        console.error('--campaign is required.');
        process.exitCode = 1;
        return;
    }
    if (!application) {
        console.error('--application is required.');
        process.exitCode = 1;
        return;
    }

    const envFile = join(REPO_ROOT, '.secrets', 'wideapply-resume-admin-skill', `.env.${env}`);
    let vars;
    try {
        vars = loadEnvFile(envFile);
    } catch (err) {
        console.log(JSON.stringify({ ok: false, env, campaign, application, error: err.message }));
        process.exitCode = 1;
        return;
    }

    const baseUrl = vars.ELASTICDASH_BE_BASE_URL;
    const key = vars.WIDEAPPLY_RESUME_ADMIN_SERVICE_KEY;
    if (!baseUrl || !key) {
        console.log(JSON.stringify({ ok: false, env, campaign, application, error: `${envFile} is missing ELASTICDASH_BE_BASE_URL or WIDEAPPLY_RESUME_ADMIN_SERVICE_KEY.` }));
        process.exitCode = 1;
        return;
    }
    const resolvedAdminEdUserId = adminEdUserId || vars.WIDEAPPLY_ADMIN_ED_USER_ID || '';

    const kickoff = await postAction({ baseUrl, key, campaign, application, action: 'regenerate-resume', adminEdUserId: resolvedAdminEdUserId });
    if (!kickoff.ok) {
        console.log(JSON.stringify({ ok: false, env, campaign, application, stage: 'regenerate-resume', ...kickoff }));
        process.exitCode = 1;
        return;
    }

    const polled = await pollUntilDone({ baseUrl, key, campaign, application, pollIntervalMs, pollTimeoutMs });
    if (!polled.ok) {
        console.log(JSON.stringify({ ok: false, env, campaign, application, stage: 'poll', ...polled }));
        process.exitCode = 1;
        return;
    }
    if (polled.status === 'error') {
        console.log(JSON.stringify({ ok: false, env, campaign, application, stage: 'generation', tailored_resume_status: polled.status, tailored_resume_error: polled.app?.tailored_resume_error }));
        process.exitCode = 1;
        return;
    }

    const filesResult = await postAction({ baseUrl, key, campaign, application, action: 'generate-resume-files', adminEdUserId: resolvedAdminEdUserId });
    const ok = filesResult.ok;
    console.log(JSON.stringify({ ok, env, campaign, application, tailored_resume_status: polled.status, generateResumeFiles: filesResult }));
    if (!ok) process.exitCode = 1;
}

main();
