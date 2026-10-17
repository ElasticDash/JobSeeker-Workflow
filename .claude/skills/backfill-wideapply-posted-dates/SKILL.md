---
name: backfill-wideapply-posted-dates
description: Find existing WideApply applications missing a job_posted_at value, recover a real posting date for each (re-searching the original provider, then the posting page itself, then a last-resort dated guess), and write back whatever's found after the user reviews it. Use whenever the user wants to backfill posted dates on applications created before that field existed - not for new applications going forward (push-wideapply-applications/wideapply-campaign-pipeline already set it at creation time).
---

# Backfill WideApply Posted Dates

A one-time (or occasional) remediation flow: some applications were created
before `jobPostedAt` was added to the application-create payload, so they
carry no `job_posted_at` on the backend - which the backend uses to
prioritize its daily send queue (older postings get earlier slots; a job
with none falls to the back). This skill finds those applications and
recovers a posting date for each via three tiers, in order - re-search the
original provider, then the posting page itself, then a last-resort dated
guess (see Step 2) - and writes back whatever's found after the user
reviews it.

This is a **write to real candidates' applications**, same caution as
`push-wideapply-applications` - always show the review table (Step 3)
before calling `update-posted-date.mjs`, never write straight from a URL
fetch with no human look.

## Where this can actually execute

Same constraint as every other script-calling skill here: needs a real
shell on the user's machine to run `fetch-missing-posted-date.mjs`/
`update-posted-date.mjs` (a Desktop app Chat/Cowork session gets file
transfer, not shell access). If you're in a session without real shell
access, build the exact commands (see Step 1/Step 4 below) and hand them to
the user to run themselves, or to paste into a Claude Code session on their
machine.

## When this triggers

"Find applications missing a posted date and backfill them", "some old
applications never got a job_posted_at, fix that", "backfill posted dates".
Not for new applications going forward - those get this field at creation
time via `push-wideapply-applications`'s or `wideapply-campaign-pipeline`'s
own mapping, nothing to do here for them.

## Step 1: Fetch the list

Run from the repo root - cross-campaign by default, or add `--campaign <campaignPurchaseId>` to scope the export to one campaign only:

```
node .claude/skills/backfill-wideapply-posted-dates/fetch-missing-posted-date.mjs --env dev [--campaign <campaignPurchaseId>]
```

Prints one JSON line: `{"ok":bool,"env":...,"campaign":...|null,"total":N,"applications":[{"id","campaignPurchaseId","company","role","jobPostUrl","source","createdAt"},...]}`. If `total` is 0, tell the user there's nothing to backfill (for that campaign, if scoped) and stop here. `source` and `createdAt` drive Step 2's fallback chain below - don't drop them before that step.

## Step 2: Recover a posted date for each application - three tiers, in order

Try each tier in order; stop at the first one that yields a confident date for that row. Which tiers are even worth attempting depends on `source` - see below.

### Tier 1: Re-search the original provider

Feasibility differs sharply by `source` - this is not one uniform step:

- **`source = "TheirStack"`** - re-searchable. TheirStack's API takes `company_name_or` (or the more precise `company_domain_or`/`company_linkedin_url_or` if a domain/LinkedIn URL is known) plus `job_title_or` (bag-of-words) or `job_title_pattern_or` (regex, for word-boundary precision) as first-class filters - no separate freshness anchor is needed since a company filter alone satisfies TheirStack's "date anchor required" rule. Run a targeted query for this one company + role (read `candidate-job-matcher`'s own SKILL.md, `~/.claude/skills/candidate-job-matcher/SKILL.md`, for the exact API-call mechanics if you haven't already). Match the result back to this row by `url`/`final_url` first (most reliable), else `company_object.name` + `job_title` (both fuzzy-matched server-side already - still normalize case/whitespace before comparing). A confident match's `date_posted` is a **re-searched** date (highest confidence).
- **`source = "Hirebase"`** - NOT re-searchable. Hirebase's search API has no company-name input filter at all (`company_name` only ever appears as an output field on results, never as something you can filter by) - there's no way to ask it "find this one company's posting again." Skip straight to Tier 2 for these.
- **`source` starts with `"ATS fetch ("`** (e.g. `"ATS fetch (Greenhouse)"`) - re-searchable, with two real caveats. Write a 1-row `sources.csv` for just this one company/platform and run `fetch-ats-jobs.mjs` against it (see that skill's own usage) with a LARGE `--days` (e.g. `365`, not its usual default) since it filters to postings within `--days` of today and an old already-logged job needs the wider window to even be considered. Caveat: it only returns currently-**open** postings - if this job has since been filled or delisted, re-search comes up empty regardless of `--days`, and that's expected, not a bug - fall through to Tier 2. Match by `url` first, then `title` (exact string match, no server-side fuzzing on this source, so normalize case/whitespace yourself).

### Tier 2: Visit the posting page directly

Whenever Tier 1 wasn't attempted (Hirebase) or came up empty/unconfident (TheirStack/ATS fetch didn't find a matching result): if `jobPostUrl` is present, `fetch_content` it (same tool `push-wideapply-applications` already uses for its own JD fallback) and look for a stated posting date - "Posted X days ago", a literal date near the top of the listing, structured metadata, etc. Boards phrase this wildly differently; read for the actual meaning, don't pattern-match one exact phrase. A date found here is **page-confirmed** - a real stated date, but scraped from arbitrary page text rather than a structured API record, so one tier below a re-searched one. **If `jobPostUrl` is null** (the export doesn't require one - see `fetch-missing-posted-date.mjs`'s own output), this tier simply isn't available for that row - fall straight through to Tier 3, same as a visited page stating nothing.

