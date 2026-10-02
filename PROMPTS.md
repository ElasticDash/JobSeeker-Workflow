# Prompt dictionary

Copy-paste templates for the recurring things this repo's skills get asked to do. Fill in the `{{placeholder}}` slots and send as-is in a Claude Code chat opened in this repo; the wording is phrased to hit each skill's own trigger phrases (see `.claude/skills/*/SKILL.md`).

Where a template includes a markdown link like `([company_linkedin_url]({{company_linkedin_url}}))`, the link text (`company_linkedin_url`) is literal — leave it as-is. Only the URL inside `(...)` is the fill-in value. This labels what each link is for even after the template is filled in.

## Contents

1. [Find leads and push to a campaign](#1-find-leads-and-push-to-a-campaign)
2. [Push an already-researched lead list](#2-push-an-already-researched-lead-list)
3. [Run the full CV pipeline](#3-run-the-full-cv-pipeline)
4. [Push a finished resume to Drive](#4-push-a-finished-resume-to-drive)
5. [Finalize a resume against a specific application](#5-finalize-a-resume-against-a-specific-application)
6. [Convert leads into connect-todos](#6-convert-leads-into-connect-todos)
7. [Run the full campaign pipeline](#7-run-the-full-campaign-pipeline)

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
| `{{role}}` | yes | Drives `hiring-contact-finder`'s title-tier mapping (C-level / manager / peer). |
| `{{company}}` | yes | Must match the company name already on a live application in the target campaign/dashboard, or the push 400s. |
| `{{company_linkedin_url}}` | optional | Pins the company identity in Step 0, cuts down same-name-company noise. Skip it and the skill derives it from search results. |
| `{{company_website_url}}` | yes | Used for Apollo email matching and Exa queries — hiring-contact-finder treats this as required. |
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
| `{{n}}` | yes | Target "found" application count for this run. |
| `{{env}}` | yes | `dev` or `prod`. |
| `{{profile_text_or_file}}` | yes | Same shape `candidate-job-matcher` needs. |
| `{{cv_docx_path}}` | yes | Layout template for every per-application resume. |
| `{{phone_1}} / {{email_1}}`, `{{phone_2}} / {{email_2}}` | optional | Same as template 3, applied to every application's resume. |

Needs three scoped keys set up first (one-time, per skill): `push-wideapply-applications`, `push-resume-to-application`, `convert-wideapply-lead-to-todo`. Missing ones are reported once per skill in the run's summary, not per application.
