---
name: push-wideapply-applications
description: Search for N jobs matching a WideApply candidate's profile via Hirebase (default) or TheirStack, per JOB_SOURCE (looping until N is met, excluding postings requiring more experience than the candidate has and jobs already shown in a prior run) and log the matches into that candidate's campaign as "found"-status job applications, via ElasticDash-BE's applications API. Use whenever the user wants jobs found via Hirebase or TheirStack automatically added/logged/created as applications for a candidate, not just listed.
---

# Push WideApply Applications

Chains two things that are each already handled elsewhere:

1. **Search** — delegate to `candidate-job-matcher-hirebase` (default) or `candidate-job-matcher`, per `JOB_SOURCE` (invoke whichever one via the Skill tool) to turn the candidate's profile into a sized, sampled, deduped job list from that provider. Do not re-implement seniority calc, filter building, or the size-then-pull loop here — that skill owns it, whichever one is in play.
2. **Log as found** — map each accepted match to a WideApply application object and insert it via `POST /admin/campaigns/:campaignId/applications` (`status: 'found'`), by running `push-applications.mjs` in this skill's own folder. The script — not you — holds the auth key and makes the HTTP call; you only ever build the JSON payload and invoke it.

This is a **write to a real candidate's campaign**, not a read-only search. Even though the user asked for search-and-log to happen in one flow, always show the mapped table (Step 3 below) before calling the script — do not skip straight from search results to a backend insert with no visible intermediate step.

## Where this can actually execute

Same constraint as `push-wideapply-leads`: this needs a real shell on the user's machine to run `push-applications.mjs` (a Desktop app Chat/Cowork session gets file transfer, not shell access, even with the repo connected). If you're in a session without real shell access, build the exact command (see "Calling the script" below) and hand it to the user to run themselves, or to paste into a Claude Code session on their machine. Do not ask the user to paste `.env.dev`/`.env.prod` contents into the session to work around this — printing a secret into chat defeats the point of keeping it in a gitignored file.

## When this triggers

The user wants job-search matches turned into logged applications for a specific candidate/campaign, not just a table to look at. Trigger on: "find and log jobs for this candidate", "search Hirebase/TheirStack and add these as found applications", "auto-log jobs for campaign X". If the user only wants a job table with no backend write, that's plain `candidate-job-matcher-hirebase` or `candidate-job-matcher` — don't invoke this skill for that.

## What you need before calling the script

