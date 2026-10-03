#!/usr/bin/env node
// push-resume.mjs
//
// Usage:
//   node push-resume.mjs --env dev|prod --campaign <campaignId> --file <path.docx>
//
// Closes the "candidate has no parsed resume yet" gap that blocks
// convert-wideapply-lead-to-email. controller/wideapply/leadsController.js's
// convertWideapplyLeadToEmailSequence reads wideapply.Resumes.raw_text — a
// CANDIDATE-scoped store (keyed by ed_user_id), completely separate from
// wideapply.ApplicationDocuments, the per-application S3 file
// push-resume-to-application uploads (which has no text-extraction step at
// all). No skill in this repo populated wideapply.Resumes before this one,
// so every candidate who only went through this repo's pipelines had zero
// rows there and every email-sequence attempt 400'd, no matter how many
// applications had a successfully attached resume.
//
// Three calls:
//   1. GET   /admin/campaigns/:campaignId  -> resolve edUserId from the
//      campaign (never guessed — campaignId is the only id the caller
//      supplies, same as every other skill here).
//   2. POST  /resumes/upload (multipart: resume, edUserId) -> creates a
//      wideapply.Resumes row, parse_status='pending', raw_text still null.
//   3. PATCH /resumes/:id (JSON: rawText, parseStatus) -> fills raw_text
//      itself, parse_status='parsed'.
//
// Step 3's text comes from unzipping the .docx's word/document.xml locally
// and stripping tags — there is no text-extraction step on this route's
// backend side. (The only other parse path, POST /resume/parse, is a
// stateless LLM extraction used by onboarding and never touches this table
// at all — see this skill's SKILL.md.) Good enough for the resume-grounded
// proof lines convert-wideapply-lead-to-email's Day 3 generator needs; not a
// substitute for a dedicated OCR/parsing pipeline, and .docx only — a PDF
// has no equivalent local extraction here, so pass the .docx source.
//
// Reads ELASTICDASH_BE_BASE_URL and WIDEAPPLY_RESUME_SERVICE_KEY from
// <repo>/.secrets/wideapply-resume-skill/.env.<env> — inside this repo, but
// outside .claude/skills/ (treated as distributable skill definitions, not a
// place for real credentials) and gitignored wholesale (see .gitignore's
// `.secrets/` line). Never prints the key, the Authorization header, or the
// env file's contents — only status/errors from the response.

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename, extname } from 'node:path';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const MIME_BY_EXT = {
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--env') args.env = argv[++i];
        else if (argv[i] === '--campaign') args.campaign = argv[++i];
        else if (argv[i] === '--file') args.file = argv[++i];
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

/** Reads the two error shapes this backend can send: JSON from the auth middleware, or a raw string body from generalApiErrorHandler. */
async function readErrorMessage(response) {
    const rawBody = await response.text();
    try {
        const parsed = JSON.parse(rawBody);
        return parsed?.message ?? rawBody ?? 'Unknown error';
    } catch {
        return rawBody || 'Unknown error';
    }
}

/** Unzips word/document.xml and strips markup — a plain-text approximation, not a layout-faithful extraction. */
function extractDocxText(file) {
    let xml;
    try {
        xml = execFileSync('unzip', ['-p', file, 'word/document.xml'], { maxBuffer: 50 * 1024 * 1024 }).toString('utf8');
    } catch (err) {
        throw new Error(`Could not read ${file} as a .docx (unzip failed: ${err.message}). Pass the .docx source file, not a PDF.`);
    }
    return xml
        .replace(/<\/w:p>/g, '\n')
        .replace(/<w:tab\s*\/>/g, '\t')
        .replace(/<w:br\s*\/>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

async function getCampaignEdUserId({ baseUrl, key, campaign }) {
    const url = `${baseUrl.replace(/\/$/, '')}/api/wideapply/admin/campaigns/${campaign}`;
    let response;
    try {
        response = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    } catch {
        return { ok: false, error: `Could not reach ${baseUrl} to resolve the campaign's candidate.` };
    }
    if (!response.ok) {
        return { ok: false, status: response.status, error: await readErrorMessage(response) };
    }
    const rawBody = await response.text();
    let parsed = null;
    try {
        parsed = JSON.parse(rawBody);
    } catch {
        // leave parsed null; checked below
    }
    const campaignRow = parsed?.result ?? null;
    if (!campaignRow || !campaignRow.edUserId) {
        return { ok: false, error: 'Campaign lookup returned no edUserId — wrong campaignId, or the campaign was deleted.' };
    }
    return { ok: true, edUserId: campaignRow.edUserId, candidateName: campaignRow.candidateName };
}

async function uploadResume({ baseUrl, key, edUserId, file }) {
    const bytes = readFileSync(file);
    const mime = MIME_BY_EXT[extname(file).toLowerCase()] || 'application/octet-stream';
    const form = new FormData();
    form.append('resume', new Blob([bytes], { type: mime }), basename(file));
    form.append('edUserId', String(edUserId));

    const url = `${baseUrl.replace(/\/$/, '')}/api/wideapply/resumes/upload`;
    let response;
    try {
        response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form });
    } catch {
        return { ok: false, error: `Could not reach ${baseUrl} to upload the resume.` };
    }
    if (!response.ok) {
        return { ok: false, status: response.status, error: await readErrorMessage(response) };
    }
    const rawBody = await response.text();
    let parsed = null;
    try {
        parsed = JSON.parse(rawBody);
    } catch {
        // leave parsed null; fields below come back undefined
    }
    const row = parsed?.result ?? {};
    return { ok: true, id: row.id, parseStatus: row.parseStatus };
}

async function patchParseResult({ baseUrl, key, id, rawText }) {
    const url = `${baseUrl.replace(/\/$/, '')}/api/wideapply/resumes/${id}`;
    let response;
    try {
        response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
            body: JSON.stringify({ rawText, parseStatus: 'parsed' }),
        });
    } catch {
        return { ok: false, error: `Could not reach ${baseUrl} to record the parsed text.` };
    }
    if (!response.ok) {
        return { ok: false, status: response.status, error: await readErrorMessage(response) };
    }
    const rawBody = await response.text();
    let parsed = null;
    try {
        parsed = JSON.parse(rawBody);
    } catch {
        // leave parsed null
    }
    const row = parsed?.result ?? {};
    return { ok: true, parseStatus: row.parseStatus, parsedAt: row.parsedAt };
}

