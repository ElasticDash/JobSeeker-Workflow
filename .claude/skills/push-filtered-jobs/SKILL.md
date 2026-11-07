---
name: push-filtered-jobs
description: Forward jobs the AI (Claude Code or GrokBot) filtered out on fit, with the reason, to ElasticDash-BE's filtered-jobs endpoint for a WideApply campaign. Only AI fit rejections that happened AFTER the title and freshness filters (skill mismatch, YOE mismatch, domain gap, clearance, relocation, work authorization). Never title, freshness, US-location, blacklist or seen-cache drops. Triggers: push filtered jobs, record rejected jobs, upload filtered-out jobs, why were these jobs filtered.
---

# Push Filtered Jobs (AH-499)

Every AI fit rejection in this workflow used to live only in a run's markdown output. This skill sends them to
`POST /api/wideapply/admin/campaigns/:campaignId/filtered-jobs` so an admin can see which jobs were turned away and why.
This is a write to a real campaign: run it once at the end of a run, not per job, and use `dev` unless the user says `prod`
(confirm before the first prod write in a session).

## What counts (and what never does)

Record a job **only** when the AI read it and judged it a poor fit, after the cheap filters had passed it:

| `filterStage` | Where it happens |
|---|---|
| `matcher_stack` | `candidate-job-matcher-*` stack-match / skill-years / YOE / JD screening on the posting |
| `jd_fit_gate` | `wideapply-campaign-pipeline` Stage 1.5 |
| `bulk_score` | `wideapply-campaign-pipeline` Stage 0 step 3, the YOE / relocation / state-exclusion / fit judgment |
| `handoff` | Stage 2a handoff for a genuine JD/candidate mismatch (domain gap, clearance). A resume-generation failure or thin-JD skip is a tooling/data problem, not a fit judgment, and is not recorded |

**Never record**: a job dropped for title or seniority-in-title, freshness (older than 48 hours), US-location, the company
blacklist, the seen-jobs cache, a missing JD, or a Built In job with no ATS URL. Those are not AI fit judgments. If a posting
is older than the window or fails the title check, it never reaches this skill.

## Record format

During the run, append one object per rejected job to `<run folder>/filtered_jobs.json` (a JSON array):

```json
{
  "company": "Acme",
  "role": "Senior Backend Engineer",
  "jobPostUrl": "https://...",
  "jobDescription": "full text if you have it",
  "location": "Remote, US",
  "jobPostedAt": "2026-11-05",
  "source": "hirebase | theirstack | apify | grokbot | ats",
  "filterStage": "matcher_stack | jd_fit_gate | bulk_score | handoff",
  "filterReasonCode": "skill_mismatch | yoe_mismatch | domain_gap | clearance | relocation | work_authorization | other",
  "filterReason": "One or two plain sentences naming the specific unmet requirement, e.g. 'Hard requires 3 years of Golang; candidate's only Go use is a side project.'",
  "filteredBy": "claude_code | grokbot"
}
```

`filterReason` must name the concrete requirement (the specific skill, the stated years vs the candidate's), never a vague
"not a good fit". Pick the code that matches: `skill_mismatch` (named tech/skill/years gap), `yoe_mismatch` (overall YOE
bound), `domain_gap` (BIM, healthcare, etc.), `clearance`, `relocation`, `work_authorization`, else `other`. Use
`filteredBy: "grokbot"` only for a rejection GrokBot itself reported; everything this repo's agents judge is `claude_code`.
Same company + role pushed again updates the existing row instead of adding a second one.

## Running it

```
node .claude/skills/push-filtered-jobs/push-filtered-jobs.mjs --env dev --campaign <campaignId> --file <run folder>/filtered_jobs.json
```

It reads the same env file as `push-wideapply-applications` (`.secrets/wideapply-applications-skill/.env.<env>`), validates
every item, skips blacklisted companies, sends up to 200 per request, and prints
`{ ok, created, updated, rejected, skipped, failures }`. Report the counts and every skipped/rejected item to the user. A
non-empty `filtered_jobs.json` that is not pushed by the end of a run is a defect, so push even when the application side
had a shortfall. Skip silently only when the file is empty or absent.
