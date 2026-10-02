#!/usr/bin/env node
// push-document.mjs
//
// Usage:
//   node push-document.mjs --env dev|prod --campaign <campaignId> --application <applicationId> --pdf <path.pdf> [--file <path.docx>] [--change-summary '["Trimmed to one page"]'] [--review-url <url>] [--admin-ed-user-id <id>]
//
// Writes everything a wideapply application can carry about its resume
// (migrations 026 / 057 / 058), via real S3 uploads, no Drive, no base64 —
// two different kinds, two different audiences:
//   1. --pdf: POST .../applications/:applicationId/documents, multipart
//      upload as kind='cv' — the CANDIDATE-FACING file (wideapply-dashboard's
//      DocumentTab.tsx only previews PDF/image files inline, not .docx, so
//      this is the one the candidate actually sees rendered).
//   2. --file, if given: a SECOND upload, kind='cv_source' — the ADMIN-ONLY
//      editable source (.docx). Never returned to a candidate at all (see
//      getWideapplyApplicationDetailForUser in boardController.js, which
//      excludes this kind from its query entirely, not just from one UI
//      component).
//   3. PUT .../applications/:applicationId, sets drive_review_url — a
//      second admin-only pointer (DB column name is a holdover from when
//      this really was a Google Drive link, see migration 057). Defaults
//      to the cv_source (.docx) upload's fileUrl if one was given, else the
//      PDF's.
// Each upload replaces only a prior document of the SAME kind (cv and
// cv_source never collide with each other) — see applicationDocumentController.js.
// Every step's result is reported separately so a partial failure (e.g. the
// .docx upload fails but the PDF succeeded) is never silent.
//
// Reads ELASTICDASH_BE_BASE_URL, WIDEAPPLY_DOCUMENTS_SERVICE_KEY and the
// optional WIDEAPPLY_ADMIN_ED_USER_ID from
// <repo>/.secrets/wideapply-documents-skill/.env.<env> — inside this repo,
// but outside .claude/skills/ (which is treated as distributable skill
// definitions, not a place for real credentials) and gitignored wholesale
// (see .gitignore's `.secrets/` line), so it never gets committed or swept
// up by a skill-package listing. Never prints the key, the Authorization
// header, or the env file's contents — only status/errors from the
// response.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename, extname } from 'node:path';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const MIME_BY_EXT = {
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.pdf': 'application/pdf',
};

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--env') args.env = argv[++i];
        else if (argv[i] === '--campaign') args.campaign = argv[++i];
        else if (argv[i] === '--application') args.application = argv[++i];
        else if (argv[i] === '--pdf') args.pdf = argv[++i];
        else if (argv[i] === '--file') args.file = argv[++i];
        else if (argv[i] === '--change-summary') args.changeSummary = argv[++i];
        else if (argv[i] === '--review-url' || argv[i] === '--drive-url') args.reviewUrl = argv[++i];
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

async function putReviewUrl({ baseUrl, key, campaign, application, reviewUrl, adminEdUserId }) {
    const url = `${baseUrl.replace(/\/$/, '')}/api/wideapply/admin/campaigns/${campaign}/applications/${application}`;
    let response;
    try {
        response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
            body: JSON.stringify({ driveReviewUrl: reviewUrl, adminEdUserId: adminEdUserId || undefined }),
        });
    } catch {
        return { ok: false, error: `Could not reach ${baseUrl} to set drive_review_url.` };
    }
    if (!response.ok) {
        return { ok: false, status: response.status, error: await readErrorMessage(response) };
    }
    return { ok: true, url: reviewUrl };
}

