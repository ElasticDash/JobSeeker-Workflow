#!/usr/bin/env node
// fetch-missing-posted-date.mjs
//
// Usage:
//   node fetch-missing-posted-date.mjs --env dev|prod [--campaign <campaignPurchaseId>]
//
// --campaign scopes the export to one campaign; omitted, it's cross-campaign.
//
// Reads ELASTICDASH_BE_BASE_URL and WIDEAPPLY_POSTED_DATE_SERVICE_KEY from
// <repo>/.secrets/wideapply-posted-date-skill/.env.<env> — a NEW scoped key,
// NOT push-wideapply-applications's own key (that one is route-restricted
// via WIDEAPPLY_SERVICE_KEYS_JSON's allowedRoutes to only its one POST
// create route — it would 403 on the GET/PUT routes this skill calls, and
// that skill's own rule says never widen an existing key's scope). See this
// skill's SKILL.md "One-time setup" for the new key/entry to create. Never
// prints the key, the Authorization header, or the env file's contents —
// only status/counts/errors from the response.
//
// Pages through GET /admin/applications/missing-posted-date (100/page, the
// backend's own max) until exhausted, then prints the FULL combined list
// as one JSON array to stdout — the applicationId/campaignPurchaseId/
// company/role/jobPostUrl this skill's SKILL.md needs to visit each
// posting and decide a jobPostedAt value for update-posted-date.mjs.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PAGE_SIZE = 100;

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--env') args.env = argv[++i];
        else if (argv[i] === '--campaign') args.campaign = argv[++i];
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

async function main() {
    const { env, campaign } = parseArgs(process.argv.slice(2));
    if (!env || !['dev', 'prod'].includes(env)) {
        console.error('Usage: node fetch-missing-posted-date.mjs --env dev|prod [--campaign <campaignPurchaseId>]');
        process.exitCode = 1;
        return;
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

    const applications = [];
    let page = 1;
    let total = null;

    const campaignParam = campaign ? `&campaignPurchaseId=${encodeURIComponent(campaign)}` : '';
    while (total === null || applications.length < total) {
        const url = `${baseUrl.replace(/\/$/, '')}/api/wideapply/admin/applications/missing-posted-date?page=${page}&pageSize=${PAGE_SIZE}${campaignParam}`;
        let response;
        try {
            response = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
        } catch {
            console.error(`Could not reach ${baseUrl}.`);
            process.exitCode = 1;
            return;
        }

        const rawBody = await response.text();
        let parsed = null;
        try {
            parsed = JSON.parse(rawBody);
        } catch {
            // parsed stays null; handled by the !response.ok branch below.
        }

        if (!response.ok) {
            console.error(parsed?.message ?? (rawBody || 'Unknown error'));
            process.exitCode = 1;
            return;
        }

        const result = parsed?.result ?? parsed;
        applications.push(...(result?.applications ?? []));
        total = result?.total ?? applications.length;
        if (!result?.applications?.length) break; // safety: stop if a page comes back empty before `total` is reached
        page += 1;
    }

    console.log(JSON.stringify({ ok: true, env, campaign: campaign ?? null, total: applications.length, applications }));
}

main();
