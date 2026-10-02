---
name: "wideapply-campaign-pipeline"
description: "campaignId in, applications sourced, resumes drafted and finalized, leads found and converted to connect-todos. Chains push-wideapply-applications, ideal-cv-pipeline-v4, push-resume-to-application and convert-wideapply-lead-to-todo per application. Triggers: run the campaign pipeline, source jobs and build resumes for this campaign, full wideapply pipeline."
---

# WideApply Campaign Pipeline

Given a campaign and a candidate, finds job postings, logs them as applications, tailors and finalizes a resume for each, researches hiring-side leads, and turns those leads into "connect on LinkedIn" to-dos. Fully automatic once started: the only pause is `push-wideapply-applications`'s own one-time go-ahead on the sourced job table (that skill's own hard rule, not overridden here) — after that, every application in the batch runs straight through to leads and connect-todos with no per-resume approval step.

This skill does no resume, sourcing or storage work itself: at each stage, load the named skill with the Skill tool and follow its instructions, except where this file overrides them. Resumes go straight to ElasticDash-BE's own S3 storage (via `push-resume-to-application`), not Google Drive.

## Settings

- `TARGET_APPLICATION_COUNT`: how many "found" applications to source this run (input 3 below).
- `ATTACH_TO_APPLICATION = true`: run `push-resume-to-application` per application (this is the only upload/finalize step now — see 2a/2b). Set false to stop after the resume is drafted, e.g. if the ElasticDash-BE scoped key for that skill isn't set up yet.
- `CONVERT_LEADS_TO_TODOS = true`: run `convert-wideapply-lead-to-todo` for every lead a given application's run pushed. Set false to leave leads as research + saved rows, no connect-todos.
- `MIN_JOB_DESCRIPTION_CHARS = 200`: an application whose `jobDescription` is shorter than this (or empty) is skipped for stages 2 onward rather than feeding a thin JD into `ideal-cv-pipeline-v4` — JD analysis needs real content to work from.

## Inputs

1. **`campaignId`** (required) — never guessed, same rule as every skill this chains.
2. **Candidate profile** (required) — same shape `candidate-job-matcher` needs (title history, YOE, location preference, work auth, desired salary).
3. **Target job count `N`** (required) — ask if unstated.
4. **Original CV template** (.docx, required) — candidate material and the layout `ideal-cv-pipeline-v4` stage 7 needs.
5. **Contact set 1 / Contact set 2** (optional) — passed through to every per-application `ideal-cv-pipeline-v4` run unchanged; see that skill's own contact-set rules.
6. **Environment** (optional, default `dev`) — `dev` or `prod`, passed to every scoped-key skill this chains. Before the *first* prod write in a run, confirm explicitly with the user even if they already said prod once.

## Working files

Use a run folder, e.g. `wideapply-campaign/<campaignId>-<date>/`, so runs don't overwrite each other.

- `01_applications.md`: every application `push-wideapply-applications` created this run (id, company, role, jobDescription, jobPostUrl, status)
- `<company>-<role>/`: one subfolder per application, holding that application's own `ideal-cv-pipeline-v4` working files (`00_contact.md` through `09_leads.md`; no `08_drive.md` here since `PUSH_TO_DRIVE` is off for this pipeline)
- `02_results.md`: the per-application summary this skill appends to as each application finishes (see Output)

## Stage 1: Source applications

Run `push-wideapply-applications` with `campaignId`, the candidate profile, `N`, and the environment. Follow that skill's own flow exactly, including its Step 3 mapped-table-then-go-ahead — this is the one human checkpoint in the run, and it covers the whole batch at once, not one approval per job.

Save the created applications to `01_applications.md`: id, company, role, jobDescription, jobPostUrl, status. If `push-wideapply-applications` logged fewer than `N` (shortfall reported by `candidate-job-matcher`), carry that shortfall into this skill's final summary rather than treating it as a failure.

## Stage 2: Per application

For each application in `01_applications.md`, in order:

**Skip condition:** if `jobDescription` is missing or shorter than `MIN_JOB_DESCRIPTION_CHARS`, skip stages 2a–2c for this application. Record it in `02_results.md` as "skipped: no usable job description" and move to the next one. Do not fetch `jobPostUrl` or otherwise invent JD content to work around this.

