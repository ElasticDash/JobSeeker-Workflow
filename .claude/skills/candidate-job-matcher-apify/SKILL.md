---
name: "candidate-job-matcher-apify"
description: "Apify-backed alternative to candidate-job-matcher / candidate-job-matcher-hirebase: convert a WideApply candidate profile export into Wellfound (formerly AngelList Talent) role/location search URLs, verify each role slug resolves for free via a direct page fetch before spending any Apify credit, run the saswave~wellfound-company-job-scraper actor to pull real postings, then filter client-side for seniority/YOE/freshness/stack-match (Wellfound has no server-side filters beyond the URL's role+location) and skip jobs already shown to this candidate in a prior run. Skews toward startup/VC-backed employers — a complementary source alongside Hirebase/TheirStack, not a full substitute for enterprise-heavy searches. Outputs matching jobs with salary. Triggers: find jobs for this candidate via Apify, wellfound search for <candidate>, use apify instead of hirebase, search wellfound for jobs."
---

# Candidate Job Matcher (Apify / Wellfound)

Same job as `candidate-job-matcher` and `candidate-job-matcher-hirebase`, a third
data source: Wellfound (wellfound.com, formerly AngelList Talent), scraped through
the Apify actor `saswave~wellfound-company-job-scraper` via a local script
(`apify-search.mjs`, in this folder). Read `candidate-job-matcher`'s own SKILL.md
for the parts that don't change (seniority/YOE computation from the profile, title
expansion judgment, output-table discipline, the numeric and multi-dimensional YOE
regex logic) — this file only covers what's different about Wellfound's data shape
and the lack of any server-side filter beyond the search URL's own role and
location. Don't run more than one of these three skills for the same request; pick
one data source per run.

**Know what Wellfound actually is before leaning on it.** It's a startup/VC-backed
jobs board — most listings skew early-to-growth-stage, equity-bearing, and
tech-forward. It's a good complementary source when the candidate is open to
startups, but it is not a like-for-like replacement for Hirebase/TheirStack on a
search that specifically wants large enterprises, government, or non-tech
employers — say so if the candidate's ask leans that way rather than quietly
returning a thin or skewed result set under this provider alone.

## Where this runs

Needs real shell access to run `apify-search.mjs` from the repo root — same
constraint as every other script-backed skill in this repo. If you're in a session
without shell access, build the exact command (see "Calling the script" below) and
hand it to the user.

## One-time setup

`APIFY_KEY` must already be in `<repo-root>/.env` (not `.secrets/` — this is a
read-only external search, not a write to ElasticDash-BE, so it doesn't need that
extra isolation). If it's missing, tell the user to add it — an Apify API token
from their Apify Console account settings — and get the value from them; never
guess or invent one. `.env` is gitignored wholesale, same as `.secrets/`.

## Step 1: Compute the candidate's own seniority — identical to candidate-job-matcher

Follow `candidate-job-matcher`'s Step 1 exactly: sum total YOE from the profile's
`## Experience` entries, map to a label, reconcile against any stated target, and
compute the floor and ceiling for a posting's stated minimum. Ceiling is
`candidate_YOE`. Floor is `candidate_YOE - 1`, capped at 4 once `candidate_YOE`
reaches 6 or more (see CLAUDE.md's "YOE floor, capped"). This logic is data-source
agnostic and doesn't change for Wellfound — Wellfound just has no server-side way
to apply it, so every bit of this enforcement happens client-side in Step 4.

## Step 2: Title expansion → Wellfound role slugs, verified free before any paid call

**Expand the anchor title using candidate-job-matcher's fixed family table (Step
2 there) — same lookup, same disambiguation exclusion list, same skill-gated Game
Engineer exception.** Don't generate variants freehand. State which family and
specialization you matched, same as the other two matcher skills.

**Wellfound has no bag-of-words title filter — the URL path segment itself must be
an exact, pre-existing role slug in Wellfound's own taxonomy**, unlike Hirebase's
`job_titles` or TheirStack's `job_title_or`. A role slug is simply the lowercase,
hyphenated form of the role name (`"Site Reliability Engineer"` →
`site-reliability-engineer`), but not every English phrase has a corresponding
slug, and a slug that doesn't exist **silently redirects to a different, broader
page** rather than erroring — using it unverified either pulls an unfiltered flood
of unrelated postings (expensive and wrong) or a near-empty set, with no clear
signal which happened.

