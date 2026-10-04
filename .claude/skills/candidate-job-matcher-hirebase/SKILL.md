---
name: "candidate-job-matcher-hirebase"
description: "Hirebase-backed alternative to candidate-job-matcher: convert a WideApply candidate profile export into a Hirebase job_titles/yoe/geo_locations search, run a size-then-pull-and-filter loop (capped at 4 pull attempts) until a requested job count N is met or the search is exhausted, and skip jobs already shown to this candidate in a prior run. Outputs matching jobs with salary. Triggers: find jobs for this candidate via Hirebase, hirebase search for <candidate>, use hirebase instead of theirstack."
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
stated target, and compute the floor (`candidate_YOE - 1`) and ceiling
(`candidate_YOE`) for a posting's stated minimum. This logic is data-source
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

**Title expansion is unchanged**: generate 3-6 same-or-similar title variants
per candidate-job-matcher's Step 2 judgment call, anchor-first. The mechanics
of applying them differ:

| Filter | Derived from | Notes |
|---|---|---|
| `job_titles` | Expanded title list, **plus** exclusion entries | One array does both jobs TheirStack split across `job_title_or`/`job_title_not`. Each entry with no `-` prefix is OR'd in; prefix an entry with `-` (e.g. `"-senior"`) to exclude it — same seniority exclusion words as candidate-job-matcher's table (too-senior and too-junior words both, per the candidate's bucket). Each entry itself matches all its own words in any order — `"data scientist"` requires both words present, not either — so don't put more than 2-3 words in one entry. Use `"\"exact phrase\""` (escaped quotes inside the string) when word-boundary precision matters. |
| `yoe` | `{min, max}` from Step 1 | **This replaces candidate-job-matcher's entire client-side regex/description-parsing step.** Hirebase parses years-of-experience server-side into each job's `yoe_range` and filters on it directly — set `min` to the floor and `max` to the ceiling (Step 1). No regex pass needed for the single-dimension case. |
| `include_yoe` | Always `"true"` | Without this, jobs with no stated YOE may be silently excluded once a `yoe` filter is set — same "don't silently drop unknowns" principle as candidate-job-matcher. Flag jobs with a `null` `yoe_range` in the output as "requirement unstated," don't let them look like a confirmed match. |
| `experience` | Step 1's label, mapped per the table above | Coarse pre-filter only — see above. |
| `geo_locations` | Desired Job Location section | `[{city, region, country}]` — plain strings, no catalog ID lookup needed (unlike TheirStack's `job_location_or`). A job matches if **any** of its own `locations` entries fits, so don't assume `locations[0]` is the match. |
| `location_types` | Workplace arrangement preference | `"Remote"`, `"Hybrid"`, `"In-Person"` (not `"On-site"` — Hirebase's own term is `"In-Person"`). Same rule as candidate-job-matcher: omit if all three are acceptable, that's not a filter. |
| `geofilter_params` | Only if the candidate's desired location is a metro area, not an exact city | Default `mode: "auto"` already does metro-area fuzzy matching (searching "San Francisco" also returns East Bay/South Bay postings) — this is usually what you want for a job seeker and needs no explicit setting. Set `mode: "strict"` only if the user explicitly wants exact-city matches with no fuzz. |
| `days_ago` | User's freshness ask | Optional (nothing here is a hard requirement the way TheirStack mandated a date anchor) — still set it when the user gives a freshness window. |
| `hide_recruiting_agencies` | Default `"true"` | Hirebase's equivalent of candidate-job-matcher's `company_type: "direct_employer"` default. Drop to `"false"` only if the user wants agency postings included. |
| `filter_incomplete_jobs` | Default `"true"` | Keeps only listings with complete parsed data — the closest equivalent to candidate-job-matcher's `property_exists_and: ["final_url"]` (every Hirebase job already carries `application_link`, so no separate dead-link filter is needed). |
| `salary` / `currency` / `include_no_salary` | Only if candidate stated a desired salary | Same gotcha as candidate-job-matcher: most postings don't list salary, so always pair a `salary` filter with `include_no_salary: "true"` or you silently drop most of the market. |
| `visa` | Work Authorization section, only when sponsorship is actually needed | `"true"` surfaces jobs that **explicitly** advertise sponsorship — it will not find every job that would consider it, just the ones that say so, so don't treat a short result list under this filter as "no sponsoring jobs exist." Omit entirely for candidates who don't need sponsorship (it's a positive filter, not a geography/eligibility gate — there's no equivalent to TheirStack's `job_country_code_or` restriction here; use `geo_locations`/`location_types` for that). |
| `job_category` | Candidate's title family, technical roles mainly | One or more exact strings from `--endpoint categories` (e.g. `"Software Engineer Jobs"`) — optional, adds precision on top of `job_titles` rather than replacing it. |
| `industry` | Only if the user/profile names a target industry | Exact string(s) from `--endpoint industries` — never guess one, resolve it first (Step 3). |
| `job_types` | Default omit (full-time implied) | Set only if the candidate/ask specifies part-time/contract/internship. |
| `keywords` | Skills list, technical roles only | **Soft signal, not a hard filter** — unlike TheirStack's catalog-slug tech filter, `keywords` ranks matches higher rather than excluding non-matches, and partial/any-word matches still return results. Good for ordering, not for narrowing a count. Prefix an entry with `-` to hard-exclude (e.g. `-blockchain`) — but multi-word exclusions are word-level, not phrase-level (`-language models` excludes anything with "language" OR "models"), so keep exclusion entries to single distinctive words. |

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
- **Before searching**: read the cache. Pass `sort_by: "date_posted",
  sort_order: "desc"` so freshest postings surface first within a page. If
  `lastSeenDatePosted` is set and this run's filters substantially match
  what produced it, you can also loosely bias toward unseen jobs by setting
  `date_posted` to that cutoff — but **this is a soft hint, not a hard
  exclude**: a job can keep the same `date_posted` across repeat scrapes, so
  it will not reliably exclude previously-seen postings the way TheirStack's
  `discovered_at_gte` did. The real dedup still happens client-side.
- **Client-side dedup, every pull**: after each page, drop any job whose
  `_id` is already in the cache's `ids` before counting it toward N. Unlike
  TheirStack, this costs the same 1 credit per job whether or not it turns
  out to be a dup — Hirebase bills per job *returned*, not per job accepted,
  so a heavily-reseen query burns credits faster here than on TheirStack.
  Say so if a run's dup rate looks high (e.g. "6 of 10 pulled were already
  seen — consider broadening filters before the next run").
- **After the run**: append every job actually shown to `ids` (dedup by
  `_id`), and update `lastSeenDatePosted` to the max `date_posted` seen.

## Step 4: Size it, then pull-and-filter — same loop shape, free sizing call

**Size first**, via the estimate endpoint — costs 0 and still works at the
plan cap:

```bash
echo '<filter body>' | node .claude/skills/candidate-job-matcher-hirebase/hirebase-search.mjs --endpoint estimate
```

Response is `{"ok": true, "result": {"cost": N}, "usage": {...}}` — `cost` is
`min(limit, total matches)`. Zero or very low: loosen the newest filter
(same one-change-at-a-time rule as candidate-job-matcher). Very high relative
to N: tighten `job_titles` or add an exclusion entry.

**Then loop**, same structure and caps as candidate-job-matcher — these are
deliberately kept identical even though Hirebase's own `limit` cap is higher
(100, vs. TheirStack's 25-per-page free-plan cap), because the caps exist to
bound credit spend and loop iterations, not to match any one provider's page
size:

1. Pull one page via `--endpoint search`, **`limit: 10` hard cap**, `page`
   incrementing each loop. Always include `sort_by`/`sort_order` and the
   cache's dedup fields from above.
2. Per job, two checks:
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
   - **Dedup check**: drop if `_id` is in the seen-jobs cache (see above).
3. Append accepted jobs; stop at N (truncate unless "at least N" was asked).
4. Continue only if `total_pages` (from the sizing call's implied count, or
   this page's own `total_pages`) indicates more remain.
5. **Retry cap: 4 pull attempts, hard stop** — identical rule to
   candidate-job-matcher, for the identical reason (structural loop-safety,
   not a target to balance against N). State "pull attempt 2 of 4" etc.
6. **Raw-job cap: 40** (4 × `limit: 10`) — identical to candidate-job-matcher.

Report the stop reason the same way candidate-job-matcher does
("stopped: retry cap" vs. "stopped: raw-job cap" vs. "exhausted" vs. reached
N), and the same honesty rule applies: never pad short results to hit N.

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
full original text for the multi-dimensional YOE read above).

## Output

Same table shape as candidate-job-matcher:

| # | Job Title | Company | Location | Min. YOE Required | Est. Salary | Posted | URL |
|---|---|---|---|---|---|---|---|

Above it: computed seniority target + YOE, and N vs. delivered + pull attempts
used (same phrasing as candidate-job-matcher). Below it, same disclosure list
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
# sizing
echo '{"job_titles": ["Software Engineer", "Backend Engineer", "-senior", "-staff"], "yoe": {"min": 3, "max": 5}, "include_yoe": "true", "location_types": ["Remote"], "hide_recruiting_agencies": "true", "limit": 10}' \
  | node .claude/skills/candidate-job-matcher-hirebase/hirebase-search.mjs --endpoint estimate

# pull a page
echo '{"job_titles": [...], "yoe": {...}, "page": 1, "limit": 10, "sort_by": "date_posted", "sort_order": "desc"}' \
  | node .claude/skills/candidate-job-matcher-hirebase/hirebase-search.mjs --endpoint search
```

Run from the repo root. Both calls print one JSON line to stdout; non-zero
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
- Always run the free `estimate` call before pulling a full page.
- Never exceed 4 pull attempts or 40 raw jobs pulled in a single run.
- **(Hirebase-specific)** Never treat a `limit_exceeded` 429 as retryable —
  only a `retryAfter`-bearing rate-limit 429 is.
- **(Hirebase-specific)** Never assume `date_posted`-based filtering excludes
  already-seen jobs the way TheirStack's `discovered_at_gte` did — it's a
  freshness bias, not a dedup mechanism. The `_id`-based client-side check is
  the only real dedup here, and it still costs a credit per pulled job.
- **(Hirebase-specific)** Never collapse a posting's multiple distinct
  years-of-experience requirements into the single `yoe_range` the API
  returns — that field is one parsed range; a second, differently-scoped
  requirement (e.g. a management-years number) still needs the manual
  description read from candidate-job-matcher's multi-dimensional YOE logic.