**Sanity-check whatever this tier finds before it goes in the review table:**
- Reject (treat as "not found this tier", fall through to Tier 3) anything that parses to a date in the future - a posting can't be posted after today.
- Flag (don't silently drop, but call out as suspicious in the table) anything more than about 2 years in the past - possible for a long-stale re-post, but worth the user's second look rather than auto-trusting it.
- A relative phrase ("Posted 3 days ago") needs today's real date to resolve to an absolute one - state the resolved absolute date in the table, not the relative phrase.
- If the page genuinely states nothing (removed listing, redesigned page with no date, a 404), that's a normal outcome for this tier, not a failure - fall through to Tier 3.

### Tier 3: Last-resort guess - only once Tiers 1 and 2 both came up empty

`jobPostedAt = createdAt - 14 days` (the application's own `createdAt` from Step 1's output, NOT today's date - anchoring to today would cluster every guessed row in the backlog onto the exact same calendar date regardless of when each was actually logged, which is both nonsensical and destroys the backlog's real relative ordering). Label this **assumed** in the review table - lowest confidence of the three, a deliberate, clearly-labeled estimate, not a real recovered date. This tier is the fallback of last resort, not the primary mechanism - always attempt Tiers 1 and 2 first for every row.

## Step 3: Show the review table - get the user's go-ahead before writing anything

Columns, at minimum: company / role / jobPostUrl / found date / confidence (**re-searched** / **page-confirmed** / **assumed**, or "flagged: N years old, confirm?" for a Tier 2 result that tripped the stale-age check). Do not skip this even for a large list - summarize counts per tier (e.g. "32 re-searched, 19 page-confirmed, 9 assumed") and still show the full table. Only rows the user confirms move to Step 4 - drop (don't write) any row they want to exclude.

## Step 4: Write back the confirmed rows

Build the confirmed rows as a JSON array (`{ applicationId, campaignPurchaseId, jobPostedAt }`, `jobPostedAt` as an ISO date string) and pipe it in via stdin - do not pass it as a shell argument:

```
echo '<confirmed rows JSON array>' | node .claude/skills/backfill-wideapply-posted-dates/update-posted-date.mjs --env dev
```

Prints one JSON line: `{"ok":bool,"env":...,"count":N,"results":[{"index","ok","applicationId","jobPostedAt"|"error"},...]}`, non-zero exit code only on a genuine failure. Relay per-item success/failure in plain language, same as `push-wideapply-applications` does - don't just paste the raw JSON.

## If it fails

- **A specific item's error** - read `results[i].error`; retry only that item, not the whole batch.
- **`Env file not found: .secrets/wideapply-posted-date-skill/.env.<env>`** - that environment hasn't been set up yet (see "One-time setup" below). You cannot create or fill in the key yourself.
- **401/403** - the scoped key either isn't configured yet or isn't allowed on these two routes; see "One-time setup". Don't retry with a different key you make up.
- **Any other network/connection error** - tell the user, don't retry silently in a loop.

## What you must never do

- Never read, cat, or print the contents of `.secrets/wideapply-posted-date-skill/.env.dev` or `.env.prod`. Only the two scripts above touch them.
- Never ask the user to paste the service key into chat, and never type a key into a command yourself.
- Never skip Step 3's visible table to go straight from a re-search/URL fetch/guess to a backend write.
- Never label a Tier 3 guess as anything other than **assumed** in the review table, and never skip straight to Tier 3 without genuinely attempting Tiers 1 and 2 first for that row.
- Never reuse `push-wideapply-applications`'s own scoped key/secrets folder for this - that key is restricted (via `WIDEAPPLY_SERVICE_KEYS_JSON`'s `allowedRoutes`) to only its one POST create route and will 403 on the two routes this skill calls; that skill's own rule says never widen its scope either. This skill needs its own, separately-scoped key (see below).

## One-time setup (tell the user this if `.env.dev`/`.env.prod` don't exist yet)

This needs a **new** scoped entry in ElasticDash-BE's `WIDEAPPLY_SERVICE_KEYS_JSON` (same JSON array every other scoped key already lives in, just a new array entry), restricted to only the two routes this skill calls:

```json
{
  "id": "backfill-wideapply-posted-dates",
  "key": "<a newly generated, sufficiently random secret>",
  "allowedRoutes": [
    { "method": "GET", "pathPattern": "^/admin/applications/missing-posted-date$" },
    { "method": "PUT", "pathPattern": "^/admin/campaigns/[^/]+/applications/[^/]+$" }
  ]
}
```

That's a config change in ElasticDash-BE's own environment, not a code change - `middleware/wideapplyServiceAuth.js` already supports arbitrary scoped keys. Generating and setting that key/entry is the user's own step; do not attempt to generate or guess a value for it, and do not widen `allowedRoutes` beyond these two routes. Note the PUT route is the same general application-update endpoint `push-wideapply-applications` itself doesn't touch - this key COULD technically update other fields on any application via that route (the scoping is by URL+method, not by request body field), so treat it with the same care as any other admin-write credential, not as a narrowly "posted-date-only" key in practice.

Then create `.secrets/wideapply-posted-date-skill/.env.dev` (and `.env.prod` if needed), relative to the repo root, with:

```
ELASTICDASH_BE_BASE_URL=<the backend's base URL for that environment>
WIDEAPPLY_POSTED_DATE_SERVICE_KEY=<the scoped key issued above>
```

`.secrets/` is gitignored wholesale, and this skill's subfolder is separate from every other skill's own - a leaked or revoked key here has no effect on any other flow, and vice versa.
