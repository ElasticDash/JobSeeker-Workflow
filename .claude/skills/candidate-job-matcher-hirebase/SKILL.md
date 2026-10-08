---
name: "candidate-job-matcher-hirebase"
description: "Hirebase-backed alternative to candidate-job-matcher: convert a WideApply candidate profile export into a Hirebase job_titles/keywords/yoe/geo_locations search (keywords always carries the candidate's full skills list, sorted by relevance so skill-matching jobs surface on page 1), size it with a free page:999 overfetch call (days_ago 7, widening to 14 if thin) then pull-and-filter up to two limit:100 pages (capped at 200 raw jobs) until a requested job count N is met or the search is exhausted, and skip jobs already shown to this candidate in a prior run. Outputs matching jobs with salary. Triggers: find jobs for this candidate via Hirebase, hirebase search for <candidate>, use hirebase instead of theirstack."
---

# Candidate Job Matcher (Hirebase)

Same job as `candidate-job-matcher`, different data source: Hirebase instead of
TheirStack. Hirebase has no MCP server, so this skill calls it through a local
script (`hirebase-search.mjs`, in this folder) instead of `mcp__TheirStack__*`
tools. Read `candidate-job-matcher`'s own SKILL.md for the parts that don't
change (seniority/YOE computation from the profile, title expansion judgment,
output-table discipline) — this file only covers what's different about
Hirebase's API and filter semantics. Don't run both skills for the same
request; pick one data source per run.

## Where this runs

