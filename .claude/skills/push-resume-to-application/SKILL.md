---
name: push-resume-to-application
description: Finalize a tailored resume against a specific WideApply job application, via ElasticDash-BE's application APIs. Uploads a PDF as the candidate-facing cv document and, optionally, the .docx source as an admin-only document, reusing the same S3 links for the admin review URL. Use whenever the user wants a resume attached, finalized, or recorded against a specific applicationId.
---

# Push Resume to Application

A wideapply application can carry two separate files for one resume, each with a different audience (migrations 026, 057, 058):

1. **`cv` document** (`wideapply.ApplicationDocuments`, `fileUrl`) — **candidate-facing**. Must be a PDF (or image) — `wideapply-dashboard`'s `DocumentTab.tsx` only previews PDF/image files inline; a `.docx` here renders neither a preview nor a download link, so the candidate would see an empty tab.
2. **`cv_source` document** — **admin-only**, never returned to a candidate at all (`boardController.js`'s candidate query excludes this kind explicitly, not just unrendered by one UI component). This is where the editable `.docx` belongs.
3. **`drive_review_url`** — admin-only, a review link, never shown to the candidate. Despite the DB column's name (left over from when this really was a Google Drive link — see migration 057), it defaults to the `cv_source` (.docx) upload's S3 `fileUrl` if one was given, else the `cv` (PDF) upload's.

Each upload replaces only a prior document of the *same kind* — a `cv` upload never touches `cv_source` and vice versa, so re-running this with just a new PDF doesn't drop the admin's `.docx`, and vice versa (see `applicationDocumentController.js`).

**This does not parse the resume for email outreach.** Everything here writes to `wideapply.ApplicationDocuments` (per-application files, no text-extraction step at all) — a completely separate store from the candidate-scoped `wideapply.Resumes.raw_text` that `convert-wideapply-lead-to-email` requires. If this candidate's email outreach is planned, also run `push-wideapply-resume` once per candidate (not per application) with the `.docx` — it's the fix for that skill's "candidate has no parsed resume yet" 400.

This skill writes all of the above, by running `push-document.mjs` in this skill's own folder, which uploads once per file given and reuses the results. The script — not you — holds the auth key and makes the HTTP calls; you only ever build the arguments and invoke it.

**This replaced a Google Drive + base64 step that kept failing in practice** (a reproducible integrity-check failure on one resume, a font-stripped workaround needed on another — see this skill's git history / `08_drive.md` from runs before 2026-10-02). The fix was to stop using Drive for this at all, not to retry the base64 path harder.

## Where this can actually execute

Same constraint as `push-wideapply-leads` and `push-wideapply-applications`: this needs a real shell on the user's machine. A Desktop app Chat/Cowork session gets file transfer, not shell access, even with the repo connected. If you're in a session without real shell access, build the exact command (see "Calling the script" below) and hand it to the user to run themselves, or paste into a Claude Code session on their machine.

## When this triggers

The user has a finished resume for a specific application and wants it recorded there — as the finalized candidate-facing file, as the admin's own source copy, as the admin review link, or all three. Trigger on: "attach this resume to application X", "finalize the resume for this application", "upload the cv for application X".

## What you need before calling the script

1. **`campaignId`** and **`applicationId`** — the user gives you these directly, or they come from a prior step in this conversation (e.g. the application a sourcing run just created). Never guessed.
2. **`--pdf`** — required. A PDF rendering of the finished resume (e.g. `soffice --headless --convert-to pdf <file>.docx`, same tool `cv-file-generator-2026-09-27` already uses for its own page-count check). This is what the candidate actually sees.
3. **`--file`** — the local path to the matching `.docx`, if you also want the admin-only source file recorded. Omit it if there's no `.docx` worth keeping separately, or if `ATTACH_TO_APPLICATION`-style callers only have the PDF.
4. **`--review-url`** — optional, rare. Only pass this if you specifically want the admin review link to point somewhere *other than* either file you're uploading. Leaving it unset is the normal case — the script then uses the `.docx`'s `fileUrl` if one was given, else the PDF's.
5. **Environment** — default to `dev`. Only use `prod` if the user explicitly says "prod" or "production". Before the *first* prod write in a session, confirm explicitly with the user even if they already said prod once.

## Calling the script

Run from the repo root:

```
node .claude/skills/push-resume-to-application/push-document.mjs --env dev --campaign <campaignId> --application <applicationId> --pdf <path/to/resume.pdf> --file <path/to/resume.docx>
```

Quote `--pdf` and `--file` since paths can contain spaces.

The script uploads `--pdf` (as the candidate-facing `cv`) first, then `--file` (as the admin-only `cv_source`) if given, then sets the review-url field from whichever succeeded (`.docx` preferred) unless `--review-url` was given. Prints one JSON line: `{"ok":bool,"env":...,"campaign":...,"application":...,"reviewUrl":{...},"cv":{...},"cvSource":{...}}`, non-zero exit if any step failed. Relay every outcome back to the user in plain language (e.g. "PDF uploaded for the candidate; .docx recorded as the admin source"), don't just paste the raw JSON.

## If it fails

- **`--pdf is required and must exist`** — this script won't upload a `.docx` as the sole candidate-facing document; render a PDF first.
- **`Attach a file.` / `kind must be one of: cv, cover_letter, cv_source`** (from the document POST) — a mapping bug in how this skill was called, not a user input problem; re-check the command.
- **`Application not found.`** (from the review-url PUT) — the applicationId or campaignId is wrong, or the application was deleted; tell the user, don't guess a different id. (The document upload(s) may have already succeeded even if this step then fails — report all of it.)
- **`Env file not found: .secrets/wideapply-documents-skill/.env.<env>`** — that environment hasn't been set up yet. Tell the user to create it (see "One-time setup" below) — you cannot create or fill in the key yourself.
- **401/403 from the backend** — the scoped key either isn't configured or isn't allowed on one of the two routes yet; see "One-time setup". Don't retry with a different key you make up.
- **Any other network/connection error** — the backend for that environment may be down or unreachable from this machine; tell the user, don't retry silently in a loop.

## What you must never do

- Never read, cat, or print the contents of `.secrets/wideapply-documents-skill/.env.dev` or `.env.prod`. Only `push-document.mjs` touches them.
- Never ask the user to paste the service key into chat, and never type a key into a command yourself.
- Never surface `drive_review_url` or a `cv_source` document (or its S3 link) to the candidate, or suggest either belongs anywhere in the candidate-facing board — both stay admin-only (see migration 057/058's comments, `boardController.js`'s `mapApplication` and its `getWideapplyApplicationDetailForUser` documents query, which excludes `cv_source` outright).
- Never upload a `.docx` as the `cv` kind (candidate-facing) — it won't preview, and the candidate's tab will look empty. `.docx` always goes in as `--file`/`cv_source`; the candidate-facing `--pdf`/`cv` slot is PDF (or image) only.
- Never base64 either file into a JSON body or route it through Google Drive — `push-document.mjs` uploads both as real multipart/form-data straight to S3 specifically to avoid the corruption mode this flow used to hit when it went through Drive.
- Never retry a prod write automatically after a failure without the user re-confirming.

## One-time setup (tell the user this if `.env.dev`/`.env.prod` don't exist yet)

**Current state (as of 2026-10-02): this runs on the unrestricted `WIDEAPPLY_SERVICE_KEY`, not a scoped key.** The intended design is a scoped entry in ElasticDash-BE's `WIDEAPPLY_SERVICE_KEYS_JSON`, restricted to exactly the two routes this skill calls:

```json
{
  "id": "push-resume-to-application",
  "key": "<a newly generated, sufficiently random secret>",
  "allowedRoutes": [
    { "method": "PUT", "pathPattern": "^/admin/campaigns/[^/]+/applications/[^/]+$" },
    { "method": "POST", "pathPattern": "^/admin/campaigns/[^/]+/applications/[^/]+/documents$" }
  ]
}
```

But the live `devserver.elasticdash.com` doesn't read its `WIDEAPPLY_SERVICE_KEYS_JSON` from anywhere this local repo checkout could identify (confirmed: identical scoped-key entries added to both `ElasticDash-BE/.env` and `.env.test.local` locally, server restarted, still 401 — the live server's actual env source wasn't found). As a stopgap, `WIDEAPPLY_DOCUMENTS_SERVICE_KEY` below is currently set to the same value as the live server's single unrestricted `WIDEAPPLY_SERVICE_KEY` (confirmed working: a PUT with a fake applicationId returned `404 Application not found`, not `401`). That key passes `requireWideapplyServiceAuth`'s *first* check, before the scoped-array logic ever runs, so it grants full access to every `/api/wideapply/admin/*` route, not just these two. Treat this as a known gap, not the intended end state — revisit once the real scoped-key source is found, and flag to the user that this key has already been typed into a chat conversation at least twice and should be rotated when convenient.

Then create `.secrets/wideapply-documents-skill/.env.dev` (and `.env.prod` if needed), relative to the repo root, with:

```
ELASTICDASH_BE_BASE_URL=<the backend's base URL for that environment>
WIDEAPPLY_DOCUMENTS_SERVICE_KEY=<the key currently in use — see "Current state" above>
WIDEAPPLY_ADMIN_ED_USER_ID=<optional: an admin user id to attribute these writes to>
```

`.secrets/` is gitignored wholesale, and this skill's subfolder is separate from `wideapply-leads-skill/` and `wideapply-applications-skill/` — a leaked or revoked key here has no effect on those flows, and vice versa.
