#!/usr/bin/env node
// convert-lead.mjs
//
// Usage:
//   node convert-lead.mjs --env dev|prod --campaign <campaignId> --lead <leadId> [--application <applicationId>] [--admin-ed-user-id <id>]
//
// Converts one already-inserted wideapply.Leads row into a
// linkedin_connection to-do (POST .../leads/:leadId/convert) - the backend
// also creates its 3-step accept-check/message follow-up chain
// automatically (see createWideapplyTodo in adminController.js). One lead
// per call; loop this script per lead id when converting a batch (e.g.
// every id push-leads.mjs just returned).
//
// Reads ELASTICDASH_BE_BASE_URL, WIDEAPPLY_LEAD_CONVERT_SERVICE_KEY and the
// optional WIDEAPPLY_ADMIN_ED_USER_ID from
// <repo>/.secrets/wideapply-lead-convert-skill/.env.<env> — inside this
// repo, but outside .claude/skills/ (which is treated as distributable
// skill definitions, not a place for real credentials) and gitignored
// wholesale (see .gitignore's `.secrets/` line), so it never gets committed
// or swept up by a skill-package listing. Never prints the key, the
// Authorization header, or the env file's contents — only status/errors
// from the response.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--env') args.env = argv[++i];
        else if (argv[i] === '--campaign') args.campaign = argv[++i];
        else if (argv[i] === '--lead') args.lead = argv[++i];
        else if (argv[i] === '--application') args.application = argv[++i];
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

async function main() {
    const { env, campaign, lead, application, adminEdUserId } = parseArgs(process.argv.slice(2));
    if (!env || !['dev', 'prod'].includes(env)) {
        console.error('Usage: node convert-lead.mjs --env dev|prod --campaign <campaignId> --lead <leadId> [--application <applicationId>] [--admin-ed-user-id <id>]');
        process.exitCode = 1;
        return;
    }
    if (!campaign) {
        console.error('--campaign is required.');
        process.exitCode = 1;
        return;
    }
    if (!lead) {
        console.error('--lead is required.');
        process.exitCode = 1;
        return;
    }

    const envFile = join(REPO_ROOT, '.secrets', 'wideapply-lead-convert-skill', `.env.${env}`);
    let vars;
    try {
        vars = loadEnvFile(envFile);
    } catch (err) {
        console.error(err.message);
        process.exitCode = 1;
        return;
    }

    const baseUrl = vars.ELASTICDASH_BE_BASE_URL;
    const key = vars.WIDEAPPLY_LEAD_CONVERT_SERVICE_KEY;
    if (!baseUrl || !key) {
        console.error(`${envFile} is missing ELASTICDASH_BE_BASE_URL or WIDEAPPLY_LEAD_CONVERT_SERVICE_KEY.`);
        process.exitCode = 1;
        return;
    }
    const resolvedAdminEdUserId = adminEdUserId || vars.WIDEAPPLY_ADMIN_ED_USER_ID || '';

    const url = `${baseUrl.replace(/\/$/, '')}/api/wideapply/admin/campaigns/${campaign}/leads/${lead}/convert`;
    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({ adminEdUserId: resolvedAdminEdUserId || undefined, applicationId: application || undefined }),
        });
    } catch {
        console.error(`Could not reach ${baseUrl}. Is the ${env} backend up and is this network allowed to reach it?`);
        process.exitCode = 1;
        return;
    }

    // ElasticDash-BE's two error paths disagree on shape: the auth
    // middleware sends JSON ({success:false, message}), but
    // generalApiErrorHandler sends the error message as a raw string body
    // (res.send(err.message), not JSON). Read as text first and only
    // attempt JSON on top of that, so neither path loses its message.
    const rawBody = await response.text();
    let parsed = null;
    try {
        parsed = JSON.parse(rawBody);
    } catch {
        // rawBody stays the fallback message below.
    }

    if (!response.ok) {
        const message = parsed?.message ?? (rawBody || 'Unknown error');
        console.error(JSON.stringify({ ok: false, status: response.status, error: message }));
        process.exitCode = 1;
        return;
    }

    const todo = parsed?.result ?? parsed ?? {};
    console.log(JSON.stringify({ ok: true, env, campaign, lead, todoId: todo.id, target: todo.target }));
}

main();
