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
    - [9.1 Lead composition — 20 per application, 4 tiers](#91-lead-composition--20-per-application-4-tiers)
    - [9.2 Company/product research — before drafting anything](#92-companyproduct-research--before-drafting-anything)
    - [9.3 Per-tier channel + message templates](#93-per-tier-channel--message-templates)
    - [9.4 Why both channels can run on the same lead](#94-why-both-channels-can-run-on-the-same-lead)
  - [10. Parse a candidate's resume (precondition for email outreach)](#10-parse-a-candidates-resume-precondition-for-email-outreach)

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
| `{{role}}` | yes | Drives `hiring-contact-finder`'s title-tier mapping (C-level / manager / hr_recruiting / colleague, 2/3/5/10 quotas). |
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

Turns an already-inserted lead into a "connect on LinkedIn" to-do (with its follow-up chain). One lead per call — loop for a batch, e.g. every id template 1's push just returned.

```
Convert lead '{{lead_id}}' in campaign '{{campaign_id}}' to a connect todo on {{env}}{{, for application '{{application_id}}'}}
```

| Placeholder | Required | Notes |
|---|---|---|
| `{{lead_id}}` / `{{campaign_id}}` | yes | |
| `{{env}}` | yes | `dev` or `prod`. |
| `{{application_id}}` | optional | Only needed if the lead's company has more than one live application on this campaign. |

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

Everything template 7 does, plus per-tier message/email drafting grounded in real company research, and both outreach channels wired in automatically. The 20-lead/4-tier research composition below is now `hiring-contact-finder`'s own default (changed 2026-10-03, see that skill) — this template just uses it, it no longer overrides it.

### 9.1 Lead composition — 20 per application, 4 tiers

Uses `hiring-contact-finder`'s own default quotas as-is: up to 2 C-level, up to 3 managers, up to 5 `hr_recruiting` contacts (Recruiter, Technical Recruiter, Talent Acquisition Partner/Manager, Head of Talent Acquisition, HR Business Partner, People Ops), up to 10 colleagues/peers (20 total). Each bucket's quota is fixed, not backfilled from another bucket that landed short — a thin `hr_recruiting` bucket at a small company (founders do the hiring, see that skill's headcount rule) is expected and reported, not compensated for by pulling more colleagues. Same TinyFish → Apollo-email research pipeline and filter rules `hiring-contact-finder` already documents. When pushing (`push-wideapply-leads`), map the colleague bucket to `tier: 'peer'` and the 4th bucket to `tier: 'hr_recruiting'` (migration 066 added this value — `c_level`/`manager`/`peer`/`hr_recruiting` are the only 4 the backend accepts).

### 9.2 Company/product research — before drafting anything

For each application's company, before drafting any message or email below: use TinyFish (`fetch_content` on the company's site/product pages, `search` for recent news/launches) to pull real, specific detail about the company and its product — what it does, a recent launch or feature, something concrete enough that a message quoting it couldn't have been written about any other company. This is what fills in `[praise the company/product]` and the more specific `[specific_question]` options in 9.3 below — a message with none of this grounding reads as a generic template and should not go out. If TinyFish genuinely turns up nothing usable for a company, fall back to the job description and the company's About/LinkedIn page rather than inventing detail.

**Don't simulate having used the product (changed 2026-10-03).** Actually trying every company's product before messaging doesn't scale across a whole campaign, and claiming hands-on experience you don't have reads as fake the moment a founder asks a follow-up. Research from the outside instead (site, blog, docs, demo videos, case studies, launch posts) and draft the C-level message as a genuinely curious prospective user who hasn't tried it yet — identify a real, specific open question that their own public materials don't answer, not a vague compliment. "I read about [X] on your site — before I try it, I'm curious about [Y]" beats "I've been using [X] and noticed [Y]" when [Y] was never actually used.

### 9.3 Per-tier channel + message templates

Two different things get drafted per lead, mapped onto the LinkedIn connect-todo chain's two separate fields (`convert-wideapply-lead-to-todo`'s `--message` vs `--follow-up-message` — see that skill's SKILL.md):

- **`--message`** (sent *with* the connection request) — leave this empty for all 4 tiers below unless the lead's profile specifically calls for a one-line reason for connecting. LinkedIn invite notes are short and often skipped; the real content goes in `--follow-up-message`.
- **`--follow-up-message`** (sent *after* the connection is accepted — the chain's own "Send private message to `<name>`" step) — this is where every "LinkedIn Message" template below goes, together with its "if replied" / "Follow-up" continuation appended underneath as labeled sections (there's no separate DB slot for those — write them into the same content field as "If they reply:" / "Follow-up (if no reply after ~3 days):" blocks, so whoever acts on the to-do has the whole conversation planned out, not just the opener).

| Tier | LinkedIn | Email |
|---|---|---|
| C-level | Yes (message with CTA + follow-up) | No |
| Manager (Hiring Manager) | Yes (message with CTA + follow-up) | Yes (`convert-wideapply-lead-to-email`) |
| `hr_recruiting` (Recruiter & HR) | Yes (message with CTA + 1 follow-up) | Yes (`convert-wideapply-lead-to-email`) |
| Peer (Colleague) | Yes (message with CTA + 1 follow-up) | No |

**Every message proposes the meeting directly, in the first line — never gated behind a reply.** Revised 2026-10-04, superseding this same day's earlier "if they reply" version: asking a question first and only proposing a meeting once they answer adds a whole extra round-trip most leads never complete, and we are not acting as an employee or a job hunter here anyway — the candidate can be briefed before the meeting regardless of what the lead thinks the conversation is about. The CTA now lives directly in `--follow-up-message`'s opening content, right after "thanks for connecting," not in a separate reply-gated step.

Pick one of these two lines based on the lead's `Location` column from `hiring-contact-finder`'s output (see that skill's Step 3/6) against the candidate's own current city from their profile. **Default to the virtual option whenever `Location` is blank or unclear — never presume someone is local without evidence:**
- **Same city as the candidate**: "Would you be up for grabbing a coffee sometime? Happy to keep it to about 15 minutes."
- **Different city, or `Location` unknown**: "Would you have about 15 minutes sometime for a quick call or video chat?"

Each tier's message is: *greeting + thanks for connecting → a tier-specific, concrete reason for reaching out → the CTA line above, in the same message.* The "Follow-up (if no reply after ~3 days)" step restates the same ask briefly — it never introduces the CTA for the first time, since the first message already did. The reason differs by tier:
- **C-level**: interest in the business, the company, and the product itself — not the job. Ground it in something specific and public (9.2's research).
- **Manager**: wanting to understand the role better, directly from the person who owns it — anchored in one real, specific question the JD leaves open.
- **`hr_recruiting`**: wanting to understand the role, specifically one detail stated in the job description that isn't fully clear.
- **Peer (Colleague)**: wanting to understand the role and how it actually works day to day, from someone currently doing it.

**C-level** — LinkedIn only:
- Message: "Hey [name], thanks for connecting! [praise the company/product based on something specific and public — a feature, launch, or case study from their site/blog]. I'd love to learn more about the business and the product directly from you. [same-city or virtual CTA line above, per the lead's Location]"
- Follow-up (if no reply after ~3 days): "Hey [name], [optional: one new detail from research, framed as something you read/noticed, not something you did]. Still would love to learn more about the business and product if you have about 15 minutes — [same-city or virtual CTA line above, restated briefly]."

**Manager** — LinkedIn:
- Message: "Hey [name], thanks for connecting! Just applied for the [role_title] role on your team, and would love to understand it better directly from you — [specific_question]. [same-city or virtual CTA line above, per the lead's Location]" — default question "The JD covers a lot. Which skills matter most to you?"; pick a more specific one when the research in 9.2 or the JD supports it, e.g. "The JD mentions both [X] and [Y]. Which matters more day to day?" / "Is the stack mostly [X], or is [Y] a big part too?" / "How big is the team this role would lead?" / "Is it more building new things or improving what's there?"
- Follow-up (if no reply after ~3 days): "Hey [name], quick one if you've got a sec: [short version of the question above]. Still happy to [coffee/a quick call], about 15 minutes, whenever works."

**Manager** — Email (`convert-wideapply-lead-to-email`, no override needed — its existing generator already produces exactly this 3-step shape from the job description and resume):
- Email 1 (Day 0): subject "Regarding my application for [Job Title]" — opener saying the application was just submitted and the resume is attached, then the cover letter itself (why this company, what the candidate can do matched to the JD, motivation for the role), closing with an offer to talk. Resume attached.
- Email 2 (Day 3, reply): skills follow-up — 2-3 JD must-have skills each backed by a resume-grounded proof line.
- Email 3 (Day 6, reply): short, asks whether there's someone else at the company worth talking to about the role.

**`hr_recruiting`** — LinkedIn:
- Message: "Hey [name], thanks for connecting! Just applied for the [role_title] role at [company_name] and I'm really keen on it. There's one thing the JD doesn't fully spell out — [specific_question]. [same-city or virtual CTA line above, per the lead's Location]" — default "Is [skill from JD] a must-have, or more of a nice-to-have?"; or "The JD covers a lot of ground — which of it matters most for the team?" / "Roughly how big is the team?" / "What does the interview process look like?"
- Follow-up (1 only, if no reply after ~3 days): "Hey [name], quick one if you've got a sec: [short version of the question above]. Still happy to [coffee/a quick call], about 15 minutes, whenever works."

**`hr_recruiting`** — Email (`convert-wideapply-lead-to-email`, same generator as Manager — the recruiter-facing content it already produces, cover letter + skills follow-up + "who else should I talk to", matches this tier as-is):
- Email 1: cover letter as the body, mentions the application was submitted and the resume is attached.
- Email 2 (3 days later, reply): highlights the key skills matching the JD.
- Email 3 (3 days later, reply): asks if there's someone else to be redirected to.

**Peer (Colleague)** — LinkedIn only:
- Message: "Hey [name], thanks for connecting! I'm looking at the [role_title] role at [company_name], and since you've been in it for [period_of_time], you'd know better than anyone what it's actually like day to day. [same-city or virtual CTA line above, per the lead's Location]" — if a specific angle helps beyond the generic day-to-day framing, weave it in instead: "What does the stack look like in practice?" / "How big is the team you are managing now?" / a question built from the lead's actual title and the JD.
- Follow-up (1 only, if no reply after ~3 days): "Hey [name], quick one if you've got a sec: [short version of the question above, if one was used]. Still happy to [coffee/a quick call], about 15 minutes, whenever works."

### 9.4 Why both channels can run on the same lead

`convert-wideapply-lead-to-todo` (LinkedIn) and `convert-wideapply-lead-to-email` track conversion independently (`wideapply.Leads.converted_todo_item_id` vs. `converted_email_sequence_id`, migration 066) — converting a Manager or `hr_recruiting` lead one way never blocks converting it the other way too, so both run for those two tiers without a second call 400ing.

```
Run the campaign pipeline for campaign '{{campaign_id}}', {{n}} applications, on {{env}}. For each application, research up to 20 leads per hiring-contact-finder's own 10 peer / 2 C-level / 3 manager / 5 hr_recruiting split. Before drafting anything, use TinyFish to research each company and its product for real, specific detail. Draft and save a personalized LinkedIn message (plus if-replied/follow-up branches) on every lead's connect-todo via --follow-up-message, per tier template. For Manager and hr_recruiting leads that also have an email address and an assigned sender on the application, additionally draft a Day 0/3/6 email sequence.

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

Everything in 9.1-9.3 (the 4-tier composition, the TinyFish research step, the per-tier message templates, and routing drafted content through `--follow-up-message` rather than `--message`) is specific to this template — don't carry it into template 1, 6, or 7 unless a prompt says so there too.

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