Needs real shell access to run `hirebase-search.mjs` from the repo root — same
constraint as every other script-backed skill in this repo. If you're in a
session without shell access, build the exact command (see "Calling the
script" below) and hand it to the user.

## One-time setup

`HIREBASE_API_KEY` must already be in `<repo-root>/.env` (not `.secrets/` —
this is a read-only external search, not a write to ElasticDash-BE, so it
doesn't need that extra isolation). If it's missing, tell the user to add it —
`Profile → API Key` at hirebase.org — and get the value from them; never
guess or invent one. `.env` is gitignored wholesale, same as `.secrets/`.

## Step 1: Compute the candidate's own seniority — identical to candidate-job-matcher

Follow `candidate-job-matcher`'s Step 1 exactly: sum total YOE from the
profile's `## Experience` entries, map to a label, reconcile against any
stated target, and compute the floor and ceiling for a posting's stated
minimum. Ceiling is `candidate_YOE`. Floor is `candidate_YOE - 1`, capped at
4 once `candidate_YOE` reaches 6 or more (see CLAUDE.md's Screening and
checks section, "YOE floor, capped") — a 7+ YOE candidate's floor stays at 4
rather than climbing toward their own tenure. This logic is data-source
agnostic and doesn't change for Hirebase.

**Mapping the label to Hirebase's `experience` enum** — Hirebase only has five
buckets (`"Entry"`, `"Junior"`, `"Mid"`, `"Senior"`, `"Executive"`), one fewer
than candidate-job-matcher's own five-row table (which splits out "Staff /
Lead" below "Principal / Director+"). There's no clean Hirebase bucket for
"Staff / Lead" — map it to `"Senior"` (closest below) and rely on the numeric
`yoe` filter (below) to do the real work of excluding postings outside the
candidate's actual range; don't lean on `experience` alone for a Staff/Lead
candidate the way the label table might suggest.

| Computed label | Hirebase `experience` value |
|---|---|
| Junior / Entry | `"Entry"` (or `"Junior"` if the profile shows 1-2 YOE rather than 0) |
| Mid-level | `"Mid"` |
| Senior | `"Senior"` |
| Staff / Lead | `"Senior"` (no closer bucket — the `yoe` filter carries the real precision here) |
| Principal / Director+ | `"Executive"` |

Treat `experience` as a coarse pre-filter, same role `job_title_not` played in
candidate-job-matcher — the numeric `yoe` filter below is what actually
enforces the floor/ceiling.

## Step 2: Build the filter set — Hirebase field names, not TheirStack's

**Title expansion is unchanged**: look up the anchor's family/specialization
in candidate-job-matcher's Step 2 fixed table (changed 2026-10-06 — a
deterministic lookup now, not a per-run judgment call), anchor-first. The
mechanics of applying the result differ:

**Bias toward breadth, not precision, when choosing the variants themselves.**
Confirmed on a real run: using narrow title fragments like `"backend"` and
`"back end"` as `job_titles` entries under-returned — real postings are
titled things like "Software Engineer, Backend" or "Python Engineer" that
don't contain the literal substring "backend" at all, so two narrow
near-synonyms of the same fragment add no real coverage over each other while
still excluding every differently-worded posting. Prefer full role-level
title variants a recruiter would actually post under (e.g. `"software
engineer"`, `"backend engineer"`, `"python engineer"`) over single-word or
compound-fragment entries — the full-phrase variants cast a wider net because
Hirebase matches each entry's words against the job's title, and a broader
phrase catches more real-world title phrasing than a narrow fragment does.
When unsure whether a candidate variant is too narrow, include it anyway
rather than substituting a more "precise" fragment for it — the seniority
`-exclusion` entries (too-senior/too-junior words) are where precision
belongs, not the inclusion list.

| Filter | Derived from | Notes |
|---|---|---|
| `job_titles` | Expanded title list, **plus** exclusion entries | One array does both jobs TheirStack split across `job_title_or`/`job_title_not`. Each entry with no `-` prefix is OR'd in; prefix an entry with `-` (e.g. `"-senior"`) to exclude it — same seniority exclusion words as candidate-job-matcher's table (too-senior and too-junior words both, per the candidate's bucket). Each entry itself matches all its own words in any order — `"data scientist"` requires both words present, not either — so don't put more than 2-3 words in one entry. Use `"\"exact phrase\""` (escaped quotes inside the string) when word-boundary precision matters. |
| `yoe` | `{min, max}` from Step 1 | **This replaces candidate-job-matcher's entire client-side regex/description-parsing step.** Hirebase parses years-of-experience server-side into each job's `yoe_range` and filters on it directly — set `min` to the floor and `max` to the ceiling (Step 1). No regex pass needed for the single-dimension case. |
| `include_yoe` | Always `"true"` | Without this, jobs with no stated YOE may be silently excluded once a `yoe` filter is set — same "don't silently drop unknowns" principle as candidate-job-matcher. Flag jobs with a `null` `yoe_range` in the output as "requirement unstated," don't let them look like a confirmed match. |
| `experience` | Step 1's label, mapped per the table above | Coarse pre-filter only — see above. |
| `geo_locations` | Desired Job Location section | `[{city, region, country}]` — plain strings, no catalog ID lookup needed (unlike TheirStack's `job_location_or`). A job matches if **any** of its own `locations` entries fits, so don't assume `locations[0]` is the match. |
| `location_types` | Workplace arrangement preference | `"Remote"`, `"Hybrid"`, `"In-Person"` (not `"On-site"` — Hirebase's own term is `"In-Person"`). Same rule as candidate-job-matcher: omit if all three are acceptable, that's not a filter. **`"Remote" is global, not US-remote, by itself** (confirmed 2026-10-05 on a real pull: `location_types: ["Remote"]` with no `geo_locations` returned postings actually based in Brazil, Singapore, Australia, Malaysia, and Colombia, all still tagged `location_type: "Remote"`). If the candidate specifically needs a US-based remote role (not just "remote from anywhere"), `location_types: ["Remote"]` alone will not enforce that — pair it with an explicit `geo_locations: [{"country": "..."}]` (or check each job's own `locations[]` for the target country during per-job filtering) rather than trusting `location_type` alone to mean "remote in my country." |
**A "remote OR local-metro" requirement needs two separate scoped searches, not one unscoped pull filtered by hand afterward** (confirmed 2026-10-05: an orchestrator skipped `geo_locations`/`location_types` entirely on a real pull to "stay broad," then manually filtered location per job after the fact — 166 of 200 raw-job credits on that pull were wasted on jobs a server-side filter would have excluded for free). When the candidate's location preference is "remote, or based in my metro area" — not satisfiable by one Hirebase filter combination, since remote postings and metro-local postings use different `locations[]` shapes — run it as two attempts: (1) `location_types: ["Remote"]` + `geo_locations: [{"country": "..."}]` for remote-in-my-country, (2) `geo_locations: [{"city": "...", "region": "...", "country": "..."}]` with `location_types` omitted for local-metro-any-mode. Each still counts toward the per-attempt 200-raw-job cap and the session-level cumulative cap (Rules section below) — this isn't a way around those caps, it's a way to spend the same credit budget on jobs that can actually pass instead of ones that can't.

| `geofilter_params` | Only if the candidate's desired location is a metro area, not an exact city | Default `mode: "auto"` already does metro-area fuzzy matching (searching "San Francisco" also returns East Bay/South Bay postings) — this is usually what you want for a job seeker and needs no explicit setting. Set `mode: "strict"` only if the user explicitly wants exact-city matches with no fuzz. |
| `days_ago` | Step 4's sizing algorithm by default (tries `7`, widens to `14` if thin) | Only set an explicit value yourself when the user gives their own freshness window — that overrides and skips the 7/14 default sizing step entirely. |
| `hide_recruiting_agencies` | **Default: omit (never `"true"` by default, corrected 2026-10-04)** | Confirmed on a real run that stacking this on top of the other filters helped collapse a nationwide "software engineer" search down to an implausibly small result set. Only set this to `"true"` if the user explicitly asks to exclude agency postings — don't set it by default the way candidate-job-matcher defaults `company_type: "direct_employer"`, the two aren't equivalent enough to justify the same default here. |
| `filter_incomplete_jobs` | **Default: omit (never `"true"` by default, corrected 2026-10-04)** | Same correction as `hide_recruiting_agencies` above, same reason — don't stack this on by default. Every Hirebase job already carries `application_link`, so there's no dead-link risk from leaving this unset the way `property_exists_and: ["final_url"]` guards against on TheirStack. Only set `"true"` if the user explicitly asks to exclude incomplete listings. |
| `salary` / `currency` / `include_no_salary` | Only if candidate stated a desired salary | Same gotcha as candidate-job-matcher: most postings don't list salary, so always pair a `salary` filter with `include_no_salary: "true"` or you silently drop most of the market. |
| `visa` | Work Authorization section, only when sponsorship is actually needed | `"true"` surfaces jobs that **explicitly** advertise sponsorship — it will not find every job that would consider it, just the ones that say so, so don't treat a short result list under this filter as "no sponsoring jobs exist." Omit entirely for candidates who don't need sponsorship (it's a positive filter, not a geography/eligibility gate — there's no equivalent to TheirStack's `job_country_code_or` restriction here; use `geo_locations`/`location_types` for that). |
| `job_category` | Candidate's title family, technical roles mainly | One or more exact strings from `--endpoint categories` (e.g. `"Software Engineer Jobs"`) — optional, adds precision on top of `job_titles` rather than replacing it. |
| `industry` | Only if the user/profile names a target industry | Exact string(s) from `--endpoint industries` — never guess one, resolve it first (Step 3). |
| `job_types` | Default omit (full-time implied) | Set only if the candidate/ask specifies part-time/contract/internship. |
| `keywords` | **Every item in the candidate's Skills list, technical roles only** (changed 2026-10-05, user directive) | Matched against `description`/`technologies`/`skills`/`benefits`; entries are OR'd together, never AND'd — there is no way to require "all" skills on one job, and that isn't needed anyway: per Hirebase's own docs, exact-phrase matches rank highest, then jobs matching all the words in an entry, then jobs matching any of the words, and a rare phrase still returns partial matches rather than zero results. This is what makes `sort_by: "relevance"` (below) actually prioritize full/partial skill-matching jobs onto page 1 instead of scattering them across however many pages a 200-raw-job pull produces — include the full list every time, not a trimmed sample. Prefix an entry with `-` to hard-exclude (e.g. `-blockchain`) — but multi-word exclusions are word-level, not phrase-level (`-language models` excludes anything with "language" OR "models"), so keep exclusion entries to single distinctive words. |

**No catalog ID resolution step for location.** This is the one Step 3 (`get_catalog_locations`) from candidate-job-matcher that Hirebase doesn't need at all — `geo_locations` takes plain city/region/country strings directly.

## Step 3: Resolve category/industry strings before the real query — still free

Unlike location, `job_category` and `industry` are exact-match enums. Resolve
them first, no API key required:

```bash
node .claude/skills/candidate-job-matcher-hirebase/hirebase-search.mjs --endpoint categories
node .claude/skills/candidate-job-matcher-hirebase/hirebase-search.mjs --endpoint industries
```

Both print the full list directly (small payloads, no file save needed).
Never guess a category or industry string — if the candidate's field doesn't
cleanly match one of these, say so and omit the filter rather than passing a
near-miss that Hirebase will `422` on.

## Seen-jobs dedup — different cost profile than TheirStack, same mechanism

Hirebase has **no server-side exclude-by-id or discovered-since filter** —
nothing matches `job_id_not` or `discovered_at_gte`. This is the main
trade-off versus TheirStack for repeat runs:

- **Cache file**: `~/.wideapply-job-matcher-skill/seen-jobs-hirebase/<slugified-key>.json`
  — a separate cache from candidate-job-matcher's own (different `_id` space,
  don't merge them), keyed the same way: candidate's email, else the
  `campaignId`, else ask. Format: `{"ids": [{"id": "<_id>", "company": "...",
  "role": "...", "seenAt": "<ISO date>"}], "lastSeenDatePosted": "<YYYY-MM-DD>"}`.
- **Before searching**: read the cache. Pass `sort_by: "relevance",
  sort_order: "desc"` (changed 2026-10-05 — was `"date_posted"`) so jobs
  matching the candidate's full `keywords` list surface first within a
  page, cutting down on how often a real pull needs its second page just to
  find matches. **This drops the "freshest postings first" ordering within
  a page** — a relevance-sorted page can mix job ages in any order — but
  the absolute staleness ceiling is unaffected: `days_ago` (7, widening to
  14) still bounds every pull to the same fresh window as before, this
  change only reorders *within* that window, it doesn't widen it. If
  `lastSeenDatePosted` is set and this run's filters substantially match
  what produced it, the old trick of biasing toward unseen jobs by setting
  `date_posted` to that cutoff **no longer applies** — that only ever made
  sense against a date-sorted page, and was already just a soft hint even
  then (a job can keep the same `date_posted` across repeat scrapes, so it
  never reliably excluded previously-seen postings the way TheirStack's
  `discovered_at_gte` did). The real dedup still happens client-side, same
  as always — see below — and matters slightly more now, since a
  previously-seen job can land anywhere in a relevance-sorted page rather
  than clustering at one end of a date-sorted one.
- **Client-side dedup, every pull**: after each page, drop any job whose
  `_id` is already in the cache's `ids` before counting it toward N. Unlike
  TheirStack, this costs the same 1 credit per job whether or not it turns
  out to be a dup — Hirebase bills per job *returned*, not per job accepted,
  so a heavily-reseen query burns credits faster here than on TheirStack.
  Say so if a run's dup rate looks high (e.g. "6 of 10 pulled were already
  seen — consider broadening filters before the next run").
- **After the run**: append every job actually shown to `ids` (dedup by
  `_id`), and update `lastSeenDatePosted` to the max `date_posted` seen.

## Step 4: Size it, then pull-and-filter — overfetch-page sizing, 200-job cap

**Keep the filter minimal — but `keywords` is now part of that minimal core, not an optional extra (changed 2026-10-05).** Build the request with `job_titles`, `yoe`/`include_yoe`, `keywords` (the candidate's full skills list), and `geo_locations`/`location_types` only if the candidate actually has a location constraint. `job_category`, `industry`, `salary`, `visa`, and extra exclusion entries are the ones that actually narrow `total_count` — too many of those at once can return too few or zero jobs even when real matching postings exist. `keywords`' own non-`-` entries don't carry this risk the same way: per Hirebase's docs they're a ranking signal, not a count-narrowing filter (a rare or unmatched phrase still returns partial matches, not zero), so there's no thinness trade-off to weigh for including the full list. If a sizing call below comes back thin, **remove** the least important condition rather than adding a new one to compensate — same instinct as candidate-job-matcher's "loosen the newest filter" rule, just applied by subtraction: strip conditions in reverse order of importance (first `industry`/`job_category` extras, then any `-keywords`/`-job_titles` exclusion entries, last the core `job_titles`/`yoe`/`geo_locations`/`keywords` — those four are what actually keep the search on-target and ranked, so don't drop them without good reason, and don't drop `keywords`' inclusion entries for thinness at all since they don't cause it).

**Size with an overfetch page, not the `estimate` endpoint.** A
`--endpoint search` call with `"page": 999, "limit": 100` sits far beyond any
real result set, so it always returns an empty `jobs` array — 0 jobs
returned costs 0 credits under Hirebase's bill-per-job-returned model — while
still reporting `total_count`, `company_count`, and `total_pages` in the
response body:

```bash
echo '<filter body, with "page": 999, "limit": 100, "days_ago": 7>' \
  | node .claude/skills/candidate-job-matcher-hirebase/hirebase-search.mjs --endpoint search
```

1. **First sizing call**: `days_ago: 7`.
2. **If `total_count < 200`**: retry the sizing call once more with
   `days_ago: 14` instead of 7, everything else unchanged.
3. **If the first call already reported `total_count >= 200`**: skip the
   second call, keep `days_ago: 7`.
4. Continue with whichever call actually ran last (the `days_ago: 7` call if
   it already cleared 200, otherwise the `days_ago: 14` call) regardless of
   what its own `total_count` came out to — don't widen a third time, and
   don't fall back to the narrower value once the wider one has been tried.
   If the user already gave an explicit `days_ago`, skip this whole 7/14
   routine and size with their value directly (still via the same
   `page: 999, limit: 100` trick).

**`days_ago` is always the first lever, ahead of the minimal-filter rule
above — widen the date window before touching any other condition**
(confirmed 2026-10-04 on a real run: dropping `hide_recruiting_agencies`/
`filter_incomplete_jobs` and restoring `include_yoe: "true"` took one
filter's `total_count` from 13 to 159 just by fixing those, without touching
`days_ago` at all — but `days_ago` still moves the number further and costs
nothing extra to try before reaching for any other lever).

**HARD CEILING: `days_ago` must never exceed 14, under any circumstances**
(user directive, 2026-10-05, non-negotiable — do not widen past this even
for a large-`N`/maximize-volume request, even if `total_count` is still
climbing, even if the caller is `wideapply-campaign-pipeline`'s own
large-`TARGET_APPLICATION_COUNT` push). An earlier version of this rule
allowed widening to 30/60/90/.../730 days for large-volume requests — that
was tried on a real run and produced real problems: postings up to 343 days
old got sourced and several were fully processed (resume tailored, leads
contacted) before anyone noticed the listings were likely long closed.
14 days is now the ceiling for every caller, every request size, no
exception. If 14 days isn't enough volume, that's a real signal the market
for the current filter is genuinely limited right now — report that
honestly (fewer jobs than the target, not padded) rather than reaching for
a wider date window to compensate. Once still thin at 14, move to the
minimal-filter rule below instead.

If the sizing call itself comes back thin (`total_count` near zero) even
at the 14-day ceiling, that's when to apply the minimal-filter rule — remove
a condition and re-size, don't just proceed to pulling a near-empty result
set.

**Then pull real pages**, capped at **200 raw jobs per run** (Hirebase's own
per-call `limit` cap is 100, so this is at most two calls):

1. Pull page 1: the same filter as the winning sizing call (same
   `job_titles`/`yoe`/`keywords`/`days_ago`/etc, just swap `page: 999` for
   `page: 1`), `"limit": 100`. Always include `sort_by: "relevance"`,
   `sort_order: "desc"` (see Seen-jobs dedup section above for why this
   replaced `date_posted`).
2. If `total_pages` (from either call) indicates more remain and N still
   isn't met after filtering page 1's jobs (steps below), pull page 2: same
   filter, `"page": 2, "limit": 100`.
3. **Hard stop after page 2 regardless of whether N is met** — 200 raw jobs
   is this run's cap, not a target to keep pushing past.
4. Per job (on either page), four checks:
   - **Title-level check**: read `job_title` (not `job_title_raw`) for level
     markers `job_titles`'s `-` exclusions can't safely express (numeral
     suffixes, "Entry Level", "New Grad", "Intern", "Associate") — same
     backstop role as candidate-job-matcher's Step 4 item 2. Also catch
     near-duplicates here (same `company_name`+`job_title` reposted across
     `job_board`s).
   - **Numeric YOE check**: already enforced server-side by the `yoe` filter
     (Step 2) for the single-dimension case — no regex pass needed. **Still
     read `description`/`requirements_summary` by hand when a posting states
     more than one distinct years-of-experience number for different things**
     (e.g. "7+ years development, 3+ years management") — `yoe_range` is a
     single parsed range and won't catch a second, differently-scoped
     requirement. Apply candidate-job-matcher's multi-dimensional YOE logic
     (Step 1 item 6, its Step 4 "Multi-dimensional YOE requirements" section)
     unchanged for this case only.
   - **Stack-match check, regardless of title** (added 2026-10-05, refined
     2026-10-05 — a prior run's handoff reasons showed 4 of 7 stack-mismatch
     handoffs came from postings titled "Full Stack X," not just
     frontend-only/backend-only ones, so **don't exempt any title from this
     check just because it says "Full Stack"** — a generic title doesn't
     mean a generic stack. Read the job's `skills[]`/`technologies[]` arrays
     (structured, no description text-scanning needed per Step 5) for the
     posting's core, distinguishing required stack.
     **Gate on core implementation language, not framework.** A different
     framework, library, ORM, test tool, or cloud/infra product *within a
     language the candidate already has real evidence of* is not a real
     gap — frameworks are learnable in days, a language the candidate has
     never written professionally is not the same kind of gap (confirmed
     2026-10-05: an earlier version of this check rejected on framework
     differences too, over-tightening the gate; the right line is the
     implementation language itself, e.g. a Python candidate with no
     Django experience is still a fine match for a Django role, but a
     Python/JS candidate is not a match for a role whose core backend
     language is Java, C#, PHP, Ruby, Go, Rust, or Scala). So: reject only
     when the posting's primary/distinguishing required language is one
     the candidate has no real evidence of, not merely a different
     framework in a language she does have.
     **Before applying this, work out whether a posting listing multiple
     languages means them as interchangeable OR options, or as separate
     AND co-requirements** (confirmed 2026-10-05: real postings listed
     languages "such as Python, C, and C++" and "at least one modern
     backend language" — both OR, any one language in the list satisfies
     it, matched on the candidate's Python/JS alone). Phrases like "such
     as," "e.g.," "any of," "at least one," "familiarity with any of the
     following" signal OR — one match is enough, ignore the other named
     languages entirely. But a posting can also list two languages as
     genuinely separate, simultaneous requirements with no "or" framing
     at all (e.g. "backend in Java, frontend in Angular," "production
     experience in both Python and Go," two bullets each reading as its
     own hard requirement) — that's AND, and if one of those required
     languages is one the candidate has no evidence of, it's still a real
     gap even though she matches the other one. Don't default to treating
     every multi-language mention as OR just because one of the named
     languages happens to match — read whether the posting actually frames
     them as alternatives or as two things the role needs at once.
     **A posting can mention the same language or platform more than once
     with different framing — check every occurrence independently, not
     just the first one found** (confirmed missed on a real run, candidate
     Tarunn Gusain, 2026-10-07: a posting mentioned AWS four times — three
     safely OR'd or "preferred" — but a separate bullet buried mid-posting,
     "AWS ecosystem with specific, practical experience leveraging AWS
     Cognito for identity management," had no OR and no "preferred," a
     hard standalone requirement for a named AWS service the candidate had
     zero evidence of; it was missed because the other three mentions were
     checked, found safe, and the posting was marked clear without
     separately verifying the remaining occurrence). Finding one OR'd or
     soft mention of a language/platform elsewhere in the same posting
     does not clear a different, hard-framed mention of that same
     language/platform — scan the full description for every instance of
     each named technology it references and classify each occurrence's
     framing on its own before passing the posting.
     Separately, still reject a
     posting whose core ask is a specialized **domain**, not just a
     language or framework — platform-specific business-logic
     specializations (Salesforce/Apex, SAP/ERP), embedded/hardware/
     firmware, lab-automation/scientific-instrumentation, or a dedicated
     QA/test-automation career track — these require domain knowledge
     beyond "pick up a new framework," so the language-match relaxation
     above does not extend to them. This is a coarser, cheaper version of
     the same check `ideal-cv-pipeline-v4`'s own stage 2a JD analysis does
     in full later — the point is catching the cases a 30-second skim of
     structured skill data can catch, before spending a full downstream
     pipeline run finding out the same thing. It will not catch everything
     (a requirement buried only in prose with no matching
     `skills[]`/`technologies[]` entry still needs the full JD read stage
     2a already does), so expect this to reduce, not eliminate,
     title-invisible domain-gap handoffs.
   - **Dedup check**: drop if `_id` is in the seen-jobs cache (see above).
5. Append accepted jobs; stop at N (truncate unless "at least N" was asked).

Report the stop reason explicitly ("stopped: 200-job cap" vs. "exhausted"
vs. reached N — "200-job cap" replaces the old "retry cap"/"raw-job cap"
pair now that sizing no longer loops in small increments), and the same
honesty rule applies: never pad short results to hit N.

**Rate limiting vs. quota — distinguish before deciding whether to retry.**
The script surfaces both on failure: `billingCode: "limit_exceeded"` means a
plan quota is exhausted (don't retry — wait for the period reset or tell the
user to upgrade); `retryAfter` with no `billingCode` means the 100-req/60s
rate limit (fine to retry after that many seconds, though a 4-attempt loop at
one page per attempt is extremely unlikely to hit this). Never retry a
`limit_exceeded` response in a loop.

## Step 5: Extracting results — always via the saved file

`hirebase-search.mjs` already writes every search response to
`.temp/hirebase-raw/<timestamp>-search.json` and prints only a compact
summary (counts + the saved path) to stdout — this is unconditional, not
size-dependent, so there's no judgment call about when to use the file vs.
read inline. Pull fields with `jq`:

```bash
jq -r '.jobs[] | [._id, .job_title, .company_name, .location_type, (.locations[0].city // .locations[0].country // "n/a"), .application_link, .date_posted, ((.salary_range.min|tostring)+"-"+(.salary_range.max|tostring)+" "+.salary_range.currency // "n/a"), (.yoe_range.min|tostring)+"-"+(.yoe_range.max|tostring)] | @tsv' "<saved-file-path>"
```

Useful fields: `_id` (feeds the dedup cache), `job_title`, `job_title_raw`,
`company_name`, `company_slug`, `application_link`, `locations[]` (check the
whole array, not just index 0), `salary_range` (`min`/`max`/`currency`/
`period`, may be `null`), `yoe_range` (`min`/`max`, may be `null` —
"requirement unstated" case), `experience_level` (response label — six
values, different vocabulary from the request-side `experience` enum, so
don't compare them directly), `date_posted`, `job_board`, `skills[]` /
`technologies[]` (structured stack data — use directly for the stack-match
flag in Output, no description text-scanning needed, unlike candidate-job-
matcher's TheirStack version), `description` (cleaned, ~900 chars by default;
set `return_raw_description: "true"` on the request first if you need the
full original text for the multi-dimensional YOE read above), `company_data`
(`type` — e.g. `"Enterprise"`, feeds `push-wideapply-applications`'s
`companyType` mapping; `size_range.min`/`.max` — feeds its `companySize`;
`is_recruiting_agency`/`is_3rd_party_agency` — cross-check against
`hide_recruiting_agencies`; `description_summary`, `industries[]` — useful
grounding detail for the Output notes and for downstream lead research,
confirmed present on a real pull, 2026-10-04).

## Output

Same table shape as candidate-job-matcher:

| # | Job Title | Company | Location | Min. YOE Required | Est. Salary | Posted | URL |
|---|---|---|---|---|---|---|---|

Above it: computed seniority target + YOE, N vs. delivered, which `days_ago`
the sizing step settled on (7 or 14), and how many of the two pull pages were
used. Below it, same disclosure list
candidate-job-matcher uses (profile-derived vs. explicit-instruction filters;
dedup cache stats — call out that Hirebase dedup is client-side-only so state
how many pulled jobs were dropped as already-seen, not just whether the
filter was "applied"; YOE drops broken out over-ceiling vs. under-floor vs.
unstated; stack-mismatch flags from `skills`/`technologies`; near-duplicates
collapsed; any multi-dimensional YOE postings and their per-dimension
verdicts; known data gaps). Also state current usage: `Hirebase-Usage-
Included-Remaining` from the last search call's `usage.includedRemaining`, so
the user can see remaining plan allowance without a separate lookup.

## Calling the script

```bash
# sizing (try days_ago 7 first) — note: no hide_recruiting_agencies, no filter_incomplete_jobs, default omit both
echo '{"job_titles": ["Software Engineer", "Backend Engineer", "-senior", "-staff"], "keywords": ["Python", "AWS", "Docker", "..."], "yoe": {"min": 3, "max": 5}, "include_yoe": "true", "location_types": ["Remote"], "days_ago": 7, "page": 999, "limit": 100}' \
  | node .claude/skills/candidate-job-matcher-hirebase/hirebase-search.mjs --endpoint search

# if total_count < 200, re-size with days_ago 14 instead (same filter, otherwise unchanged)
echo '{"job_titles": ["Software Engineer", "Backend Engineer", "-senior", "-staff"], "keywords": ["Python", "AWS", "Docker", "..."], "yoe": {"min": 3, "max": 5}, "include_yoe": "true", "location_types": ["Remote"], "days_ago": 14, "page": 999, "limit": 100}' \
  | node .claude/skills/candidate-job-matcher-hirebase/hirebase-search.mjs --endpoint search

# pull page 1 (same filter as the winning sizing call, page swapped to 1) — sort_by: relevance (changed 2026-10-05, was date_posted) so skill-matching jobs cluster on page 1
echo '{"job_titles": [...], "keywords": [...], "yoe": {...}, "days_ago": 7, "page": 1, "limit": 100, "sort_by": "relevance", "sort_order": "desc"}' \
  | node .claude/skills/candidate-job-matcher-hirebase/hirebase-search.mjs --endpoint search

# pull page 2, only if total_pages > 1 and N still isn't met after filtering page 1
echo '{"job_titles": [...], "keywords": [...], "yoe": {...}, "days_ago": 7, "page": 2, "limit": 100, "sort_by": "relevance", "sort_order": "desc"}' \
  | node .claude/skills/candidate-job-matcher-hirebase/hirebase-search.mjs --endpoint search
```

Run from the repo root. Every call prints one JSON line to stdout; non-zero
exit code on failure, with `billingCode`/`retryAfter`/`error` populated — see
"Rate limiting vs. quota" above for how to branch on it.

## Rules (carried over from candidate-job-matcher, Hirebase-specific additions marked)

- Never invent a `job_category` or `industry` string — resolve via Step 3's
  two list endpoints, or state the value couldn't be resolved.
- Never set `salary` without `include_no_salary: "true"` unless the user
  explicitly wants only salary-listed postings.
- Never set a `yoe` filter without `include_yoe: "true"` — same "don't
  silently drop unknowns" rule as candidate-job-matcher's unstated-YOE
  handling.
- Always size with a free `page: 999, limit: 100` search call (`days_ago: 7`,
  widening once to `14` only if `total_count < 200`) before pulling a real
  page — never use the `estimate` endpoint for this, and never skip sizing
  to go straight to a real pull.
- **Never set `days_ago` above 14, for any request, regardless of target
  size** (hard ceiling, user directive 2026-10-05, no exceptions).
- Build the filter minimal first (`job_titles`/`yoe`/`geo_locations` only);
  if sizing comes back thin, remove the least important condition and
  re-size — never add conditions to try to fix a thin result.
- Never exceed 2 real pull pages (`limit: 100` each) or 200 raw jobs pulled
  in a single search attempt (one `job_titles`/filter combination).
- **Session-level circuit breaker, separate from the per-attempt cap above
  (added 2026-10-05):** if a broader task needs to invoke this skill
  repeatedly with different filter variants (different title sets, widened
  `days_ago`, loosened conditions) to reach a target count, track the
  cumulative raw jobs pulled (summed `jobs_returned` across every search
  call, not sizing calls) across all of those attempts within the session.
  **Once that cumulative total passes 200 without reaching the target,
  stop trying new variants entirely** — don't keep reaching for "maybe the
  next title combination works." Report back every variant tried (filter,
  `total_count`, jobs pulled, jobs accepted) and stop for a human to assess
  whether the search condition itself is the problem, rather than quietly
  burning more credits hoping for a better draw. This applies whether this
  skill is called directly or through an orchestrator like
  `wideapply-campaign-pipeline` — the orchestrator's own prompt to a
  sourcing agent should carry this same cap forward, not instruct it to
  "keep trying combinations until the target is met" with no ceiling.
- **(Hirebase-specific)** Never treat a `limit_exceeded` 429 as retryable —
  only a `retryAfter`-bearing rate-limit 429 is.
- **(Hirebase-specific)** Never assume `_id`-based client-side dedup can be
  skipped or shortcut — it's the only real dedup here (changed 2026-10-05:
  previously a `date_posted`-sorted page let you reason about where
  already-seen jobs would cluster; now that real pulls sort by `relevance`
  instead, a previously-seen job can appear anywhere in the page, so the
  per-job `_id` check against the cache is the sole source of truth). It
  still costs a credit per pulled job either way.
- **(Hirebase-specific, added 2026-10-05)** Always populate `keywords` with
  every item in the candidate's Skills list on every real pull, and always
  pull with `sort_by: "relevance"` — never silently fall back to
  `date_posted` sort or an empty/trimmed `keywords` array, since that's what
  was specifically changed to get skill-matching jobs onto page 1 instead of
  requiring a second-page pull to find them. `days_ago` (7, capped at 14)
  still bounds freshness independently of this — don't conflate "sorted by
  relevance" with "no freshness floor," the two are unrelated.
- **(Hirebase-specific)** Never collapse a posting's multiple distinct
  years-of-experience requirements into the single `yoe_range` the API
  returns — that field is one parsed range; a second, differently-scoped
  requirement (e.g. a management-years number) still needs the manual
  description read from candidate-job-matcher's multi-dimensional YOE logic.
