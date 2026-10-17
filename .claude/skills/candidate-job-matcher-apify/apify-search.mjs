#!/usr/bin/env node
// apify-search.mjs
//
// Usage:
//   node apify-search.mjs --run
//   (a JSON actor-input object is piped in via stdin, e.g.
//    {"search_jobs": ["https://wellfound.com/role/l/software-engineer/san-francisco"], "max_page": 2})
//
// Reads APIFY_KEY from <repo-root>/.env — not .secrets/, because this is a
// read-only external search (not a write to ElasticDash-BE), same placement
// as HIREBASE_API_KEY and THEIR_STACK_API_KEY.
//
// Drives the saswave~wellfound-company-job-scraper Apify actor via the async
// run + poll + fetch-dataset pattern (POST .../runs, poll GET
// .../actor-runs/:id, then GET .../datasets/:id/items) rather than the
// run-sync-get-dataset-items shortcut — Apify's own docs warn "Long HTTP
// connections might break" on the sync endpoint, and a multi-page scrape
// (max_page > 1) can run past what a single blocking HTTP call should be
// trusted to hold open.
//
// Dataset items are always written to a file under .temp/apify-raw/ rather
// than printed — job objects carry full description/company payloads that
// add up fast past a handful of results — mirroring
// candidate-job-matcher-hirebase's own "always via the saved file" rule.

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const BASE_URL = 'https://api.apify.com/v2';
const ACTOR_ID = 'saswave~wellfound-company-job-scraper';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes — a max_page of 1-3 should finish well inside this
const TERMINAL_STATUSES = new Set(['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT']);

function parseArgs(argv) {
    const args = { run: false };
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--run') args.run = true;
    }
    return args;
}

function loadApiKey() {
    const envPath = join(REPO_ROOT, '.env');
    if (!existsSync(envPath)) {
        throw new Error(`.env not found at ${envPath}. Add APIFY_KEY=... to it first.`);
    }
    const text = readFileSync(envPath, 'utf8');
    for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        if (trimmed.slice(0, eq).trim() === 'APIFY_KEY') {
            return trimmed.slice(eq + 1).trim();
        }
    }
    throw new Error(`APIFY_KEY not found in ${envPath}.`);
}

async function readStdin() {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const { run } = parseArgs(process.argv.slice(2));
    if (!run) {
        console.error('Usage: node apify-search.mjs --run  (actor-input JSON body via stdin: search_jobs/search_companies/jobs/max_page)');
        process.exitCode = 1;
        return;
    }

    let key;
    try {
        key = loadApiKey();
    } catch (err) {
        console.error(err.message);
        process.exitCode = 1;
        return;
    }

    let input;
    try {
        input = JSON.parse(await readStdin());
    } catch {
        console.error('stdin must be a JSON object (the actor input: search_jobs/search_companies/jobs/max_page).');
        process.exitCode = 1;
        return;
    }

    // Step 1: start the run.
    let startResponse;
    try {
        startResponse = await fetch(`${BASE_URL}/acts/${ACTOR_ID}/runs?token=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });
    } catch {
        console.error(`Could not reach ${BASE_URL}.`);
        process.exitCode = 1;
        return;
    }

    const startText = await startResponse.text();
    let startParsed = null;
    try {
        startParsed = JSON.parse(startText);
    } catch {
        // stays null; startText reported as-is below.
    }

    if (!startResponse.ok) {
        console.log(JSON.stringify({
            ok: false,
            stage: 'start',
            status: startResponse.status,
            error: startParsed?.error ?? startText,
        }));
        process.exitCode = 1;
        return;
    }

    const runId = startParsed?.data?.id;
    if (!runId) {
        console.log(JSON.stringify({ ok: false, stage: 'start', error: 'No run id in response', raw: startParsed }));
        process.exitCode = 1;
        return;
    }

    // Step 2: poll until terminal.
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    let status = startParsed.data.status;
    let defaultDatasetId = startParsed.data.defaultDatasetId;
    while (!TERMINAL_STATUSES.has(status)) {
        if (Date.now() > deadline) {
            console.log(JSON.stringify({ ok: false, stage: 'poll', runId, error: `Timed out waiting for run after ${POLL_TIMEOUT_MS / 1000}s (last status: ${status})` }));
            process.exitCode = 1;
            return;
        }
        await sleep(POLL_INTERVAL_MS);
        let pollResponse;
        try {
            pollResponse = await fetch(`${BASE_URL}/actor-runs/${runId}?token=${key}`);
        } catch {
            continue; // transient network hiccup — keep polling until the deadline
        }
        const pollParsed = await pollResponse.json().catch(() => null);
        if (!pollResponse.ok || !pollParsed?.data) continue;
        status = pollParsed.data.status;
        defaultDatasetId = pollParsed.data.defaultDatasetId ?? defaultDatasetId;
    }

    if (status !== 'SUCCEEDED') {
        console.log(JSON.stringify({ ok: false, stage: 'run', runId, status, error: `Actor run ended with status ${status}` }));
        process.exitCode = 1;
        return;
    }

    // Step 3: fetch dataset items.
    let itemsResponse;
    try {
        itemsResponse = await fetch(`${BASE_URL}/datasets/${defaultDatasetId}/items?token=${key}&format=json&clean=true`);
    } catch {
        console.error(`Could not reach ${BASE_URL} to fetch dataset items.`);
        process.exitCode = 1;
        return;
    }

    const itemsText = await itemsResponse.text();
    if (!itemsResponse.ok) {
        console.log(JSON.stringify({ ok: false, stage: 'dataset', runId, status: itemsResponse.status, error: itemsText }));
        process.exitCode = 1;
        return;
    }

    let items;
    try {
        items = JSON.parse(itemsText);
    } catch {
        console.log(JSON.stringify({ ok: false, stage: 'dataset', runId, error: 'Dataset response was not valid JSON' }));
        process.exitCode = 1;
        return;
    }

    const dir = join(REPO_ROOT, '.temp', 'apify-raw');
    mkdirSync(dir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const savedTo = join(dir, `${stamp}-search.json`);
    writeFileSync(savedTo, JSON.stringify(items, null, 2), 'utf8');

    console.log(JSON.stringify({
        ok: true,
        runId,
        status,
        savedTo,
        itemCount: Array.isArray(items) ? items.length : 0,
    }));
}

main();