1. **`campaignId`** — the user gives you this directly. If they haven't given it, ask for it — don't guess or search for it yourself. This is the WideApply campaign the applications get attached to, separate from anything the search provider returns. Also pass this to the matcher skill in use as its dedup cache key if the candidate's email isn't available in the profile export (see that skill's "Seen-jobs dedup" section) — reuse the same `campaignId` across runs so dedup actually accumulates.
2. **`JOB_SOURCE`** (optional, default `"hirebase"`) — `"hirebase"` delegates Step 1 to `candidate-job-matcher-hirebase`; `"theirstack"` delegates it to `candidate-job-matcher`. Defaults to Hirebase as of 2026-10-04 (previously hardcoded to TheirStack with no setting). When this skill is called from `wideapply-campaign-pipeline`, that skill passes its own `JOB_SOURCE` setting through unchanged — don't pick a different one here.
3. **The candidate's profile export** — same input both matcher skills need (title history, YOE, location preference, work auth, desired salary).
4. **Target job count (N)** — how many "found" applications to log this run. Ask if unstated. This is passed straight through to the matcher skill in use as its own target count (see that skill's Inputs) — it owns the pull-and-filter-until-N loop, including the numeric YOE cutoff and the seen-jobs dedup, so don't re-implement any of that here.
5. **Environment** — default to `dev`. Only use `prod` if the user explicitly says "prod" or "production". Before the *first* prod write in a session, confirm explicitly with the user even if they already said prod once.

## Step 1: Run the search

Invoke `candidate-job-matcher-hirebase` or `candidate-job-matcher` (per `JOB_SOURCE`) with the candidate profile, the target count N, and any explicit role/freshness/scope instructions from the user. Take its output table as-is — don't re-derive filters, don't re-run queries against that provider yourself, and don't re-apply the YOE or dedup filtering yourself; that skill already ran the full pull-and-filter loop and already updated its own seen-jobs cache for this candidate just by showing you the table (see its Step 4/5 and "Seen-jobs dedup" section) — no further action needed here to keep dedup working. The two providers keep separate caches (different `_id`/job-key space), so don't treat a job "seen" under one provider as seen under the other.

If the matcher skill reports it fell short of N (search exhausted or hit its safety cap), don't silently push fewer applications and call it done — relay that shortfall to the user in Step 3's summary alongside the mapped table, same as you would for any other partial result.

## Step 2: Decide which matches to log

The matcher skill already pulled toward N and already dropped near-duplicates and out-of-range YOE postings, so by default every row in its output table is a candidate to log — don't re-trim to some other count on top of N. The one exception: if the user reviews the table (Step 3) and wants to hand-drop a specific row (wrong company, bad fit despite passing the filters), respect that.

**Relocation-based location filter.** Check the candidate profile's "Desired Job Location" / willing-to-relocate answer. If it explicitly states not willing to relocate, drop any row that is not remote, not in the candidate's current city, and not in their stated desired city/location — don't log it as "found" at all (don't count it against N; the matcher skill's own seen-jobs cache already marked it seen, so it won't resurface). This is strictly better than letting it through and discovering the mismatch later as an `ideal-cv-pipeline-v4` handoff inside `wideapply-campaign-pipeline` — a pure location/relocation check needs no JD analysis, so there's no reason to spend a sourcing slot on it. If the profile says nothing, or says willing to relocate, every location passes this filter (same as both matcher skills' and `requirement-finder`'s own relocation-passes-by-default house rule). Report any row dropped this way in the Step 3 summary, same as any other shortfall.

## Step 3: Map each match — show this table before pushing

Field mapping depends on `JOB_SOURCE`. Both tables below produce the same application JSON shape and the same display-before-push discipline; only where each field is read from differs.

### If `JOB_SOURCE = "hirebase"` (default)

| Application field | From Hirebase result | Notes |
|---|---|---|
| `company` | `company_name` | required |
| `role` | `job_title` | required |
| `status` | always `'found'` | the script defaults this, but state it explicitly in the table so the user sees what's about to be written |
| `jobPostUrl` | `application_link` | |
| `jobDescription` | `description`, normalized to clean markdown — see below | **required — never omit this, and the backend enforces it too** (`createWideapplyApplication` 400s with "jobDescription is required."). Hirebase's `description` is truncated to ~900 chars by default (see `candidate-job-matcher-hirebase`'s Step 5) — when invoking that skill for this flow, ask it to set `return_raw_description: "true"` on its search calls so the full posting text comes back, not a truncation; a truncated JD is thin enough to break `MIN_JOB_DESCRIPTION_CHARS` skips and `ideal-cv-pipeline-v4`'s own JD analysis downstream. If `description` is genuinely empty or null for a specific posting, `fetch_content` the job's `application_link` before logging it and use the extracted page text instead; don't log a "found" application with a blank job description when a fallback is available. |
| `city` | first entry in `locations[]` that has a `city`; else that entry's `region`/`country` | check the whole array, not just index 0 (a job can list multiple office locations) — omit if none have a usable value, don't invent a location |
| `workMode` | `location_type` | `"Remote"` → `remote`, `"Hybrid"` → `hybrid`, `"In-Person"` → `onsite` — omit rather than guess if `location_type` is absent |
| `salaryRange` | built from `salary_range.min`/`salary_range.max`/`salary_range.currency` | omit if `salary_range` is `null` — don't fabricate a range |
| `companyType` | `company_data.type`, lowercased | **correction, 2026-10-04**: Hirebase's result does carry this (confirmed on a real pull — `company_data.type: "Enterprise"`), contrary to this table's earlier claim that no such field exists. `companyType` is one of `startup`, `scale-up`, `mid-size`, `enterprise`, `non-profit`, `government`, `agency` — lowercase `company_data.type` and use it only if it cleanly matches one of those 7 values (e.g. `"Enterprise"` → `enterprise`); if it comes back as something that doesn't map cleanly, omit the field rather than guess |
| `companySize` | built from `company_data.size_range.min`/`.max` as free text (e.g. `"1001-5000"`) | **correction, 2026-10-04**: also confirmed present on a real pull, contrary to the earlier "no equivalent field" claim — omit if `company_data.size_range` is `null` |
| `source` | `'Hirebase'` | always set this — it becomes the auto-logged "Found on Hirebase" event on the application |
| `notes` | optional | e.g. why this was flagged a fit, from the `candidate-job-matcher-hirebase` output — can also note `skills[]`/`technologies[]` stack-match signal from that skill's Output section |

