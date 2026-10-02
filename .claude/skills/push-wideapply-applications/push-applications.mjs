#!/usr/bin/env node
// push-applications.mjs
//
// Usage:
//   node push-applications.mjs --env dev|prod --campaign <campaignId>
//   (a JSON array of application objects is piped in via stdin)
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

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

const APPLICATION_STATUSES = ['found', 'applied', 'screening', 'interview', 'offer', 'closed'];

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

async function readStdin() {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
}

async function main() {
    const { env, campaign } = parseArgs(process.argv.slice(2));
    if (!env || !['dev', 'prod'].includes(env)) {
        console.error('Usage: node push-applications.mjs --env dev|prod --campaign <campaignId>  (applications JSON array via stdin)');
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

    const url = `${baseUrl.replace(/\/$/, '')}/api/wideapply/admin/campaigns/${campaign}/applications`;
    const results = [];
    let anyFailed = false;

    for (const [i, app] of applications.entries()) {
        // status defaults to 'found' here (the whole point of this skill) —
        // the backend itself defaults an omitted status to 'applied', so an
        // explicit default has to be set client-side or every push would
        // silently land as 'applied' instead.
        const body = { status: 'found', ...app };

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