async function postDocument({ baseUrl, key, campaign, application, file, docKind, changeSummary, adminEdUserId }) {
    const bytes = readFileSync(file);
    const mime = MIME_BY_EXT[extname(file).toLowerCase()] || 'application/octet-stream';
    const form = new FormData();
    form.append('file', new Blob([bytes], { type: mime }), basename(file));
    form.append('kind', docKind);
    if (changeSummary) form.append('changeSummary', changeSummary);
    if (adminEdUserId) form.append('adminEdUserId', adminEdUserId);

    const url = `${baseUrl.replace(/\/$/, '')}/api/wideapply/admin/campaigns/${campaign}/applications/${application}/documents`;
    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${key}` },
            body: form,
        });
    } catch {
        return { ok: false, error: `Could not reach ${baseUrl} to upload the document.` };
    }
    if (!response.ok) {
        return { ok: false, status: response.status, error: await readErrorMessage(response) };
    }
    const rawBody = await response.text();
    let parsed = null;
    try {
        parsed = JSON.parse(rawBody);
    } catch {
        // leave parsed null; doc fields below just come back undefined
    }
    const doc = parsed?.result ?? parsed ?? {};
    return { ok: true, id: doc.id, fileUrl: doc.fileUrl };
}

async function main() {
    const { env, campaign, application, pdf, file, changeSummary, reviewUrl, adminEdUserId } = parseArgs(process.argv.slice(2));
    if (!env || !['dev', 'prod'].includes(env)) {
        console.error('Usage: node push-document.mjs --env dev|prod --campaign <campaignId> --application <applicationId> --pdf <path.pdf> [--file <path.docx>] [--change-summary \'["..."]\'] [--review-url <url>] [--admin-ed-user-id <id>]');
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
    if (!pdf || !existsSync(pdf)) {
        console.error(`--pdf is required and must exist (it's the candidate-facing file). Got: ${pdf || '(none)'}`);
        process.exitCode = 1;
        return;
    }
    if (file && !existsSync(file)) {
        console.error(`--file was given but does not exist: ${file}`);
        process.exitCode = 1;
        return;
    }
    if (changeSummary) {
        try {
            const parsedSummary = JSON.parse(changeSummary);
            if (!Array.isArray(parsedSummary)) throw new Error('not an array');
        } catch {
            console.error('--change-summary must be a JSON-encoded array of strings.');
            process.exitCode = 1;
            return;
        }
    }

    const envFile = join(REPO_ROOT, '.secrets', 'wideapply-documents-skill', `.env.${env}`);
    let vars;
    try {
        vars = loadEnvFile(envFile);
    } catch (err) {
        console.error(err.message);
        process.exitCode = 1;
        return;
    }

    const baseUrl = vars.ELASTICDASH_BE_BASE_URL;
    const key = vars.WIDEAPPLY_DOCUMENTS_SERVICE_KEY;
    if (!baseUrl || !key) {
        console.error(`${envFile} is missing ELASTICDASH_BE_BASE_URL or WIDEAPPLY_DOCUMENTS_SERVICE_KEY.`);
        process.exitCode = 1;
        return;
    }
    const resolvedAdminEdUserId = adminEdUserId || vars.WIDEAPPLY_ADMIN_ED_USER_ID || '';

    // Candidate-facing PDF first: review-url below prefers the source
    // .docx if given, but falls back to this.
    const pdfResult = await postDocument({ baseUrl, key, campaign, application, file: pdf, docKind: 'cv', changeSummary, adminEdUserId: resolvedAdminEdUserId });

    const sourceResult = file
        ? await postDocument({ baseUrl, key, campaign, application, file, docKind: 'cv_source', changeSummary, adminEdUserId: resolvedAdminEdUserId })
        : { ok: true, skipped: true };

    const effectiveReviewUrl = reviewUrl || (sourceResult.ok && sourceResult.fileUrl) || pdfResult.fileUrl;
    const reviewUrlResult = effectiveReviewUrl
        ? await putReviewUrl({ baseUrl, key, campaign, application, reviewUrl: effectiveReviewUrl, adminEdUserId: resolvedAdminEdUserId })
        : { ok: false, skipped: true, error: 'No URL to set: both uploads failed, and no --review-url override was given.' };

    const ok = reviewUrlResult.ok && pdfResult.ok && sourceResult.ok;
    console.log(JSON.stringify({ ok, env, campaign, application, reviewUrl: reviewUrlResult, cv: pdfResult, cvSource: sourceResult }));
    if (!ok) process.exitCode = 1;
}

main();
