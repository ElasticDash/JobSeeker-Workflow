#!/usr/bin/env node
// hirebase-search.mjs
//
// Usage:
//   node hirebase-search.mjs --endpoint search|estimate|categories|industries
//   (for search/estimate: a JSON filter-body object is piped in via stdin,
//    same shape as Hirebase's POST /v2/jobs/search body)
//
// Reads HIREBASE_API_KEY from <repo-root>/.env — not .secrets/, because this
// is a read-only external search (not a write to ElasticDash-BE) and the key
// already lives directly in the repo's gitignored top-level .env alongside
// THEIR_STACK_API_KEY. Never prints the key itself.
//
// search responses are always written to a file under .temp/hirebase-raw/
// rather than printed — job objects carry description/skills/technologies/
// benefits arrays that add up fast at limit >= 10, and candidate-job-matcher
// -hirebase's own "always via the saved file" rule (mirroring the original
// TheirStack-based skill) is simplest applied unconditionally rather than
// guessing a size threshold. estimate/categories/industries responses are
// small and print directly.

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const BASE_URL = 'https://api.hirebase.org';

const ENDPOINTS = {
    search: { method: 'POST', path: '/v2/jobs/search', body: true },
    estimate: { method: 'POST', path: '/v2/jobs/estimate', body: true },
    categories: { method: 'GET', path: '/v2/jobs/data/categories', body: false },
    industries: { method: 'GET', path: '/v2/jobs/data/industries', body: false },
};

function parseArgs(argv) {
    const args = { endpoint: null };
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--endpoint') args.endpoint = argv[++i];
    }
    return args;
}

function loadApiKey() {
    const envPath = join(REPO_ROOT, '.env');
    if (!existsSync(envPath)) {
        throw new Error(`.env not found at ${envPath}. Add HIREBASE_API_KEY=... to it first.`);
    }
    const text = readFileSync(envPath, 'utf8');
    for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        if (trimmed.slice(0, eq).trim() === 'HIREBASE_API_KEY') {
            return trimmed.slice(eq + 1).trim();
        }
    }
    throw new Error(`HIREBASE_API_KEY not found in ${envPath}.`);
}

async function readStdin() {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
}

async function main() {
    const { endpoint } = parseArgs(process.argv.slice(2));
    const def = endpoint ? ENDPOINTS[endpoint] : null;
    if (!def) {
        console.error(`Usage: node hirebase-search.mjs --endpoint ${Object.keys(ENDPOINTS).join('|')}  (search/estimate take a JSON filter body via stdin)`);
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

    let body;
    if (def.body) {
        try {
            body = JSON.parse(await readStdin());
        } catch {
            console.error('stdin must be a JSON object (the Hirebase search/estimate filter body).');
            process.exitCode = 1;
            return;
        }
    }

    const url = `${BASE_URL}${def.path}`;
    let response;
    try {
        response = await fetch(url, {
            method: def.method,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': key,
            },
            ...(def.body ? { body: JSON.stringify(body) } : {}),
        });
    } catch {
        console.error(`Could not reach ${BASE_URL}.`);
        process.exitCode = 1;
        return;
    }

    const rawText = await response.text();
    let parsed = null;
    try {
        parsed = JSON.parse(rawText);
    } catch {
        // parsed stays null; rawText is reported as-is below.
    }

    const usage = {
        feature: response.headers.get('hirebase-usage-feature'),
        meter: response.headers.get('hirebase-usage-meter'),
        includedRemaining: response.headers.get('hirebase-usage-included-remaining'),
        overageUsed: response.headers.get('hirebase-usage-overage-used'),
    };
    const billingCode = response.headers.get('x-billing-code');
    const retryAfter = response.headers.get('retry-after');

    if (!response.ok) {
        // billingCode === 'limit_exceeded' -> plan quota, do not retry.
        // retryAfter present (no billingCode) -> rate limit, retry after that many seconds.
        console.log(JSON.stringify({
            ok: false,
            status: response.status,
            billingCode,
            retryAfter,
            error: parsed?.detail ?? rawText,
        }));
        process.exitCode = 1;
        return;
    }

    if (endpoint === 'search') {
        const dir = join(REPO_ROOT, '.temp', 'hirebase-raw');
        mkdirSync(dir, { recursive: true });
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        const savedTo = join(dir, `${stamp}-search.json`);
        writeFileSync(savedTo, rawText, 'utf8');
        console.log(JSON.stringify({
            ok: true,
            savedTo,
            total_count: parsed?.total_count,
            company_count: parsed?.company_count,
            page: parsed?.page,
            limit: parsed?.limit,
            total_pages: parsed?.total_pages,
            returned: parsed?.jobs?.length ?? 0,
            usage,
        }));
        return;
    }

    console.log(JSON.stringify({ ok: true, result: parsed, usage }));
}

main();
