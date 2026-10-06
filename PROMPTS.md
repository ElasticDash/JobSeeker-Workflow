# Prompt dictionary

Copy-paste templates for the recurring things this repo's skills get asked to do. Fill in the `{{placeholder}}` slots and send as-is in a Claude Code chat opened in this repo; the wording is phrased to hit each skill's own trigger phrases (see `.claude/skills/*/SKILL.md`).

Where a template includes a markdown link like `([company_linkedin_url]({{company_linkedin_url}}))`, the link text (`company_linkedin_url`) is literal — leave it as-is. Only the URL inside `(...)` is the fill-in value. This labels what each link is for even after the template is filled in.

## Contents

- [Prompt dictionary](#prompt-dictionary)
  - [Contents](#contents)
  - [1. Find leads and push to a campaign](#1-find-leads-and-push-to-a-campaign)
  - [2. Push an already-researched lead list](#2-push-an-already-researched-lead-list)
  - [3. Run the full CV pipeline](#3-run-the-full-cv-pipeline)
  - [4. Push a finished resume to Drive](#4-push-a-finished-resume-to-drive)
  - [5. Finalize a resume against a specific application](#5-finalize-a-resume-against-a-specific-application)
  - [6. Convert leads into connect-todos](#6-convert-leads-into-connect-todos)
  - [7. Run the full campaign pipeline](#7-run-the-full-campaign-pipeline)
  - [8. Convert a lead into an email outreach draft sequence](#8-convert-a-lead-into-an-email-outreach-draft-sequence)
  - [9. Run the full campaign pipeline with full lead outreach](#9-run-the-full-campaign-pipeline-with-full-lead-outreach)
    - [9.1 Lead composition — 5 per application, 2 tiers](#91-lead-composition--5-per-application-2-tiers)
    - [9.2 Company/product research — before drafting anything](#92-companyproduct-research--before-drafting-anything)
    - [9.3 Per-tier channel + message templates](#93-per-tier-channel--message-templates)
    - [9.4 Why both channels can run on the same lead](#94-why-both-channels-can-run-on-the-same-lead)
  - [10. Parse a candidate's resume (precondition for email outreach)](#10-parse-a-candidates-resume-precondition-for-email-outreach)
  - [11. Build a GrokBot job search condition](#11-build-a-grokbot-job-search-condition)
  - [12. Bulk-apply from a pre-gathered job list](#12-bulk-apply-from-a-pre-gathered-job-list)
  - [13. Fetch fresh ATS jobs and schedule next week's applications](#13-fetch-fresh-ats-jobs-and-schedule-next-weeks-applications)

---

## 1. Find leads and push to a campaign

Runs `hiring-contact-finder` (research) then `push-wideapply-leads` (push), back to back.

```
For {{env}} server, find leads for '{{role}}' at Company '{{company}}' ([company_linkedin_url]({{company_linkedin_url}})) ([company_website_url]({{company_website_url}})), then push them to campaign '{{campaign_id}}'
```

**Worked example:**

```
For dev server, find leads for 'Technical Program Manager' at Company 'Fluidstack' ([company_linkedin_url](https://www.linkedin.com/company/fluidstack/)) ([company_website_url](https://fluidstack.com/)), then push them to campaign 'd10b9cbd-6875-4112-9bfd-e35debabcbfd'
```

| Placeholder | Required | Notes |
|---|---|---|
| `{{env}}` | yes | `dev` or `prod`. Default to dev if you don't say; a prod push gets an explicit confirmation prompt before the first write either way. |
| `{{role}}` | yes | Drives `hiring-contact-finder`'s title-tier mapping (manager / hr_recruiting, 3/2 quotas — changed 2026-10-06, no more C-level or colleague). |
| `{{company}}` | yes | Must match the company name already on a live application in the target campaign/dashboard, or the push 400s. |
| `{{company_linkedin_url}}` | optional | Pins the company identity in Step 0, cuts down same-name-company noise. Skip it and the skill derives it from a TinyFish company search. |
| `{{company_website_url}}` | recommended | Used for Apollo email matching always; only required by `hiring-contact-finder` itself when the company name is generic (Ramp, Notion, Linear, etc.), to disambiguate in the `purpose` field. |
| `{{campaign_id}}` | yes (to push) | Omit the whole "then push them to campaign" clause to get research-only output with no push attempted. |

## 2. Push an already-researched lead list

Skips research — use when you already have a lead table (from this chat, a CSV, or pasted) and just need it saved to a campaign.

```
Push these leads to campaign '{{campaign_id}}' for company '{{company}}' on {{env}}:

{{leads_table_or_paste}}
```

| Placeholder | Required | Notes |
|---|---|---|
| `{{campaign_id}}` | yes | Never guessed — always supply it. |
| `{{company}}` | yes | Needs a live application to this company already in that campaign. |
| `{{env}}` | yes | `dev` or `prod`. |
| `{{leads_table_or_paste}}` | yes | Name / title / LinkedIn / email / tier / source / confidence, however you have it. |

## 3. Run the full CV pipeline

Runs `ideal-cv-pipeline-v4` end to end: JD analysis → candidate analysis → ideal-candidate rewrite → pass/fail gate (with one auto-fix round) → humanize → re-gate → fill into the .docx template → push to Drive → find and push leads.

```
Run the ideal CV pipeline for {{candidate_name}} against this JD:

{{jd_text_or_link}}

Candidate profile: {{profile_text_or_file}}
Original CV template: {{cv_docx_path}}
Contact set 1: {{phone_1}} / {{email_1}}
Contact set 2: {{phone_2}} / {{email_2}}
WideApply campaignId: {{campaign_id}}
```

| Placeholder | Required | Notes |
|---|---|---|
| `{{candidate_name}}` | yes | |
| `{{jd_text_or_link}}` | yes | Paste or link. |
| `{{profile_text_or_file}}` | one of this or CV | LinkedIn/WideApply export, bio, etc. |
| `{{cv_docx_path}}` | one of this or profile | Needed as a .docx by stage 7 regardless; if only a profile is given, it's asked for mid-run. |
| `{{phone_1}} / {{email_1}}` | optional | Omit the whole line for none; a single value with no second set still counts as set 1. |
| `{{phone_2}} / {{email_2}}` | optional | Omit the line entirely for a one-file run. |
| `{{campaign_id}}` | optional | Needed only for stage 9's leads push; omit the line to skip straight to research-only leads (or add "skip leads" to skip stage 9 entirely). |

Add "don't push to Drive" or "skip leads" anywhere in the prompt to turn off `PUSH_TO_DRIVE` / `PUSH_LEADS` for that run only.

## 4. Push a finished resume to Drive

Standalone re-run of stage 8, for a .docx made earlier in the conversation (or a fresh one off disk) that was never pushed, or needs re-pushing after an edit.

```
Push {{docx_path}} to Drive for {{candidate_name}}, target company {{company}}, role {{role_short}}
```

| Placeholder | Required | Notes |
|---|---|---|
| `{{docx_path}}` | yes | Can list more than one file (e.g. both contact-set resumes). |
| `{{candidate_name}}` | yes | Used for the candidate's Drive folder (`<First Last> \| Tailored Resumes`). |
| `{{company}}` / `{{role_short}}` | yes | Go into the Drive file name: `<First>_<Last>_Resume_<Company>_<RoleShort>[_n].docx`. Taken from the JD if there's one in the conversation. |

## 5. Finalize a resume against a specific application

Uploads to S3 (via ElasticDash-BE, not Google Drive) — the PDF becomes the candidate-facing `cv` document (the only one the candidate's board previews), the `.docx` becomes a separate `cv_source` document visible only to admins, and the `.docx`'s URL becomes the admin-only review link.

```
Finalize the resume for application '{{application_id}}' in campaign '{{campaign_id}}' on {{env}}: pdf {{pdf_path}}, docx {{docx_path}}
```

| Placeholder | Required | Notes |
|---|---|---|
| `{{application_id}}` / `{{campaign_id}}` | yes | Never guessed. |
| `{{env}}` | yes | `dev` or `prod`. |
| `{{pdf_path}}` | yes | A PDF rendering of the resume (`soffice --headless --convert-to pdf`). This is what the candidate sees — a `.docx` alone won't preview or even show a download link for them. |
| `{{docx_path}}` | optional | The editable source, kept admin-only. Omit if there's no `.docx` worth recording separately. |

Add "review link should point elsewhere" with an explicit URL if you need `drive_review_url` to be something other than whichever of these two just got uploaded (rare).

## 6. Convert leads into connect-todos

Turns an already-inserted lead into a "connect on LinkedIn" to-do (with its follow-up chain), then triggers the backend's own message generation for that chain's follow-up step (`leadMessageGenerator.js`, tuned to the lead's `tier`) — no message content is drafted by this flow (changed 2026-10-05). One lead per call — loop for a batch, e.g. every id template 1's push just returned.

```
Convert lead '{{lead_id}}' in campaign '{{campaign_id}}' to a connect todo on {{env}}{{, for application '{{application_id}}'}}, then trigger message generation for it.
```

| Placeholder | Required | Notes |
|---|---|---|
| `{{lead_id}}` / `{{campaign_id}}` | yes | |
| `{{env}}` | yes | `dev` or `prod`. |
| `{{application_id}}` | optional | Only needed if the lead's company has more than one live application on this campaign. |

Make sure the lead was pushed (template 1 or 2) with the correct `tier` (`c_level`/`manager`/`peer`/`hr_recruiting`) before converting — the backend's generated message is tuned entirely off that field.

## 7. Run the full campaign pipeline

`campaignId` in, everything out: sources jobs as applications, tailors and finalizes a resume per application, researches leads, converts them to connect-todos. Fully automatic after one go-ahead on the sourced job table (`push-wideapply-applications`'s own checkpoint) — no per-resume pause.

```
Run the campaign pipeline for campaign '{{campaign_id}}', {{n}} applications, on {{env}}.

Candidate profile: {{profile_text_or_file}}
Original CV template: {{cv_docx_path}}
Contact set 1: {{phone_1}} / {{email_1}}
Contact set 2: {{phone_2}} / {{email_2}}
```

| Placeholder | Required | Notes |
|---|---|---|
| `{{campaign_id}}` | yes | |
| `{{n}}` | yes | Target **finished** application count for this run — not just how many get sourced. If a sourced application hits a handoff (JD/candidate mismatch only discoverable after full analysis — domain gap, missing clearance, etc.) or gets skipped for a thin JD, the skill sources a replacement automatically (`BACKFILL_HANDOFFS`, up to `MAX_BACKFILL_ROUNDS` extra rounds) rather than quietly finishing short of `{{n}}`. Add "don't backfill" or "source exactly {{n}} once" to turn this off and get the old sourced-once behavior. |
| `{{env}}` | yes | `dev` or `prod`. |
| `{{profile_text_or_file}}` | yes | Same shape `candidate-job-matcher` needs. |
| `{{cv_docx_path}}` | yes | Layout template for every per-application resume. |
| `{{phone_1}} / {{email_1}}`, `{{phone_2}} / {{email_2}}` | optional | Same as template 3, applied to every application's resume. |

Needs three scoped keys set up first (one-time, per skill): `push-wideapply-applications`, `push-resume-to-application`, `convert-wideapply-lead-to-todo`. Missing ones are reported once per skill in the run's summary, not per application.

**Does not include email outreach drafts** — `convert-wideapply-lead-to-email` (template 8) is deliberately standalone, not wired into this pipeline's stage 2c. Run it by hand per lead after this pipeline finishes, for any lead that has an email address.

## 8. Convert a lead into an email outreach draft sequence

Turns an already-inserted lead (one with an email address) into a 3-email Day 0/3/6 outreach draft sequence — three chained to-do drafts, not three sent emails. Day 0 sits open for the **candidate** (not the admin — there's no admin-side approve route for this) to review, optionally edit, and approve or reject on their own board before anything actually sends; nothing transmits until that happens. One lead per call — loop for a batch, same as template 6.

**Before using this**: the target application needs an `email_sender_id` already assigned (from its candidate's sender pool — a manual admin step, no skill for it yet), a non-empty job description, and the candidate needs an already-parsed resume (template 10, below — a one-time, candidate-scoped step, unrelated to whether a resume was already attached to this application via template 5). Missing any of these 400s with a specific message — this is not something to retry around.

```
Convert lead '{{lead_id}}' in campaign '{{campaign_id}}' to an email outreach sequence on {{env}}{{, for application '{{application_id}}'}}
```

| Placeholder | Required | Notes |
|---|---|---|
| `{{lead_id}}` / `{{campaign_id}}` | yes | |
| `{{env}}` | yes | `dev` or `prod`. |
| `{{application_id}}` | optional | Only needed if the lead's company has more than one live application on this campaign. |

Needs its own scoped key set up first (one-time): `convert-wideapply-lead-to-email` — separate from, and does not reuse, `convert-wideapply-lead-to-todo`'s key/env file.

## 9. Run the full campaign pipeline with full lead outreach

Everything template 7 does, plus full-channel outreach on every lead, grounded in real company research — and, as of 2026-10-05, no message or email content is drafted by this flow at all. Both channels are backend-generated: `convert-wideapply-lead-to-todo`'s `generate-message.mjs` trigger for LinkedIn, `convert-wideapply-lead-to-email`'s own conversion-time generation for email. This template's job is composing the right leads, feeding real research into each lead's `notes` so the backend's generator has something concrete to work with, and running the right conversion/trigger calls per tier — not writing the outreach copy itself. The 5-lead/2-tier research composition below is `hiring-contact-finder`'s own default (changed 2026-10-06, see that skill) — this template just uses it, it no longer overrides it.

### 9.1 Lead composition — 5 per application, 2 tiers

Uses `hiring-contact-finder`'s own default quotas as-is: up to 3 managers, up to 2 `hr_recruiting` contacts (Recruiter, Technical Recruiter, Talent Acquisition Partner/Manager, Head of Talent Acquisition, HR Business Partner, People Ops) — 5 total. C-level and colleague/peer are no longer fetched (changed 2026-10-06: neither is a recruiter or a hiring manager). Each bucket's quota is fixed, not backfilled from the other bucket landing short — a thin `hr_recruiting` bucket at a small company (founders do the hiring, see that skill's headcount rule) is expected and reported, not compensated for by pulling more managers. Same TinyFish → Apollo-email research pipeline and filter rules `hiring-contact-finder` already documents. When pushing (`push-wideapply-leads`), map straight through: `tier: 'manager'` / `tier: 'hr_recruiting'` (the backend also still accepts `c_level`/`peer` from any other source, this flow just no longer produces them). **Getting this mapping right matters** — the backend's message and email generators branch their whole hook/framing, and the email path's eligibility gate, entirely off this one field; there's no second place in this flow that corrects a wrong tier later.

### 9.2 Company/product research — feed it into the lead's own `notes`, don't draft with it

For each application's company: use TinyFish (`fetch_content` on the company's site/product pages, `search` for recent news/launches) to pull real, specific detail about the company and its product — what it does, a recent launch or feature, something concrete enough that a message quoting it couldn't have been written about any other company. **This research is still worth doing, but it no longer feeds a message you write** — write it into each lead's `notes` field at `push-wideapply-leads` time instead (that field already exists in that skill's mapping table). The backend's own generator (`leadMessageGenerator.js`'s `generateWideapplyLeadMessage`) reads this same field back as `leadNotes` when it drafts the chain's follow-up message, so research done here still shapes the real output, just inside the backend's own prompt rather than inside a template this repo fills in. If TinyFish genuinely turns up nothing usable for a company, leave `notes` to whatever `hiring-contact-finder` already captured rather than inventing detail.

### 9.3 Per-tier channel routing

No message or email content is drafted anywhere in this template (changed 2026-10-05) — every lead just gets converted and, for LinkedIn, triggered:

| Tier | LinkedIn | Email |
|---|---|---|
| Manager (Hiring Manager) | Yes — convert + trigger | Yes (`convert-wideapply-lead-to-email`) |
| `hr_recruiting` (Recruiter & HR) | Yes — convert + trigger | Yes (`convert-wideapply-lead-to-email`) |

Both tiers this flow produces are email-eligible, so both channels run for every lead here. (The backend's `convertWideapplyLeadToEmailSequence` still gates email to Manager/`hr_recruiting` only — `EMAIL_SEQUENCE_ELIGIBLE_TIERS` in `leadsController.js` — which matters if a C-level/Peer lead ever reaches this flow from some other source, but `hiring-contact-finder` itself no longer produces either tier as of 2026-10-06.)

For every lead, regardless of tier:
1. Run `convert-wideapply-lead-to-todo` (no `--message`, this template never drafts one).
2. Immediately run that skill's `generate-message.mjs` for the same lead — this is what actually produces the tier-aware, notes-aware private message for the chain's follow-up step. Skipping this step leaves that step empty until the candidate confirms the connection themselves, which is a worse default now that drafting it by hand isn't an option.

For Manager and `hr_recruiting` leads only, additionally, when the application has an email address on the lead and an `email_sender_id` assigned: run `convert-wideapply-lead-to-email` — its 3-email sequence is generated server-side at conversion time, no separate trigger call needed (unlike LinkedIn).

### 9.4 Why both channels can run on the same lead

`convert-wideapply-lead-to-todo` (LinkedIn) and `convert-wideapply-lead-to-email` track conversion independently (`wideapply.Leads.converted_todo_item_id` vs. `converted_email_sequence_id`, migration 066) — converting a Manager or `hr_recruiting` lead one way never blocks converting it the other way too, so both run for those two tiers without a second call 400ing.

```
Run the campaign pipeline for campaign '{{campaign_id}}', {{n}} applications, on {{env}}. For each application, research up to 5 leads per hiring-contact-finder's own 3 manager / 2 hr_recruiting split, with company/product research saved into each lead's notes. Convert every lead to a LinkedIn connect-todo and trigger its backend message generation. For leads that also have an email address and an assigned sender on the application, additionally convert to a Day 0/3/6 email sequence.

Candidate profile: {{profile_text_or_file}}
Original CV template: {{cv_docx_path}}
Contact set 1: {{phone_1}} / {{email_1}}
Contact set 2: {{phone_2}} / {{email_2}}

```

| Placeholder | Required | Notes |
|---|---|---|
| `{{campaign_id}}` | yes | |
| `{{n}}` | yes | Target **finished** application count — see template 7's `{{n}}` note; the same backfill-on-handoff behavior applies here. |
| `{{env}}` | yes | `dev` or `prod`. |
| `{{profile_text_or_file}}` | yes | Same shape `candidate-job-matcher` needs. |
| `{{cv_docx_path}}` | yes | Layout template for every per-application resume. |
| `{{phone_1}} / {{email_1}}`, `{{phone_2}} / {{email_2}}` | optional | Same as template 3, applied to every application's resume. |

Needs everything template 7 needs (the three scoped keys listed there), plus `convert-wideapply-lead-to-email`'s own scoped key (template 8), plus migration 066 applied (the `hr_recruiting` tier value and the `converted_email_sequence_id` column — restart/migrate the backend before this template's first run). The `email_sender_id` assignment itself is still a separate, manual admin step with no skill of its own — a Manager/`hr_recruiting` application without one gets its LinkedIn message only, reported as "no email draft: no sender assigned" per application, not silently skipped. Also run template 10 once for this candidate before the first email-draft attempt, unless you already know their resume was parsed in a prior run.

Everything in 9.1-9.3 (the 2-tier composition, the TinyFish research-into-`notes` step, and the convert-then-trigger routing) is specific to this template — don't carry it into template 1, 6, or 7 unless a prompt says so there too.

## 10. Parse a candidate's resume (precondition for email outreach)

One-time, per **candidate** (not per application): fixes `convert-wideapply-lead-to-email`'s `"This candidate has no parsed resume yet"` 400. This is a different store (`wideapply.Resumes.raw_text`) from the per-application PDF/`.docx` template 5 attaches (`wideapply.ApplicationDocuments`), which has no text-extraction step at all — attaching a resume to every application a candidate has does not satisfy this, no matter how many times it's done.

```
Parse the resume for campaign '{{campaign_id}}' on {{env}}: {{docx_path}}
```

| Placeholder | Required | Notes |
|---|---|---|
| `{{campaign_id}}` | yes | Never guessed — used to resolve the candidate's `edUserId` server-side. |
| `{{env}}` | yes | `dev` or `prod`. |
| `{{docx_path}}` | yes | Must be a `.docx` — text is extracted locally from `word/document.xml`; there's no local PDF extraction here. Any finished `.docx` for this candidate works, doesn't need to be the one attached to a specific application. |

Needs its own scoped key set up first (one-time): `push-wideapply-resume` — separate from every other skill's key/env file. Run this once before the first email-draft attempt for a candidate (template 8 or 9); re-running later with an updated `.docx` is harmless.

## 11. Build a GrokBot job search condition

Runs `candidate-job-matcher-grokbot`: computes the candidate's own seniority
and YOE, expands the target title into variants, derives geography and
relocation filters, and scopes the search to the fixed job board tier list
(startup boards, then mixed VC/community boards, then Indeed as a fallback
tier). Outputs one JSON search condition, nothing else; this template does
not call GrokBot, pull job postings, or push anything to a backend. Hand the
resulting JSON to GrokBot separately to actually run the search.

```
Build a GrokBot search condition for {{candidate_name}}, targeting '{{target_title}}'.

Candidate profile: {{profile_text_or_file}}
CV: {{cv_path}}
```

**Worked example:**

```
Build a GrokBot search condition for Agrima Jain, targeting 'Full Stack Software Engineer'.

Candidate profile: .temp/jimwill2096-gmail-com-wideapply-export.md
CV: .temp/Agrima_Jain_Resume_Parallel_Systems_Full_Stack_SWE.docx
```

| Placeholder | Required | Notes |
|---|---|---|
| `{{candidate_name}}` | yes | Labels the output condition's `candidate.name` field only. |
| `{{target_title}}` | recommended | Anchor title Step 2 expands into variants. Omit it and the skill falls back to the candidate's own most recent title from the profile/CV, and says so explicitly. |
| `{{profile_text_or_file}}` | yes if available | Same shape `candidate-job-matcher` needs; primary source for YOE, Desired Job Location, Work Authorization, Skills. |
| `{{cv_path}}` | yes if no profile export | Used as a fallback or cross-check source for titles, experience dates, and skills. If both are given and disagree, the skill flags it and prefers the profile export. |

Optional, append to the prompt if relevant: a freshness window ("jobs posted in the last 7 days"), a request to exclude recruiting agencies, or an explicit company include/exclude list. Without these the skill applies its own defaults and says so in the output notes.

The job board list itself (startup boards first, mixed boards next, Indeed
as fallback) is fixed in the skill, not something this template needs to
restate per run, see `.claude/skills/candidate-job-matcher-grokbot/SKILL.md`
for the full tier table.

## 12. Bulk-apply from a pre-gathered job list

Runs `wideapply-campaign-pipeline` in `MODE = "bulk_import"`: takes a markdown
file of jobs you already have (for example, the output of a GrokBot search
run against template 11's condition), filters and ranks it down to a target
count, schedules a fixed number of applications per day, then per job in
daily batches drafts a tailored resume, uploads it, researches leads, and
drafts LinkedIn and email outreach for them. CV optimization runs in parallel
across a day's batch; lead drafting and conversion runs 10 at a time in
parallel per application, same concurrency template 9 already uses.

```
Run the campaign pipeline in bulk_import mode for campaign '{{campaign_id}}', on {{env}}. Jobs file: {{jobs_markdown_path}}. Target {{n}} finished applications, {{applications_per_day}} per day.

Candidate profile: {{profile_text_or_file}}
Original CV template: {{cv_docx_path}}
Contact set 1: {{phone_1}} / {{email_1}}
Contact set 2: {{phone_2}} / {{email_2}}
```

**Worked example:**

```
Run the campaign pipeline in bulk_import mode for campaign 'e018b7eb-f8d9-4fae-853b-8dcd925505a0', on dev. Jobs file: .temp/grokbot-jobs-raw.md. Target 140 finished applications, 20 per day.

Candidate profile: .temp/Mark-Matas-wideapply-export.md
Original CV template: .temp/Agrima_Jain_Resume_Parallel_Systems_Full_Stack_SWE.docx
Contact set 1: +64210402458 / lotr747969@gmail.com
```

| Placeholder | Required | Notes |
|---|---|---|
| `{{campaign_id}}` | yes | Never guessed, same rule as every other template here. |
| `{{env}}` | yes | `dev` or `prod`. |
| `{{jobs_markdown_path}}` | yes | A markdown file of raw jobs (table or repeated sections, exact shape doesn't matter as long as title, company, and a real job description are present per job). Stage 0 parses, dedups, scores, filters, and ranks this before anything is logged as an application. |
| `{{n}}` | yes | Target **finished** application count, same meaning as template 7's `{{n}}`, not the raw job count in the file. |
| `{{applications_per_day}}` | optional | Defaults to 20 if omitted. Paces the batch across days rather than running the whole target count in one sitting. |
| `{{profile_text_or_file}}` | yes | Same shape `candidate-job-matcher` needs. |
| `{{cv_docx_path}}` | yes | Layout template for every per-application resume. |
| `{{phone_1}} / {{email_1}}`, `{{phone_2}} / {{email_2}}` | optional | Same as template 3, applied to every application's resume. |

Stage 0 shows a go-ahead table (every parsed job, kept vs. reserved vs.
dropped, and which day each kept job is scheduled for) before logging
anything as an application, the one pause in this mode, same role Stage 1's
table plays in the default `MODE = "source"` flow. Each invocation after that
processes exactly one day's unprocessed batch and stops, run it again (or set
up a daily cron via the `schedule` skill against this same run folder) to work
through the rest of the plan. Needs everything template 7/9 need (the
`push-wideapply-applications`, `push-resume-to-application`,
`convert-wideapply-lead-to-todo` and `convert-wideapply-lead-to-email` scoped
keys), plus template 10 run once for this candidate before the first batch's
email-draft attempt.

## 13. Fetch fresh ATS jobs and schedule next week's applications

Two steps back to back: `fetch-ats-jobs.mjs` (added 2026-10-05) pulls postings
within the last 7 days directly from the JSON APIs behind every Greenhouse/
Ashby/Lever/Workday company row in a sources.csv (see
`.claude/skills/fetch-ats-jobs/fetch-ats-jobs.mjs`'s own header comment), then
`wideapply-campaign-pipeline` in `MODE = "bulk_import"` takes that output as
`BULK_IMPORT_JOBS_FILE`, filters/ranks/schedules it, and runs it through CV
drafting, upload, and lead outreach exactly like template 12 — except this
source defaults to `APPLICATIONS_PER_DAY = 4` and a start date of the coming
Monday (not today), skipping weekends, so a weekly 7-day-freshness fetch
always paces into a full week of 4-a-day applying, see that skill's Stage 0
step 5. Leads/connect-todos/email sequences are not a separate schedule — they
get created on whichever real calendar day their application's batch is
actually processed (see that skill's "Day-batch execution" section), so run
this through the `schedule` skill's daily cron rather than all at once if the
point is to actually spread the outreach across the week, not just the
application records.

```
Fetch fresh ATS jobs from {{sources_csv_path}} within {{days}} days, then run the campaign pipeline in bulk_import mode for campaign '{{campaign_id}}', on {{env}}, 4 applications per day starting the coming Monday. Target {{n}} finished applications.

Candidate profile: {{profile_text_or_file}}
Original CV template: {{cv_docx_path}}
Contact set 1: {{phone_1}} / {{email_1}}
Contact set 2: {{phone_2}} / {{email_2}}
```

**Worked example:**

```
Fetch fresh ATS jobs from .temp/grokbot/sources.csv within 7 days, then run the campaign pipeline in bulk_import mode for campaign 'e018b7eb-f8d9-4fae-853b-8dcd925505a0', on dev, 4 applications per day starting the coming Monday. Target 20 finished applications.

Candidate profile: .temp/Mark-Matas-wideapply-export.md
Original CV template: .temp/Agrima_Jain_Resume_Parallel_Systems_Full_Stack_SWE.docx
Contact set 1: +64210402458 / lotr747969@gmail.com
```

| Placeholder | Required | Notes |
|---|---|---|
| `{{sources_csv_path}}` | yes | Columns `source,kind,platform,url,...`; only `kind=company` rows with `platform` in `greenhouse`/`ashby`/`lever`/`workday` are actually fetched — `kind=board` rows and `platform=custom` rows are skipped and reported, not silently dropped. |
| `{{days}}` | optional | Defaults to 7. Passed to `fetch-ats-jobs.mjs --days`. |
| `{{campaign_id}}` | yes | Never guessed, same rule as every other template here. |
| `{{env}}` | yes | `dev` or `prod`. |
| `{{n}}` | yes | Target **finished** application count, same meaning as template 12's `{{n}}`. |
| `{{profile_text_or_file}}` | yes | Same shape `candidate-job-matcher` needs — also used to filter/rank the fetched jobs in Stage 0 (seniority, YOE, relocation gate). |
| `{{cv_docx_path}}` | yes | Layout template for every per-application resume. |
| `{{phone_1}} / {{email_1}}`, `{{phone_2}} / {{email_2}}` | optional | Same as template 3, applied to every application's resume. |

Run `fetch-ats-jobs.mjs` first and point `BULK_IMPORT_JOBS_FILE` at the
`all_jobs.json` it writes (default `.temp/grokbot/fetched_jobs/all_jobs.json`)
— `wideapply-campaign-pipeline`'s Stage 0 reads that JSON shape directly, no
markdown conversion needed. Needs everything template 12 needs (the same
three scoped keys, plus template 10 run once per candidate before the first
email-draft attempt). Leads use `hiring-contact-finder`'s current default
(manager/hr_recruiting only, 5 per application, changed 2026-10-06 — see that
skill), same as every other template that chains it.
