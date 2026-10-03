---
name: push-wideapply-resume
description: Parse a candidate's resume into ElasticDash-BE's candidate-scoped wideapply.Resumes store (raw_text), via a local .docx text extraction plus two API calls. Fixes the "candidate has no parsed resume yet" 400 that blocks convert-wideapply-lead-to-email, which is unrelated to whether a resume is already attached to any application. Use whenever a candidate needs their resume parsed before email outreach drafting, or when convert-wideapply-lead-to-email 400s with that exact message.
---

# Push WideApply Resume (parse)

`convert-wideapply-lead-to-email` requires `wideapply.Resumes.raw_text` to be
non-empty for the candidate (`controller/wideapply/leadsController.js`'s
`convertWideapplyLeadToEmailSequence`, via `getLatestWideapplyResume`). This is a
**candidate**-scoped table, keyed by `ed_user_id` — a completely different store
from `wideapply.ApplicationDocuments`, the per-application PDF/`.docx` files
`push-resume-to-application` uploads to S3. That upload has no text-extraction step
at all, so a candidate who only ever went through this repo's pipelines has zero
rows in `wideapply.Resumes`, no matter how many applications already show a
successfully attached resume — every email-sequence attempt 400s with `This
candidate has no parsed resume yet - a resume is required to draft the email
sequence.` regardless. This skill is the fix: it populates that row.

This skill writes to ElasticDash-BE by running `push-resume.mjs` in this skill's own
folder, which does three things in order:

1. **`GET /admin/campaigns/:campaignId`** — resolves the candidate's `edUserId` from
   the campaign. `campaignId` is the only id you give it; `edUserId` is never
   guessed, it's read straight from this response's `edUserId` field.
2. **`POST /resumes/upload`** (multipart) — uploads the `.docx` to S3 and creates a
   `wideapply.Resumes` row (`parse_status: 'pending'`, `raw_text` still null at this
   point).
3. **`PATCH /resumes/:id`** — fills `raw_text` and sets `parse_status: 'parsed'`.

Step 3's text comes from **unzipping the `.docx` locally** (`word/document.xml`,
tags stripped) — there is no text-extraction step on this route's backend side to
call instead. (ElasticDash-BE does have a separate `POST /wideapply/resume/parse`
route, but it's a stateless LLM extraction used by candidate onboarding and never
touches `wideapply.Resumes` at all — don't confuse the two; it will not fix this
gap.) The script — not you — makes every HTTP call and reads the file; you only
build the arguments and invoke it.

**Only `.docx` is supported.** There's no local text extraction for PDF here, so
pass the `.docx` source — the same file `push-resume-to-application` already
uploaded as `cv_source` for that application — not the PDF.

## Where this can actually execute

Same constraint as every other wideapply-*-skill here: this needs a real shell on
the user's machine (`unzip` must be on `PATH` — present by default on macOS and
virtually every Linux distro). A Desktop app Chat/Cowork session gets file transfer,
not shell access, even with the repo connected. If you're in a session without real
shell access, build the exact command (see "Calling the script" below) and hand it
to the user to run themselves.

## When this triggers

