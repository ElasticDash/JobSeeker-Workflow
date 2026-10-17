#!/usr/bin/env node
// update-posted-date.mjs
//
// Usage:
//   node update-posted-date.mjs --env dev|prod
//   (a JSON array of { applicationId, campaignPurchaseId, jobPostedAt }
//   objects — ONLY rows the user confirmed in the review table — piped in
//   via stdin)
//
// Reads ELASTICDASH_BE_BASE_URL and WIDEAPPLY_POSTED_DATE_SERVICE_KEY from
// <repo>/.secrets/wideapply-posted-date-skill/.env.<env> — a NEW scoped key,
// NOT push-wideapply-applications's own key (route-restricted to a
// different route — see fetch-missing-posted-date.mjs's own header for
// why). See this skill's SKILL.md "One-time setup" for the new key/entry
// to create. Never prints the key, the Authorization header, or the env
// file's contents — only status/counts/errors from the response.
//
// Reuses the EXISTING PUT /admin/campaigns/:campaignId/applications/:applicationId
// endpoint (jobPostedAt is one of its already-supported partial-update
// fields) — no dedicated bulk-write endpoint exists or is needed. One PUT
// per item, collecting per-item success/failure rather than aborting the
// whole batch on the first error, same convention push-applications.mjs
// already uses.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--env') args.env = argv[++i];
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
    const { env } = parseArgs(process.argv.slice(2));
    if (!env || !['dev', 'prod'].includes(env)) {
        console.error('Usage: node update-posted-date.mjs --env dev|prod  (array of { applicationId, campaignPurchaseId, jobPostedAt } via stdin)');
        process.exitCode = 1;
        return;
    }

    let updates;
    try {
        updates = JSON.parse(await readStdin());
    } catch {
        console.error('stdin must be a JSON array of { applicationId, campaignPurchaseId, jobPostedAt } objects.');
        process.exitCode = 1;
        return;
    }
    if (!Array.isArray(updates) || updates.length === 0) {
        console.error('updates must be a non-empty array.');
        process.exitCode = 1;
        return;
    }
    for (const [i, u] of updates.entries()) {
        if (!u || !String(u.applicationId || '').trim() || !String(u.campaignPurchaseId || '').trim() || !String(u.jobPostedAt || '').trim()) {
            console.error(`Item ${i} is missing applicationId, campaignPurchaseId, and/or jobPostedAt — all three are required.`);
            process.exitCode = 1;
            return;
        }
        if (Number.isNaN(new Date(u.jobPostedAt).getTime())) {
            console.error(`Item ${i} has an unparseable jobPostedAt: "${u.jobPostedAt}".`);
            process.exitCode = 1;
            return;
        }
    }

    const envFile = join(REPO_ROOT, '.secrets', 'wideapply-posted-date-skill', `.env.${env}`);
    let vars;
    try {
        vars = loadEnvFile(envFile);
    } catch (err) {
        console.error(err.message);
        process.exitCode = 1;
        return;
    }

    const baseUrl = vars.ELASTICDASH_BE_BASE_URL;
    const key = vars.WIDEAPPLY_POSTED_DATE_SERVICE_KEY;
    if (!baseUrl || !key) {
        console.error(`${envFile} is missing ELASTICDASH_BE_BASE_URL or WIDEAPPLY_POSTED_DATE_SERVICE_KEY.`);
        process.exitCode = 1;
        return;
    }

    const results = [];
    let anyFailed = false;

    for (const [i, u] of updates.entries()) {
        const url = `${baseUrl.replace(/\/$/, '')}/api/wideapply/admin/campaigns/${u.campaignPurchaseId}/applications/${u.applicationId}`;

        let response;
        try {
            response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${key}`,
                },
                body: JSON.stringify({ jobPostedAt: u.jobPostedAt }),
            });
        } catch {
            results.push({ index: i, ok: false, applicationId: u.applicationId, error: `Could not reach ${baseUrl}.` });
            anyFailed = true;
            continue;
        }

        const rawBody = await response.text();
        let parsed = null;
        try {
            parsed = JSON.parse(rawBody);
        } catch {
            // parsed stays null; handled below.
        }

        if (!response.ok) {
            results.push({ index: i, ok: false, applicationId: u.applicationId, status: response.status, error: parsed?.message ?? (rawBody || 'Unknown error') });
            anyFailed = true;
            continue;
        }

        results.push({ index: i, ok: true, applicationId: u.applicationId, jobPostedAt: u.jobPostedAt });
    }

    console.log(JSON.stringify({ ok: !anyFailed, env, count: results.length, results }));
    if (anyFailed) process.exitCode = 1;
}

main();
