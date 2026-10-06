#!/usr/bin/env node
// generate-message.mjs
//
// Usage:
//   node generate-message.mjs --env dev|prod --campaign <campaignId> --lead <leadId> [--admin-ed-user-id <id>]
//
// Triggers ElasticDash-BE's own backend-side message generation
// (leadMessageGenerator.js's generateWideapplyLeadMessage) for a lead that
// was just converted to a connect-todo (convert-lead.mjs) — POST
// .../leads/:leadId/regenerate-message. This fills in the chain's "Send
// private message to <name> on LinkedIn" step (sent AFTER the connection
// is accepted) with AI-drafted content right away, grounded in the lead's
// own tier (c_level/manager/peer/hr_recruiting — see
// push-leads.mjs/push-leads skill), instead of waiting for the candidate
// to confirm the connection was accepted (the backend's own other trigger
// for this same generator, publishGeneratedLeadMessage in
// campaignsController.js).
//
// This repo never drafts the message content itself — convert-lead.mjs no
// longer accepts --follow-up-message for that reason. This script's only
// job is telling the backend "generate it now" for a lead whose to-do
// chain already exists; it never sends the message itself (that's still
// the chain's own day-3/day-6 accept-check), and it never writes message
// text of its own.
//
// Only works once the lead's connect-todo chain already exists (run
// convert-lead.mjs first) and only while that chain's message step is
// still 'draft' or 'open' — a step the candidate already marked sent
// cannot be regenerated, same guard regenerateWideapplyLeadMessage
// enforces server-side.
//
// Reads ELASTICDASH_BE_BASE_URL, WIDEAPPLY_LEAD_CONVERT_SERVICE_KEY and the
// optional WIDEAPPLY_ADMIN_ED_USER_ID from
// <repo>/.secrets/wideapply-lead-convert-skill/.env.<env> — same env file
// convert-lead.mjs already uses (this calls a different route under the
// same admin campaigns path, no separate key needed). Never prints the
// key, the Authorization header, or the env file's contents — only
// status/errors from the response.

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
    const { env, campaign, lead, adminEdUserId } = parseArgs(process.argv.slice(2));
    if (!env || !['dev', 'prod'].includes(env)) {
        console.error('Usage: node generate-message.mjs --env dev|prod --campaign <campaignId> --lead <leadId> [--admin-ed-user-id <id>]');
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

    const url = `${baseUrl.replace(/\/$/, '')}/api/wideapply/admin/campaigns/${campaign}/leads/${lead}/regenerate-message`;
    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({ adminEdUserId: resolvedAdminEdUserId || undefined }),
        });
    } catch {
        console.error(`Could not reach ${baseUrl}. Is the ${env} backend up and is this network allowed to reach it?`);
        process.exitCode = 1;
        return;
    }

    // Same two-shape error handling as convert-lead.mjs - read as text
    // first, only attempt JSON on top of that.
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

    const updated = parsed?.result ?? parsed ?? {};
    console.log(JSON.stringify({ ok: true, env, campaign, lead, todoId: updated.id, status: updated.status }));
}

main();