async function main() {
    const { env, campaign, file } = parseArgs(process.argv.slice(2));
    if (!env || !['dev', 'prod'].includes(env)) {
        console.error('Usage: node push-resume.mjs --env dev|prod --campaign <campaignId> --file <path.docx>');
        process.exitCode = 1;
        return;
    }
    if (!campaign) {
        console.error('--campaign is required.');
        process.exitCode = 1;
        return;
    }
    if (!file || !existsSync(file)) {
        console.error(`--file is required and must exist. Got: ${file || '(none)'}`);
        process.exitCode = 1;
        return;
    }
    if (extname(file).toLowerCase() !== '.docx') {
        console.error(`--file must be a .docx (the editable resume source) — text extraction here only reads word/document.xml. Got: ${file}`);
        process.exitCode = 1;
        return;
    }

    const envFile = join(REPO_ROOT, '.secrets', 'wideapply-resume-skill', `.env.${env}`);
    let vars;
    try {
        vars = loadEnvFile(envFile);
    } catch (err) {
        console.error(err.message);
        process.exitCode = 1;
        return;
    }

    const baseUrl = vars.ELASTICDASH_BE_BASE_URL;
    const key = vars.WIDEAPPLY_RESUME_SERVICE_KEY;
    if (!baseUrl || !key) {
        console.error(`${envFile} is missing ELASTICDASH_BE_BASE_URL or WIDEAPPLY_RESUME_SERVICE_KEY.`);
        process.exitCode = 1;
        return;
    }

    const campaignResult = await getCampaignEdUserId({ baseUrl, key, campaign });
    if (!campaignResult.ok) {
        console.log(JSON.stringify({ ok: false, env, campaign, step: 'resolve-candidate', ...campaignResult }));
        process.exitCode = 1;
        return;
    }

    const uploadResult = await uploadResume({ baseUrl, key, edUserId: campaignResult.edUserId, file });
    if (!uploadResult.ok) {
        console.log(JSON.stringify({ ok: false, env, campaign, edUserId: campaignResult.edUserId, step: 'upload', ...uploadResult }));
        process.exitCode = 1;
        return;
    }

    let rawText;
    try {
        rawText = extractDocxText(file);
    } catch (err) {
        console.log(JSON.stringify({
            ok: false, env, campaign, edUserId: campaignResult.edUserId, step: 'extract-text',
            error: err.message, resumeId: uploadResult.id,
            note: 'The file uploaded to S3 successfully, but local text extraction failed — raw_text was never set, so the parsed-resume gate is still closed.',
        }));
        process.exitCode = 1;
        return;
    }
    if (!rawText) {
        console.log(JSON.stringify({
            ok: false, env, campaign, edUserId: campaignResult.edUserId, step: 'extract-text',
            error: 'Extracted text was empty.', resumeId: uploadResult.id,
        }));
        process.exitCode = 1;
        return;
    }

    const patchResult = await patchParseResult({ baseUrl, key, id: uploadResult.id, rawText });
    const ok = patchResult.ok;
    console.log(JSON.stringify({
        ok,
        env,
        campaign,
        edUserId: campaignResult.edUserId,
        candidateName: campaignResult.candidateName,
        resumeId: uploadResult.id,
        rawTextChars: rawText.length,
        parseStatus: patchResult.parseStatus,
        parse: patchResult,
    }));
    if (!ok) process.exitCode = 1;
}

main();
