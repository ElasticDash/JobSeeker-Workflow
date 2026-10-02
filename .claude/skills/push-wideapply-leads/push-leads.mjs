#!/usr/bin/env node
// push-leads.mjs
//
// Usage:
//   node push-leads.mjs --env dev|prod --campaign <campaignId> --company "<company name>"
//   (a JSON array of leads is piped in via stdin)
//
// Reads ELASTICDASH_BE_BASE_URL and WIDEAPPLY_LEADS_SERVICE_KEY from
// <repo>/.secrets/wideapply-leads-skill/.env.<env> — inside this repo, but
// outside .claude/skills/ (which is treated as distributable skill
// definitions, not a place for real credentials) and gitignored wholesale
// (see .gitignore's `.secrets/` line), so it never gets committed or swept
// up by a skill-package listing. Never prints the key, the Authorization
// header, or the env file's contents — only status/counts/errors from the
// response.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--env') args.env = argv[++i];
        else if (argv[i] === '--campaign') args.campaign = argv[++i];
        else if (argv[i] === '--company') args.company = argv[++i];
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
    const { env, campaign, company } = parseArgs(process.argv.slice(2));
    if (!env || !['dev', 'prod'].includes(env)) {
        console.error('Usage: node push-leads.mjs --env dev|prod --campaign <campaignId> --company "<company name>"  (leads JSON via stdin)');
        process.exitCode = 1;
        return;
    }
    if (!campaign) {
        console.error('--campaign is required.');
        process.exitCode = 1;
        return;
    }
    if (!company || !company.trim()) {
        console.error('--company is required — a lead belongs to a company, not to one specific application.');
        process.exitCode = 1;
        return;
    }

    let leads;
    try {
        leads = JSON.parse(await readStdin());
    } catch {
        console.error('stdin must be a JSON array of leads.');
        process.exitCode = 1;
        return;
    }
    if (!Array.isArray(leads) || leads.length === 0) {
        console.error('leads must be a non-empty array.');
        process.exitCode = 1;
        return;
    }
    if (leads.some((lead) => !lead || !String(lead.name || '').trim())) {
        console.error('Each lead requires a name.');
        process.exitCode = 1;
        return;
    }

    const envFile = join(REPO_ROOT, '.secrets', 'wideapply-leads-skill', `.env.${env}`);
    let vars;
    try {
        vars = loadEnvFile(envFile);
    } catch (err) {
        console.error(err.message);
        process.exitCode = 1;
        return;
    }

    const baseUrl = vars.ELASTICDASH_BE_BASE_URL;
    const key = vars.WIDEAPPLY_LEADS_SERVICE_KEY;
    if (!baseUrl || !key) {
        console.error(`${envFile} is missing ELASTICDASH_BE_BASE_URL or WIDEAPPLY_LEADS_SERVICE_KEY.`);
        process.exitCode = 1;
        return;
    }

    const url = `${baseUrl.replace(/\/$/, '')}/api/wideapply/admin/campaigns/${campaign}/leads`;
    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({ leads, company }),
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

    const inserted = Array.isArray(parsed?.result) ? parsed.result : Array.isArray(parsed) ? parsed : [];
    console.log(JSON.stringify({ ok: true, env, campaign, company, count: inserted.length, ids: inserted.map((l) => l.id) }));
}

main();
