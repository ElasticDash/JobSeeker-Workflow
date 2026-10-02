# Resume pipeline house rules

These were saved preferences in claude.ai and applied automatically there. Claude Code only sees them from this file.

## Writing
- Never use em dashes in any output.

## Candidate resumes
- Profile template: "[title] with [N] years of experience in [focus area]. Highly experienced in [past fields covered]. Passionate about [a larger personal goal]. [traits important for the target role] who can [short description of capability]." Sentence 1 opens with the title itself, no soft-skill prefix ("Technical program manager with 4 years...", not "Structured technical program manager..."). This overrides the "[soft skill] [title]" opener still written in ideal-candidate, cv-pass-gap-fix and humanizer-us-resume.
- Profile: summarize experience only, no metrics or achievement numbers. Avoid overused resume terms (e.g. "detail-oriented"); when the JD names attention to detail, use a fresher phrase like "a sharp eye for detail".
- Profile years: a plain whole number, no hedges like "nearly". Don't imply all the years were in the target title when some were in another function.
- The title in the headline under the name and the title in the Profile must match.
- Bullets: don't repeat the same opening verb across experiences. Internships use weaker verbs ("managed", not "led").
- Experience entries ordered most recent first.
- Skills: label the last line of tail items "Others:", not "Also:".
- Every education entry carries dates; date ranges use an en dash ("Jun 2025 – Sep 2025"), not "to".
- When the job location differs from the candidate's location, put "(able to relocate)" right after the location in the header.
- Ideal-candidate versions stay credible: don't track the JD wording too closely, no unrealistic figures.

## Screening and checks
- Treat relocation as possible (location gate passes). Count x.5 years as x+1 against a minimum years requirement.
- Score strictly and consistently: skills weigh most (a missing core skill can mean an immediate fail), then experience, then profile and title, education last even when the JD lists a degree.
- cv-pass-check always ends with a clear final result of Pass or Fail at the bottom.
- When screening against a JD, give the assessment only. Don't offer outreach emails, LinkedIn messages or client-facing copy.

## This repo

Local Claude Code rebuild of the `ideal-cv-pipeline-v4` kit (originally built for claude.ai), plus `wideapply-campaign-pipeline`, which chains it with job sourcing and lead-to-todo conversion into a full campaign run. See `PROMPTS.md` for ready-to-send templates for every flow below.

- `ideal-cv-pipeline-v4` — JD + CV → one-page resume → Drive push → leads. `/ideal-cv-pipeline-v4` or "跑一遍 pipeline". Settings: `IDEAL_CANDIDATE`, `AUTO_FIX_ROUNDS`, `PUSH_TO_DRIVE`, `PUSH_LEADS`. (Standalone use only — see next bullet for why `wideapply-campaign-pipeline` turns `PUSH_TO_DRIVE` off.)
- `wideapply-campaign-pipeline` — `campaignId` in → applications sourced → resume per application → finalized against that application → leads converted to connect-todos. Fully automatic past one checkpoint (the sourced-jobs go-ahead). Settings: `TARGET_APPLICATION_COUNT`, `ATTACH_TO_APPLICATION`, `CONVERT_LEADS_TO_TODOS`.
- **Resumes go to S3, not Google Drive, for this pipeline (changed 2026-10-02).** `push-resume-to-application` uploads straight to ElasticDash-BE's own S3-backed storage (real multipart, the same path `uploadBuffer`/`controller/general/file.js` already used reliably), replacing the claude.ai Google Drive connector (`mcp__claude_ai_Google_Drive__*`, base64), which hit a reproducible corruption bug (confirmed: one resume silently truncated from 223KB to 18KB, twice) and needed a font-stripped workaround on another run. `wideapply-campaign-pipeline` sets `PUSH_TO_DRIVE = false` on its per-application `ideal-cv-pipeline-v4` calls accordingly — `push-resume-to-drive` is still fine for one-off standalone resume delivery outside this pipeline, just not used here anymore.
- **One resume now produces two separate application documents, split by audience, not just format (settled 2026-10-02).** `wideapply.ApplicationDocuments.kind='cv'` is now specifically the **candidate-facing** file and must be a PDF/image — `wideapply-dashboard`'s `DocumentTab.tsx` only previews those inline, and a `.docx` there renders neither a preview nor a download link (an earlier "two `cv` rows, one per format" design was tried and walked back for exactly this reason: the candidate could end up seeing an empty tab, which defeats the whole point). The new `kind='cv_source'` (migration 058) holds the **admin-only** `.docx` — `applicationDocumentController.js`'s admin upload path (`createWideapplyDocument`) accepts it, `boardController.js`'s candidate-facing query (`getWideapplyApplicationDetailForUser`) explicitly excludes it so it never reaches a candidate's browser at all, and `createWideapplyDocumentForUser` (the candidate's own self-service replace) deliberately does **not** accept it. `drive_review_url` (migration 057, admin-only) defaults to the `.docx`/`cv_source` upload's `fileUrl` if one was given, else the PDF's. Each kind replaces only a document of the same kind — `cv` and `cv_source` never collide.
- `ElasticDash-BE`'s own admin panel (`wideapply-dashboard`, a separate repo) already renders every non-screenshot document (not just one), labeled by kind (`ApplicationDetailAdminModal.tsx`'s `DOCUMENT_KIND_LABEL`), each with a `FilePreviewButton` (preview+download for PDF/image, direct download link otherwise) — added 2026-10-02, since admins need to actually open/verify what got uploaded. The optimistic local-state replace logic in `DocumentTab.tsx`, `ApplicationDrawer.tsx` and the admin modal (`onDocumentReplaced`/`onFileSelected`) matches a prior same-kind document by file format too, not just kind — a holdover from an earlier "two `cv` rows, same kind, different format" design that was walked back (see bullet above), left in place because it's harmless: with one format per kind now, format-aware and kind-only matching behave identically, so there's no reason to churn it back.
- A `wideapply.CampaignApplications` row's resume-related admin field is `drive_review_url` (migration 057), separate from its `wideapply.ApplicationDocuments` files (migration 026/058, see bullet above). Never add `drive_review_url` or a `cv_source` document to `boardController.js`'s candidate-facing path.
- Every ElasticDash-BE write from this repo (`push-wideapply-leads`, `push-wideapply-applications`, `push-resume-to-application`, `convert-wideapply-lead-to-todo`) needs a `campaignId`/`applicationId`/`leadId` given by the user — never guessed or looked up — and its own scoped service key under a separate `.secrets/wideapply-*-skill/.env.<env>` (see each skill's "One-time setup"). All four of these skills now live in this repo's own `.claude/skills/`, not globally — run their scripts from the repo root (`node .claude/skills/<skill>/<script>.mjs ...`).
- `.secrets/` is gitignored wholesale (see `.gitignore`) — everything needed to run these skills lives inside this repo, but nothing in that one directory ever gets committed.