### If `JOB_SOURCE = "theirstack"`

| Application field | From TheirStack result | Notes |
|---|---|---|
| `company` | `company_object.name` | required |
| `role` | `job_title` | required |
| `status` | always `'found'` | the script defaults this, but state it explicitly in the table so the user sees what's about to be written |
| `jobPostUrl` | `url` / `final_url` | |
| `jobDescription` | `description`, normalized to clean markdown — see below | **required — never omit this, and the backend now enforces it too** (`createWideapplyApplication` 400s with "jobDescription is required." as of 2026-10-04 — not just a convention, a hard validation). This field was missing from this table until 2026-10-04, so earlier runs logged applications with no job description at all on the stored record — breaking anything downstream that reads it off the application row itself rather than a local JD file, e.g. `convert-wideapply-lead-to-email`'s "needs a non-empty jobDescription" prerequisite. If TheirStack's `description` is genuinely empty or null for a specific posting (rare — hasn't been observed in practice, but don't assume it never happens), `fetch_content` the job's `jobPostUrl` before logging it and use the extracted page text instead; don't log a "found" application with a blank job description when a fallback is available. |
| `city` | `short_location` | omit if absent, don't invent a location |
| `workMode` | derived from workplace type, if known | must be one of `onsite`, `hybrid`, `remote` — omit rather than guess if unclear |
| `salaryRange` | `salary_string`, or built from `min_annual_salary_usd`/`max_annual_salary_usd` | omit if TheirStack has no salary data — don't fabricate a range |
| `companyType` | default `'direct_employer'`... | **wait** — `companyType` is one of `startup`, `scale-up`, `mid-size`, `enterprise`, `non-profit`, `government`, `agency`, NOT `direct_employer` (that's a *search* filter in `candidate-job-matcher`, a different enum). Only set `companyType` if you can honestly infer it (e.g. `employee_count` bucketed); otherwise omit it entirely rather than pass through the wrong enum. |
| `companySize` | `company_object.employee_count`, as free text (e.g. `"501-1000"`) | optional, no fixed enum |
| `source` | `'TheirStack'` | always set this — it becomes the auto-logged "Found on TheirStack" event on the application |
| `notes` | optional | e.g. why this was flagged a fit, from the candidate-job-matcher output |

**`jobDescription` must be clean markdown, not the provider's raw text verbatim**, regardless of `JOB_SOURCE`. This isn't cosmetic: the candidate-facing board renders this exact field through `react-markdown` with no raw-HTML passthrough and headings downgraded to bold paragraphs (`wideapply-dashboard`'s `JobTab.tsx` → `components/ui/Markdown.tsx`) — malformed input shows as literal asterisks, garbled line breaks, or raw escaped tags to the candidate, not a parsing error you'd catch first. Both providers' `description` fields are already close to markdown (mixing `**Bold Section**` pseudo-headers with real `#### ATX headers` and `-` bullets, inconsistently per posting) but need normalizing before they go in the payload:

- Pick one section-header style and use it throughout — `**Bold Label**` on its own line, since that renderer downgrades real headings (`#`/`##`/`###`/`####`) to the exact same bold-paragraph weight anyway, so there's no visual reason to keep ATX syntax if the source mixed the two.
- Normalize every bullet marker to `-`.
- Collapse runs of 3+ blank lines down to one blank line between sections.
- Trim trailing whitespace from line ends.
- Strip or convert any literal HTML (rare, but some job-board-scraped postings carry it) — the renderer has no HTML passthrough, so a stray `<br>`/`<strong>`/`&nbsp;` would show to the candidate as literal text, not formatting. Convert obvious ones (`<br>` → a line break, `<strong>…</strong>` → `**…**`) or just drop the tag and keep the inner text.
- Keep the actual content as-is otherwise — this is formatting cleanup, not rewriting or summarizing the posting.

Render this as a table in your response (company / role / url / source, at minimum) and get the user's go-ahead before Step 4. Do not silently skip this even when the user asked for the "chained, automatic" version of this flow — automatic means one request triggers both steps without the user re-invoking a second skill, not that the write happens unreviewed.

## Step 4: Calling the script

Build the accepted matches as a JSON array (one object per row from Step 3) and pipe it in via stdin — do not pass it as a shell argument (company/role/notes can contain quotes that break shell escaping):

Run from the repo root:

```
echo '<applications JSON array>' | node .claude/skills/push-wideapply-applications/push-applications.mjs --env dev --campaign <campaignId>
```

The script prints exactly one JSON line to stdout — `{"ok":bool,"env":...,"campaign":...,"count":N,"results":[{"index","ok","company","role","id"|"error"},...]}` — with a non-zero exit code if any item failed. Relay per-item success/failure back to the user in plain language (e.g. "6 of 7 logged; 'Acme Corp / Staff PM' failed: <error>"), don't just paste the raw JSON.

## If it fails

- **A specific item's error** — read `results[i].error`; the backend validates `company`/`role` (required) and enum fields (`status`, `workMode`, `companyType`) and will name exactly which one is wrong. Fix that item's mapping and retry only that item, not the whole batch.
- **`Env file not found: .secrets/wideapply-applications-skill/.env.<env>`** — that environment hasn't been set up yet. Tell the user to create it (see "One-time setup" below) — you cannot create or fill in the key yourself.
- **401/403 from the backend** — the scoped key either isn't configured or isn't allowed on this route yet; see "One-time setup". Don't retry with a different key you make up.
- **Any other network/connection error** — the backend for that environment may be down or unreachable from this machine; tell the user, don't retry silently in a loop.

## What you must never do

- Never read, cat, or print the contents of `.secrets/wideapply-applications-skill/.env.dev` or `.env.prod`. Only `push-applications.mjs` touches them.
- Never ask the user to paste the service key into chat, and never type a key into a command yourself.
- Never skip Step 3's visible table to go straight from search results to a backend write.
- Never invent `jobPostUrl`, `salaryRange`, `city`, or `companyType` when the search provider (Hirebase or TheirStack) didn't provide the underlying data — omit the field instead.
- Never retry a prod write automatically after a failure without the user re-confirming.
- Never fall back to `push-wideapply-leads`'s key/env folder for this — this skill uses its own scoped key restricted to a different route (see below), and mixing them defeats the point of scoping.

## One-time setup (tell the user this if `.env.dev`/`.env.prod` don't exist yet)

This needs a **new** scoped entry in ElasticDash-BE's `WIDEAPPLY_SERVICE_KEYS_JSON` (a JSON array — same env var the leads skill's key lives in, just a new array entry), restricted to only the applications-create route:

```json
{
  "id": "push-wideapply-applications",
  "key": "<a newly generated, sufficiently random secret>",
  "allowedRoutes": [
    { "method": "POST", "pathPattern": "^/admin/campaigns/[^/]+/applications$" }
  ]
}
```

That's a config change in ElasticDash-BE's own environment, not a code change — `middleware/wideapplyServiceAuth.js` already supports arbitrary scoped keys. Generating and setting that key/entry is the user's own step; do not attempt to generate or guess a value for it, and do not widen `allowedRoutes` beyond this one route.

Then create `.secrets/wideapply-applications-skill/.env.dev` (and `.env.prod` if needed), relative to the repo root, with:

```
ELASTICDASH_BE_BASE_URL=<the backend's base URL for that environment>
WIDEAPPLY_APPLICATIONS_SERVICE_KEY=<the scoped key issued above>
```

`.secrets/` is gitignored wholesale, and this skill's subfolder is separate from `wideapply-leads-skill/` — a leaked or revoked key here has no effect on the leads flow, and vice versa.
