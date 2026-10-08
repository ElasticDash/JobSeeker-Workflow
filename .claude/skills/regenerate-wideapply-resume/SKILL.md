---
name: "regenerate-wideapply-resume"
description: "Drive ElasticDash-BE's admin regenerate-resume + generate-resume-files routes for one wideapply application: kick off backend resume generation, poll until it leaves 'generating', then render and attach the .docx/.pdf pair server-side. Backs wideapply-campaign-pipeline's Stage 2a (GENERATE_RESUME = true path). Triggers: regenerate resume for application, generate resume files, pipeline stage 2a resume."
---

# Regenerate WideApply Resume (admin, backend-generated)

Backs `wideapply-campaign-pipeline` Stage 2a's default (`GENERATE_RESUME = true`) path: ElasticDash-BE generates `tailored_resume_text` server-side (rewriting only `profileSummary`/bullets, never header/education/skills) and then renders it directly into the application's `cv`/`cv_source` documents. No local file is produced or uploaded by this skill — unlike `push-resume-to-application`, there is nothing to pass it afterward.

## Calling the script

```
node .claude/skills/regenerate-wideapply-resume/regenerate-resume.mjs --env dev --campaign <campaignId> --application <applicationId>
```

Runs three calls in sequence and prints one JSON line:
1. `POST .../applications/:applicationId/regenerate-resume` — kicks off generation (background LLM call; this call returns as soon as `tailored_resume_status` is set to `'generating'`).
2. `GET .../applications/:applicationId`, polled every `--poll-interval-ms` (default 3000) up to `--poll-timeout-ms` (default 120000) until `tailored_resume_status` leaves `'generating'`.
3. On success (`'ready'`): `POST .../applications/:applicationId/generate-resume-files` — renders and attaches the `.docx`/`.pdf` pair.
   On failure (`'error'`): reports `tailored_resume_error` and stops; the pipeline's own Stage 2a retries this script once before treating it as a handoff.

## One-time setup

Needs a **new** scoped entry in ElasticDash-BE's `WIDEAPPLY_SERVICE_KEYS_JSON`, restricted to exactly these three routes:

```json
{
  "id": "regenerate-wideapply-resume",
  "key": "<a newly generated, sufficiently random secret>",
  "allowedRoutes": [
    { "method": "POST", "pathPattern": "^/admin/campaigns/[^/]+/applications/[^/]+/regenerate-resume$" },
    { "method": "GET", "pathPattern": "^/admin/campaigns/[^/]+/applications/[^/]+$" },
    { "method": "POST", "pathPattern": "^/admin/campaigns/[^/]+/applications/[^/]+/generate-resume-files$" }
  ]
}
```

That's a config change in ElasticDash-BE's own environment, not a code change. Generating and setting the key is the user's own step — do not attempt to generate or guess a value, and do not widen `allowedRoutes` beyond these three.

Then create `.secrets/wideapply-resume-admin-skill/.env.dev` (and `.env.prod` if needed), relative to the repo root:

```
ELASTICDASH_BE_BASE_URL=<the backend's base URL for that environment>
WIDEAPPLY_RESUME_ADMIN_SERVICE_KEY=<the scoped key issued above>
WIDEAPPLY_ADMIN_ED_USER_ID=<optional: an admin user id to attribute these writes to>
```

`.secrets/` is gitignored wholesale, and this skill's subfolder is separate from every other wideapply skill's — a leaked or revoked key here has no effect on any other flow.

## What you must never do

- Never read, cat, or print the contents of `.secrets/wideapply-resume-admin-skill/.env.dev` or `.env.prod`.
- Never ask the user to paste the service key into chat, and never type a key into a command yourself.
- Never guess `adminEdUserId` — resolve it the same way any other admin-scoped write in this repo does (ask, or read it off an existing admin-authenticated call).