- `convert-wideapply-lead-to-email` just 400'd with `This candidate has no parsed
  resume yet...` — run this once for that candidate's campaign, then retry the
  email conversion.
- Proactively, right after a candidate's first resume is finalized against an
  application (`push-resume-to-application`), if the plan for this candidate
  includes any email outreach later (template 9 in `PROMPTS.md`) — doing it once up
  front avoids discovering the gap only after researching and drafting 20 leads.
- The user directly asks to "parse this candidate's resume" or "fix the no-parsed-
  resume error."

This is **candidate**-scoped, not per-application — running it once per candidate is
enough to unblock every application's email drafts for that candidate.
`getLatestWideapplyResume` reads the single most recently created row, so re-running
this later with an updated `.docx` is harmless and expected (it just becomes the new
"latest").

## What you need before calling the script

1. **`campaignId`** — the user gives you this, or it comes from a prior step in this
   conversation (e.g. `wideapply-campaign-pipeline`'s own sourcing). Never guessed.
2. **The candidate's `.docx` resume** — any finished `.docx` for this candidate
   works; it doesn't have to be the exact file attached to a specific application,
   since parsing is candidate-scoped, not per-application. Prefer the most recent
   one you have.
3. **Environment** — default to `dev`. Only use `prod` if the user explicitly says
   "prod" or "production". Before the *first* prod write in a session, confirm
   explicitly with the user even if they already said prod once.

## Calling the script

Run from the repo root:

```
node .claude/skills/push-wideapply-resume/push-resume.mjs --env dev --campaign <campaignId> --file <path/to/resume.docx>
```

Quote `--file` since paths can contain spaces.

Prints one JSON line: `{"ok":bool,"env":...,"campaign":...,"edUserId":...,"candidateName":...,"resumeId":...,"rawTextChars":N,"parseStatus":"parsed"}` on success, or `{"ok":false,"step":"resolve-candidate"|"upload"|"extract-text",...}` identifying exactly which of the three calls failed, non-zero exit either way it fails. Relay the outcome in plain language (e.g. "Resume parsed for Agrima Jain (3243 characters) — email outreach is unblocked for this candidate now"), don't just paste the raw JSON.

## If it fails

- **`Campaign lookup returned no edUserId...`** — wrong `campaignId`, or the campaign was deleted; tell the user, don't guess a different id.
- **`--file must be a .docx...`** — this skill only extracts text from `.docx`; if you only have a PDF, get the `.docx` source instead (it's the same file already pushed as `cv_source`).
- **`Could not read <file> as a .docx (unzip failed: ...)`** — the file isn't actually a valid `.docx`, or `unzip` isn't on this machine's `PATH`. Don't try to work around this with a guessed/fabricated raw text.
- **`Extracted text was empty.`** — the `.docx` has no text in `word/document.xml` (unusual — e.g. an image-only or corrupted file); the resume row was still uploaded to S3 (reported in the output as `resumeId`), but `raw_text` was never set, so the gate is still closed. Get a text-bearing `.docx` and re-run.
- **`Env file not found: .secrets/wideapply-resume-skill/.env.<env>`** — that environment hasn't been set up yet. Tell the user to create it (see "One-time setup" below) — you cannot create or fill in the key yourself.
- **401/403 from the backend** — the scoped key either isn't configured or isn't allowed on these routes yet; see "One-time setup". Don't retry with a different key you make up.
- **Any other network/connection error** — the backend for that environment may be down or unreachable from this machine; tell the user, don't retry silently in a loop.

## What you must never do

- Never read, cat, or print the contents of `.secrets/wideapply-resume-skill/.env.dev` or `.env.prod`. Only `push-resume.mjs` touches them.
- Never ask the user to paste the service key into chat, and never type a key into a command yourself.
- Never fabricate `raw_text` from memory of the candidate's profile instead of actually extracting it from the `.docx` you were given — the whole point is that the backend's generator quotes this text verbatim.
- Never retry a prod write automatically after a failure without the user re-confirming.

## One-time setup (tell the user this if `.env.dev`/`.env.prod` don't exist yet)

Same stopgap shape as `push-resume-to-application`'s own setup (see that skill's
SKILL.md "Current state" note) — the live backend doesn't pick up
`WIDEAPPLY_SERVICE_KEYS_JSON` scoped-key entries from anywhere this repo's checkout
can identify, so a true per-route scoped key isn't realistically available yet. The
intended scoping, once that's fixed, is:

```json
{
  "id": "push-wideapply-resume",
  "key": "<a newly generated, sufficiently random secret>",
  "allowedRoutes": [
    { "method": "GET", "pathPattern": "^/admin/campaigns/[^/]+$" },
    { "method": "POST", "pathPattern": "^/resumes/upload$" },
    { "method": "PATCH", "pathPattern": "^/resumes/[^/]+$" }
  ]
}
```

As a stopgap, use the same value already in use as `WIDEAPPLY_DOCUMENTS_SERVICE_KEY`
(the live, unrestricted `WIDEAPPLY_SERVICE_KEY`) — it passes `requireWideapplyServiceAuth`'s
first check regardless of route, so it works here too, with the same caveat: it
grants full access to every `/api/wideapply/*` route, not just these three. Flag to
the user that this key is now typed into more than one skill's env files and should
be rotated once the real scoped-key source is found.

Then create `.secrets/wideapply-resume-skill/.env.dev` (and `.env.prod` if needed),
relative to the repo root, with:

```
ELASTICDASH_BE_BASE_URL=<the backend's base URL for that environment>
WIDEAPPLY_RESUME_SERVICE_KEY=<the key currently in use — see above>
```

`.secrets/` is gitignored wholesale, and this skill's subfolder is separate from
every other wideapply-*-skill secrets folder — a leaked or revoked key here has no
effect on those flows, and vice versa.