### 2a. Resume and leads

Run `ideal-cv-pipeline-v4` in this application's own subfolder, with:
- JD = this application's `jobDescription`
- candidate profile / original CV template = this skill's own inputs (3/4 above)
- contact sets = this skill's own inputs (5 above), unchanged
- `campaignId` (input 6 of `ideal-cv-pipeline-v4`) = this skill's `campaignId` (input 1)
- `PUSH_TO_DRIVE = false` — stage 8's Google Drive push is skipped entirely for this pipeline. `push-resume-to-application` (2b) uploads the exact same file straight to ElasticDash-BE's own S3-backed storage and derives the admin review link from that single upload, so there's no separate Drive step, no base64 relay, and no corruption risk left in this flow (see that skill's own notes — this replaced a Drive step that kept corrupting or needing a font-stripped workaround).
- `PUSH_LEADS = true` (already that skill's default; just don't turn it off)

**On handoff** (stage 4A/6A failure inside `ideal-cv-pipeline-v4`): stop at stage 2a for this application only. Record "handoff: <reason>" in `02_results.md`, do not run 2b/2c for it, and continue the loop with the next application. One application failing its pass-check never stops the batch.

**On success:** read back from this application's subfolder:
- the set-1 (or Default) `.docx` path
- `09_leads.md`'s push result — the inserted lead `ids`, or the reason none were pushed (no campaignId was never the case here since input 1 always supplies it; the relevant reason here is the "no live application" 400, which should not occur since this application was just created — if it does anyway, record it as-is rather than retrying)

### 2b. Finalize against the application

Render the set-1 (or Default) `.docx` from 2a to PDF first (`soffice --headless --convert-to pdf <file>.docx`, same tool `cv-file-generator-2026-09-27` already uses) — the candidate-facing board only previews PDF/image files inline, not `.docx`, so the PDF is what the candidate actually sees.

If `ATTACH_TO_APPLICATION` is true, run `push-resume-to-application` with:
- `campaignId`, this application's id
- `--pdf`: the PDF just rendered — this becomes the candidate-facing `cv` document
- `--file`: the set-1 (or Default) `.docx` from 2a — this becomes the admin-only `cv_source` document, never shown to the candidate
- environment = this skill's input 6

Do not pass `--review-url` — leave it unset so the script defaults the admin review link to the `.docx` upload's S3 `fileUrl`. One call uploads both and sets the review link; record the result (review-url status, both uploads' status, both `fileUrl`s) in `02_results.md`.

### 2c. Connect-todos for this application's leads

If `CONVERT_LEADS_TO_TODOS` is true and 2a's `09_leads.md` push result has any `ids`: for each lead id, run `convert-wideapply-lead-to-todo` with `campaignId`, that `leadId`, and `applicationId` set explicitly to this application's id (known already, so there's no ambiguity to resolve). Record each lead's outcome (todoId, or the error — e.g. "already converted" is not a failure to flag, just note it) in `02_results.md`.

If 2a found leads but didn't push any (no `ids`), skip 2c for this application and say why in `02_results.md` (should not normally happen here, since `ideal-cv-pipeline-v4` already has this exact `campaignId`).

## Output

Reply in the user's language. No em dashes.

1. A one-line summary: applications sourced (N requested vs. actually logged, noting any shortfall), how many reached a finished resume, how many hit handoff, how many were skipped for a thin JD.
2. A table from `02_results.md`, one row per application: company / role / CV pipeline result / attach status (incl. the S3 `fileUrl`) / leads found / leads converted to todos.
3. Every handoff's reason, and every application skipped for a thin JD, listed explicitly (not just counted) so nothing silently falls through.
4. Any scoped-key setup still missing (e.g. `push-resume-to-application` or `convert-wideapply-lead-to-todo`'s one-time setup not done yet) — report it once per skill, don't repeat it per application.

Give the summary and the table only. Do not offer to write outreach emails, LinkedIn messages or client-facing copy. Do not recap the stages.