**Verify every candidate slug with one free page fetch before it ever reaches the
paid Apify call.** For each expanded title variant (2-4 of them, same guidance as
the other two matcher skills — more than that is diminishing returns once each one
needs its own verification fetch):

1. Build the candidate URL: `https://wellfound.com/role/<slug>`.
2. Fetch it directly (a plain page fetch — TinyFish's `fetch_content` or
   equivalent, **not** the Apify actor, this step costs nothing).
3. **Accept the slug only if the fetched page's `final_url` is the same path you
   requested** (no redirect away from it) **and** the page's title/heading reads
   as a job-search results page (e.g. ends in "Jobs", shows a "`<N>` results
   total" line). A redirect to a different path, a generic homepage, or a 404 all
   mean the slug doesn't exist in Wellfound's taxonomy — drop that variant, don't
   fall back to guessing a different spelling without the same verification.
4. Note the `<N> results total` / `Page X of Y` line from this same fetch — it's a
   free, rough sizing signal for Step 4 (rough, not precise — see that step's
   caveat on why Wellfound's per-page job density doesn't convert cleanly to a job
   count).

Known-good slugs already confirmed this way (safe to reuse without re-verifying,
but still re-verify if Wellfound's taxonomy may have changed since 2026-10-17):
`software-engineer`, `backend-engineer`, `frontend-engineer`,
`full-stack-engineer`, `full-stack-developer`, `mobile-engineer`,
`ios-engineer`, `data-scientist`, `data-engineer`, `data-analyst`,
`business-analyst`, `devops-engineer`, `site-reliability-engineer`,
`security-engineer`, `machine-learning-engineer`, `qa-engineer`,
`product-manager`, `technical-program-manager`, `program-manager`,
`project-manager`, `engineering-manager`. Abbreviations (`swe`, `sde`, bare `pm`)
are **not** confirmed and should not be assumed — Wellfound's taxonomy runs on
full words, verify before using any abbreviation-derived guess.

## Step 3: Location stays out of the search URL by default — filter it client-side, in the cascade below

**Default to a title-only "board search" URL (`https://wellfound.com/role/<slug>`,
no location segment) even when a verified location slug exists** (user directive,
2026-10-17). Wellfound's filters are so limited that the right strategy is: cast
one wide net on title alone, then do every other filter — including location —
client-side in the cheap-to-expensive cascade in Step 4, rather than trying to
get location-narrowing to pay for itself server-side. This also sidesteps the
slug-fragility problem entirely for location: no location slug, no risk of a
silent redirect to an unfiltered page.

The one exception worth knowing about, documented for completeness rather than as
the default: Wellfound's search URL *can* combine role + location as
`https://wellfound.com/role/l/<role-slug>/<location-slug>`, with the same
free-verification requirement as role slugs (Step 2) — same redirect check, same
"don't guess a spelling." Known-good location slugs confirmed this way:
`san-francisco`, `new-york`, `los-angeles`, `boston`, `chicago`, `seattle`,
`austin`, `denver`, `district-of-columbia`, `united-states`, `india`. Reach for
this only if a specific run wants to deliberately cut the board-search volume for
an unusually large metro-only ask — not as a routine step.

**There is no remote-specific location slug, under either approach.**
`/role/l/<role>/remote` redirects back to the plain `/role/<role>` page (confirmed
2026-10-17) — Wellfound's own remote-vs-onsite preference is a signed-in, stateful
UI toggle, not a URL parameter, so it cannot be expressed in a scraped search URL
at all. Remote eligibility is always a client-side check (Step 4) on each result's
own `remote` (bool) and `acceptedRemoteLocationNames` (array of countries/regions
the company will hire remotely from), regardless of which URL shape was used.

## Step 4: Board search first, then a cheapest-to-most-expensive filter cascade — Wellfound has no server-side filters at all beyond title (and, optionally, location)

**Pull one broad batch on title alone before any filtering — roughly 400 raw jobs
is the target** (user directive, 2026-10-17), not an N-scaled pull. The reasoning:
Wellfound's filters are so limited that trying to search narrowly risks silently
missing real matches; a wide, cheap-to-acquire batch up front, filtered down in
stages after the fact, is safer than trying to get precision out of the search
itself. N (the requested output count) only governs when to stop *reporting*
accepted jobs later in the cascade, not how big the initial pull is.

**Combine every verified title variant into one actor call's `search_jobs`
array** rather than one call per variant — Apify bills this actor per **result
returned** ($0.80/1,000), not per URL requested, so there's no cost penalty to
batching multiple search URLs into a single run. A job appearing under more than
one variant's URL is billed once per URL it's scraped under (the actor doesn't
dedupe across input URLs itself) — client-side dedup by `id` (Step 5) still
collapses it to one row in the output, same as any other near-duplicate.

**Sizing `max_page` toward ~400 raw jobs is a rough dial, not a precise
formula — say so plainly rather than implying false precision.** Unlike
Hirebase's free `page:999` overfetch trick or TheirStack's
`include_total_results`, Wellfound/Apify has no cheap endpoint that reports an
exact job count for a given `max_page`. The `<N> results total`/`Page X of Y`
figures from Step 2's free verification fetch describe the *site's own* HTML
pagination (which groups multiple job listings under one company tile per page),
not a reliable per-page **job** count the actor will return — confirmed on a real
run (2026-10-17): a role whose HTML page reported "275 results total" returned 27
raw job items from the actor at `max_page: 1`, not the ~50+ a naive
`total_results / total_pages` estimate would suggest.

1. **Start at `max_page: 4`** (the hard cap below) across however many verified
   title variants are batched into one call, aiming for ~400 combined raw jobs
   before dedup. Since per-page job density is unpredictable (confirmed above),
   don't try to solve backward from 400 to an exact `max_page` — just use the cap
   and see what comes back.
2. **The actor has no incremental/resume pagination** — a higher `max_page`
   re-scrapes every earlier page from scratch, it does not pick up where a prior
   run left off. Given the price, this is cheap in absolute terms, but don't
   retry more than **once** per search-URL set — if the pull still came back thin
   on a second attempt, that's a real signal the role is thin on Wellfound
   specifically, not a reason to keep retrying.
3. **Hard raw-job cap: 400 raw jobs pulled per run** (raised from an earlier
   200-job draft of this skill to match the board-search target above) — stop
   pulling (don't start a second variant combination) once cumulative raw jobs
   returned across this run's actor calls hits 400, whether or not the cascade
   below has reached N accepted jobs yet.

**Then run the filter cascade in this exact order — cheapest and most reliable
signal first, most expensive last — so the fewest possible jobs ever reach the
expensive step.** Each stage only runs on jobs that survived the stage before it.
At every stage, **only drop on a clear, unambiguous disqualifier** — anything
genuinely borderline passes through to the next stage rather than being cut
early; the point of ordering by cost is to do the cheap work first, not to make
the early stages more aggressive than the data actually supports ("minimize what
needs the expensive step, without missing anything with potential").

1. **Freshness, first** — cheapest possible check, a single timestamp compare,
   so it cuts the pool before any text-reading begins. Wellfound has no
   server-side date filter at all (no `days_ago` / `posted_at_max_age_days`
   equivalent), so this is entirely client-side: convert `liveStartAt` (unix
   seconds) to a date and apply this repo's standard freshness convention —
   default to a 7-day window (or whatever the user explicitly asked for),
   widen to 14 only if the surviving pool is thin, and treat 14 days as a hard
   ceiling, never wider, matching `candidate-job-matcher-hirebase`'s own
   non-negotiable rule (added 2026-10-05) for the same reason — a stale posting
   sourced and acted on before anyone notices it's likely closed is a real
   failure mode, not a hypothetical one.
2. **Title-level check, second** — still cheap (one string field, no full-text
   read): read `title` (the literal posting title, not `primaryRoleTitle` —
   Wellfound's own internal role-taxonomy label can differ from what the posting
   is actually titled) for seniority markers (numeral suffixes, "Entry Level",
   "New Grad", "Intern", "Associate", "Staff", "Principal", "Director", etc. —
   candidate-job-matcher's own exclusion table, Step 2) **and** the family's
   disambiguation exclusion list (Data/ML/QA/Security/Network/DevOps-SRE-
   Platform/Infrastructure/Mechanical-etc./Sales-Solutions-Support), the same
   backstop role as the other two matcher skills' Step 4 item 2 — a compound
   title ("Senior Platform Software Engineer") can carry the disambiguating word
   right next to "Software Engineer" and still needs to be dropped on it. Also
   catch near-duplicates here (same `company.name`+`title` appearing under more
   than one input URL).
3. **Profile match, third** — YOE and location/remote together, since both are
   still cheaper than a full semantic JD read even though they touch more of the
   job object than stage 2:
   - **Numeric YOE**: use `yearsExperienceMin`/`yearsExperienceMax` directly when
     non-null — Wellfound's own structured fields, no regex needed for those
     jobs. **When both are null (common — not populated on every posting), fall
     back to candidate-job-matcher's own description-regex YOE extraction (its
     Step 4 "Numeric years-of-experience filter" and "Multi-dimensional YOE
     requirements" sections) against this job's own `description`**, which
     already arrives as the full posting text (not truncated the way Hirebase's
     default is) — no raw-description flag or extra fetch needed to get the full
     text. Apply the same floor/ceiling from Step 1 either way.
   - **Location/remote**: if a location-combo URL was used (Step 3's exception
     case), the pool is already scoped — still sanity-check `locationNames` isn't
     empty/contradictory. Otherwise (the default title-only pull), check
     `locationNames` against the candidate's desired location, or, when the
     requirement is remote, check `remote === true` and, when the candidate needs
     remote-in-a-specific-country, that country appears in
     `acceptedRemoteLocationNames`. **Treat an empty or missing
     `acceptedRemoteLocationNames` on a `remote: true` job as unstated, not as
     "open to anywhere"** — flag it rather than silently accepting or rejecting,
     same "don't silently drop or silently pass unknowns" principle the other two
     matcher skills apply to missing YOE/salary data.
4. **Stack-match / JD screening, last and only on what's left** — the most
   expensive stage, a full read of each surviving job's `description` against
   the candidate's profile, so running the cascade above first is what keeps this
   stage's job count down. Wellfound has no `job_technology_slug_or` or
   structured `skills[]`/`technologies[]` array the way TheirStack/Hirebase do —
   scan this job's `description` text directly for the candidate's Skills list
   keywords, same as candidate-job-matcher's own Step 3 "tech-stack matching
   needs a description-level keyword pass" gotcha. Apply the same gate
   `candidate-job-matcher-hirebase`'s own Step 4 stack-match section documents
   — not language-only: core implementation language is where the real
   leniency lives (a different framework/library/ORM/test tool in a language
   the candidate already has is not a real gap, a core language with zero
   evidence anywhere in the profile is), but every other hard, explicitly-stated
   mandatory skill, platform, OS, tool, or certification named in the posting
   still gates normally with zero leniency (confirmed gap on Hirebase 2026-10-08:
   a Linux requirement was passing because only the language dimension was
   checked). Also apply the same per-occurrence scanning discipline (a
   technology named more than once in one posting needs every occurrence
   checked, not just the first) and the same OR-vs-AND read on multi-language/
   multi-skill bullets, all documented in that same Hirebase section — don't
   duplicate that reasoning here, just apply it against this job's
   `description`. The posting's own `description` from the board-search pull is
   already the full text (not truncated) — no separate per-job fetch is needed
   to read it; only fall back to fetching the job's `url` directly (free, not
   another actor call) in the rare case `description` is genuinely empty.
5. Append accepted jobs; stop at N (truncate unless "at least N" was asked).

Report the stop reason explicitly (400-raw-job cap vs. exhausted vs. reached N vs.
"retried once, still short — likely thin on Wellfound for this role"), plus how
many jobs the cascade dropped at each stage (freshness / title / profile / stack),
so the user can see where the pool actually narrowed. Same honesty rule as the
other two matcher skills: never pad a short result to hit N.

## Step 5: Extracting results — always via the saved file

`apify-search.mjs` already writes every run's dataset items to
`.temp/apify-raw/<timestamp>-search.json` and prints only a compact summary
(`runId`, `status`, `itemCount`, the saved path) to stdout — unconditional, same
"always via the saved file" discipline as the other two matcher skills' scripts.
Pull fields with `jq`:

```bash
jq -r '.[] | [.id, .title, .company.name, (.locationNames // [] | join("; ")), .remote, .url, .liveStartAt, .compensation, .yearsExperienceMin, .yearsExperienceMax] | @tsv' "<saved-file-path>"
```

Useful fields: `id` (feeds the dedup cache), `title` (the literal posting title —
use this for the title-level check, not `primaryRoleTitle`), `primaryRoleTitle`
(Wellfound's own role-taxonomy label, informational only), `slug`,
`company.name`, `company.slug`, `company.url` (the Wellfound company page — useful
grounding for downstream lead research), `company.companySize`,
`company.badges` (array of strings like `"Badge:ACTIVELY_HIRING"`,
`"Badge:YC-<id>"`, `"Badge:TOP_INVESTORS-<id>"` — a `Badge:YC-...` entry is a loose
YC-alumni signal if the user asks for recent-batch startups, same caveat as
candidate-job-matcher's own "YC batch recency" section: this flags alumni status,
not batch year), `url` (the direct Wellfound job posting — this is what goes in
`jobPostUrl`), `liveStartAt` (unix seconds — convert for the freshness check
above), `jobType`, `compensation` (a free-text string like `"$110k – $155k"`, not
a structured min/max the way TheirStack/Hirebase return it — parse it with a
regex for display, or leave it as-is in the output table rather than
over-engineering a split that can misparse an unusual format), `description`
(full text, not truncated — source for the YOE-regex fallback and stack-match
checks above), `locationNames`, `remote`, `remoteConfig` (an object,
`kind: "ONSITE"|"REMOTE"|"HYBRID"` plus `wfhFlexible`, when present —
informational, `remote`/`acceptedRemoteLocationNames` are the two fields the
location check above actually relies on), `acceptedRemoteLocationNames`,
`atsSource` (e.g. `"AtsIntegration::Greenhouse::Listing"` — present when the
posting syncs from the employer's own ATS, a loose direct-employer signal; absent
doesn't mean agency, just unconfirmed either way).

## Seen-jobs dedup — client-side only, same mechanism as Hirebase

Wellfound/Apify has no server-side exclude-by-id or discovered-since filter
either — same trade-off as `candidate-job-matcher-hirebase` versus TheirStack.

- **Cache file**: `~/.wideapply-job-matcher-skill/seen-jobs-apify/<slugified-key>.json`
  — a separate cache from both other matcher skills' own (different `id` space,
  don't merge them), keyed the same way: candidate's email, else the
  `campaignId`, else ask. Format: `{"ids": [{"id": "<id>", "company": "...",
  "role": "...", "seenAt": "<ISO date>"}]}`.
- **Before searching**: read the cache.
- **Client-side dedup, every pull**: after fetching the saved file, drop any job
  whose `id` is already in the cache before counting it toward N — same "costs
  the credit either way" caveat as Hirebase (Apify bills per result returned
  regardless of whether it turns out to be a dup you'd already shown).
- **After the run**: append every job actually shown to `ids` (dedup by `id`).

## Output

Same table shape as the other two matcher skills:

| # | Job Title | Company | Location | Min. YOE Required | Est. Salary | Posted | URL |
|---|---|---|---|---|---|---|---|

Above it: computed seniority target + YOE (Step 1), which title variants were
verified/used and which were dropped as not-a-real-slug (Step 2), whether a
location slug was used or the search fell back to role-only + client-side
location filtering (Step 3), the `max_page` used and whether a retry happened, N
vs. delivered, and the stop reason. Below it, same disclosure list the other two
matcher skills use: profile-derived vs. explicit-instruction filters; dedup cache
stats (jobs dropped as already-seen); YOE drops broken out over-ceiling vs.
under-floor vs. unstated-and-regex-extracted vs. unstated-and-unparseable;
stack-mismatch flags; near-duplicates collapsed; any multi-dimensional YOE
postings and their per-dimension verdicts; remote-eligibility-unstated flags
(empty `acceptedRemoteLocationNames` on a `remote: true` job); any role/location
slug that failed verification and was dropped rather than guessed around; known
data gaps.

## Calling the script

```bash
# verify a role slug first — free, not the actor (use your own page-fetch tool, e.g. TinyFish fetch_content)
#   fetch https://wellfound.com/role/<slug> and confirm final_url matches with no redirect

# then run the actor with every verified variant batched into one call
echo '{"search_jobs": ["https://wellfound.com/role/backend-engineer", "https://wellfound.com/role/software-engineer"], "max_page": 2}' \
  | node .claude/skills/candidate-job-matcher-apify/apify-search.mjs --run

# role + verified location combo
echo '{"search_jobs": ["https://wellfound.com/role/l/backend-engineer/san-francisco"], "max_page": 1}' \
  | node .claude/skills/candidate-job-matcher-apify/apify-search.mjs --run
```

Run from the repo root. The script polls the actor run to completion (up to 5
minutes) and prints one JSON line to stdout on success:
`{"ok":true,"runId":...,"status":"SUCCEEDED","savedTo":"<path>","itemCount":N}`.
Non-zero exit code on failure, with `stage` (`"start"`/`"poll"`/`"run"`/`"dataset"`)
and `error` populated — `stage: "run"` with a `status` other than `SUCCEEDED`
(`FAILED`/`ABORTED`/`TIMED-OUT`) means the actor itself failed, not a network
problem; relay the `error` text to the user rather than retrying blindly.

## Rules

- Never use a role or location slug in a paid actor call without first verifying
  it via a free page fetch (Step 2/3) — a bad slug silently redirects to a
  different, unfiltered page rather than erroring.
- Never guess at an abbreviation-derived slug (`swe`, `sde`, bare `pm`) — verify
  the full-word form instead; Wellfound's taxonomy runs on full words.
- There is no remote location slug — never attempt one (`/role/l/<role>/remote`
  silently redirects to the role-only page); use the role-only URL plus the
  client-side `remote`/`acceptedRemoteLocationNames` check for any remote
  requirement.
- Batch every verified title/location variant into one actor call's `search_jobs`
  array — cost scales with results returned, not with URLs requested, so there's
  no reason to run one actor call per variant.
- Never exceed `max_page: 4` or retry a search-URL set more than once per run —
  the actor has no incremental pagination, so a retry re-pays for every earlier
  page; more than one retry on a thin result is a signal the role/location is
  genuinely thin on Wellfound, not a reason to keep widening `max_page`.
- Never exceed 400 raw jobs pulled (summed across every actor call) in a single
  run — the board-search target (Step 4), not an N-scaled figure.
- Always run the filter cascade in order — freshness, then title, then profile
  (YOE/location/remote), then stack-match/JD screening last — so the fewest
  possible jobs reach the expensive last stage. Never reorder this to run
  stack-match/JD screening before the cheaper stages have already narrowed the
  pool.
- Never drop a job at the freshness or title stage on an ambiguous signal — only
  an unambiguous disqualifier belongs in the cheap stages; anything genuinely
  borderline passes through to the next stage so it isn't missed.
- Never treat Wellfound's own `<N> results total` HTML figure as a reliable
  per-page job count — it describes company-tile pagination, not a 1:1 job count,
  confirmed to diverge from the actor's own returned item count on a real run.
- Never skip the client-side YOE/title/freshness/stack-match checks on the
  assumption Wellfound filtered any of it server-side — it filters nothing beyond
  the URL's own role and location.
- Always fall back to candidate-job-matcher's description-regex YOE extraction
  when `yearsExperienceMin`/`yearsExperienceMax` are both null — don't treat a
  null structured field as "no requirement" without having actually read the
  description.
- Always treat an empty/missing `acceptedRemoteLocationNames` on a `remote: true`
  job as unstated eligibility, not as "open to anywhere" — flag it, don't
  silently pass or fail it.
- Always populate the dedup cache (`seen-jobs-apify`) after every run, and never
  merge it with the Hirebase or TheirStack caches — different `id` space.
- Never let this skill's "startup-skewed" nature go unstated when the candidate's
  ask leans enterprise/government/non-tech — say so rather than quietly returning
  a thin or mismatched result set.
