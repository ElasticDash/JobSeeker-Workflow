---
name: "candidate-job-matcher-grokbot"
description: "Build a GrokBot-ready job search condition from a WideApply candidate profile export, a CV, and a targeted title: computes the candidate's own seniority and total YOE, expands the target title into same-or-similar variants, derives geography/relocation and other filters, and scopes the search to a fixed ordered list of job boards (startup boards and mixed VC/community boards first, Indeed as a fallback tier). Outputs one provider-agnostic JSON search condition for GrokBot to run. Does not call GrokBot, does not pull or filter results itself; condition-building only. Triggers: build a grokbot search condition, grokbot filter for <candidate>, prep a grokbot query, grokbot search condition from profile and CV."
---

# Candidate Job Matcher (GrokBot condition builder)

Takes a candidate's profile export, CV, and a targeted title, and turns them into
one structured search condition that GrokBot can run against. This skill does the
same filter-derivation work as `candidate-job-matcher` (TheirStack) and
`candidate-job-matcher-hirebase`, computing seniority, expanding the title, and
reading geography and relocation preferences, but stops there: it does not call
any search API, does not pull job postings, and does not run the pull-and-filter
loop those two skills use. GrokBot itself has no known input schema yet, so the
output here is a generic, documented JSON object instead of a provider-specific
query. When GrokBot's real input format is known, add a thin translation step on
top of this output rather than reworking the derivation logic below.

Read `candidate-job-matcher`'s own SKILL.md (`~/.claude/skills/candidate-job-matcher/SKILL.md`)
for the full reasoning behind the seniority/YOE computation and title-expansion
judgment call; this file only restates what's needed to build the condition and
covers what's different (no live query, no dedup cache, generic output shape).

## Inputs

- **WideApply candidate profile export**, if available: most recent title(s),
  every `## Experience` entry's date range, Desired Job Location section, Work
  Authorization section, Desired salary (if stated), Skills list.
- **CV** (the candidate's resume, `.docx`/PDF/plain text), when no profile
  export is available or to cross-check the profile: use it as the source for
  the same fields above (titles, experience date ranges, skills) if the
  profile export is missing or incomplete. If both are present and they
  disagree on a date range or title, say so and prefer the profile export
  (it's the WideApply system's source of truth) rather than silently picking
  one.
- **Targeted title**: the role to search for, given explicitly by the user for
  this run. This is the anchor title Step 2 expands into variants, not the
  literal string to put in the condition alone. If the user didn't give one,
  fall back to the candidate's own most recent title from the profile/CV, and
  say explicitly that you did so.

From the user's request, optionally: a freshness window (e.g. "last 7 days"),
a target job count for the escalation policy in Step 6 (default 140 if
unstated), whether to exclude recruiting agencies, and any explicit company
inclusion or exclusion list.

## Step 1: Compute the candidate's own seniority and YOE

Identical to `candidate-job-matcher`'s Step 1 (read it there for the full
provisional-thresholds caveat). Summarized:

1. Sum total YOE from every `## Experience` entry's date range (open-ended
   entries count through today). State the arithmetic explicitly.
2. Map total YOE to a label:

   | Total YOE | Label |
   |---|---|
   | 0-2 | Junior / Entry |
   | 2-5 | Mid-level |
   | 5-8 | Senior |
   | 8-12 | Staff / Lead |
   | 12+ | Principal / Director+ |

3. If the profile or request states a target level directly (e.g. "looking
   for a Senior Software Engineer role"), that target takes priority over the
   YOE-computed bucket for filtering. Compute and state both when they
   differ, don't let one silently win.
4. The numeric floor for a posting's stated minimum requirement is the
   candidate's own total YOE minus 1 (not the bucket table's lower bound),
   capped at 4 once the candidate has 6 or more years of total YOE (the floor
   never climbs past "4+" no matter how senior the candidate gets beyond
   that point, see CLAUDE.md's Screening and checks section). Ceiling is the
   candidate's own total YOE, unless a stated target level gives its own
   floor instead.
5. Compute sub-dimension YOE (e.g. a separate management/leadership number)
   only when the targeted title's family typically splits requirements this
   way. If the profile/CV doesn't give enough signal to compute a
   sub-dimension with confidence, mark it "unverifiable from profile" in the
   output notes rather than guessing a number.

**Count x.5 years as x+1 against a minimum years requirement** (same rule used
elsewhere in this repo for screening) when reconciling a stated target's own
floor against the candidate's actual tenure.

## Step 2: Expand the targeted title

Look up the targeted title's family and specialization/tag in
`candidate-job-matcher`'s Step 2 fixed table (changed 2026-10-06 — a
deterministic lookup, not a per-run judgment call): identify the family
(Software Engineer, Program/Project Manager, Product Manager, Data
Scientist/Analyst, or "not covered" if none match), the specialization tag
within it (e.g. Frontend/Backend/Full Stack/Mobile for Software Engineer,
checking the candidate's Skills list for the Game/Graphics skill-gate if
relevant), pull that family's base-noun synonym set plus the specialization-
containment row for `titles.include`, and its disambiguation exclusion list
for the new `titles.excludeOffDomain` field (Output below) — separate from
the seniority exclusions, which stay their own field. If the targeted title
matches no known family, fall back to generating 3-6 same-or-similar
variants by judgment and say explicitly that this title had no fixed-table
match.

State which family/tag you matched (or that none matched, and why you fell
back to judgment) before producing the output JSON so the choice is visible
and auditable back to the table, not a freehand list.

Separately, build the seniority exclusion words for the computed bucket (both
directions, too-senior and too-junior), same table `candidate-job-matcher`
uses:

| Computed label | Exclude, too senior | Exclude, too junior |
|---|---|---|
| Junior / Entry | senior, staff, principal, director, lead, head of, vp, chief | (none) |
| Mid-level | staff, principal, director, vp, head of, chief | junior, entry level, new grad, intern, associate |
| Senior | principal, director, vp, head of, chief | junior, entry level, new grad, intern, associate, mid-level |
| Staff / Lead | director, vp, head of, chief | junior, entry level, new grad, intern, associate, mid-level |
| Principal / Director+ | (generally none) | junior, entry level, new grad, intern, associate, mid-level, staff (debatable) |

## Step 3: Geography and relocation

Read the profile/CV's Desired Job Location and Work Authorization sections.
Apply the same relocation default this repo already uses for screening (see
CLAUDE.md's Screening and checks section): treat relocation as possible by
default when the profile doesn't say otherwise, remote jobs are always in
scope regardless of relocation willingness, but if the profile explicitly
states "Willing to relocate: No," scope the condition to remote plus the
candidate's current city only, not "anywhere."

Encode this as a single `geography` object rather than two separate query
passes (there's no live search to split into passes here, just a condition to
describe):

- `mode`: one of `"remote_and_current_city"` (relocation not allowed, the
  default-safe case), `"open"` (relocation allowed or unstated, no geography
  restriction beyond the candidate's stated preference), or
  `"current_city_only"` (candidate explicitly ruled out remote).
- `remote`: whether remote postings are in scope.
- `currentCity` / `desiredCity`: structured `{city, region, country}` from the
  profile, plain strings, no catalog lookup.
- `countryRestriction`: an ISO2 code, only when Work Authorization restricts
  the candidate to one country (e.g. no sponsorship, US-only). This still
  applies even when `mode` is `"open"`.
- `relocationAllowed`: boolean, mirrors the gate above.
- `relocationNote`: one sentence explaining which rule fired and why (quote
  the profile line that triggered it, e.g. "Willing to relocate: No").

## Step 4: Other filters

| Field | Derived from | Notes |
|---|---|---|
| `yoeRequirementRange` | Step 1 floor/ceiling | `{min, max}` for a posting's stated minimum requirement |
| `subDimensionYoe` | Step 1 item 5 | Only when applicable, e.g. `{"management": 1.2}`; omit dimensions that can't be computed, list them in `notes` as unverifiable instead |
| `skills.keywords` | Skills list, technical roles only | Soft signal by default (`skills.mode: "soft"`), not a hard filter, unless the user explicitly wants a hard requirement |
| `salary` | Desired salary, only if stated | Never invent a minimum; most postings don't list salary, so leave this unset rather than silently narrowing the market |
| `companyPreferences.excludeAgencies` | Default `true` | Drop only if the user wants agency postings included |
| `companyPreferences.excludeCompanies` / `includeCompanies` | Explicit user ask only | Never invent a company list |
| `searchStrategy.initialFreshnessDays` | User's freshness ask | Defaults to 7 if unstated; see Step 6 for the escalation that builds on this |

## Step 5: Target job boards

GrokBot's search condition always carries a fixed, ordered list of boards to
search, not an open web search. Use this list and this priority order on every
run, don't ask the user to restate it:

**Tier 1, startup boards (search these first):**

| Board | Target |
|---|---|
| workatastartup.com | Startups |
| https://startup.jobs/ | Startups |
| https://wellfound.com/jobs | Startups |

**Tier 2, mixed boards (search after Tier 1):**

| Board | Target |
|---|---|
| jobs.a16z.com | Mixed |
| jobs.sequoiacap.com | Mixed |
| https://builtin.com/jobs | Mixed |
| https://hiringcafe.com/ai-search | Mixed |

**Tier 3, fallback (search only after Tiers 1 and 2):**

| Board | Target |
|---|---|
| indeed.com | General |

Carry both the board URL and its `target` label into the condition (`startup`
or `mixed`) so GrokBot (or a human reading the condition) can weight startup
fit on the Tier 1/2 results without re-deriving it. Don't drop Indeed from the
condition entirely, keep it as its own tier so it's only consulted once the
higher-priority boards are exhausted or thin, don't blend it into Tier 1/2's
order. If the user names additional boards or asks to drop a tier for a given
run, treat that as an explicit override and say so in `notes`, don't silently
change the default list for future runs.

## Step 6: Freshness escalation policy

GrokBot, not this skill, runs the actual search and counts results (see the
"Never call GrokBot... or run a pull-and-filter loop from this skill" rule
below) — so this policy is encoded declaratively in the condition for GrokBot
to follow, not executed as a loop here.

- `targetJobCount`: the minimum total jobs wanted across all boards. Default
  140 unless the user states a different number for this run.
- `initialFreshnessDays`: 7, unless the user's freshness ask overrides it.
- `escalatedFreshnessDays`: 14 — exactly double the initial window, not a
  user-tunable field on its own; if the user gives a different initial
  window, escalate to double that instead of hardcoding 14.
- The rule GrokBot should follow: run the search at `initialFreshnessDays`
  first. If the total job count across all boards is below
  `targetJobCount`, re-run once at `escalatedFreshnessDays`. Stop after that
  second pass regardless of outcome — proceed with whatever was found as
  soon as `targetJobCount` is met (at either pass) or the
  `escalatedFreshnessDays` pass completes, whichever happens first. Never
  escalate past the second pass.

Carry this as a `searchStrategy` object in the condition (see Output below)
rather than a bare `freshnessDays` number, since a single number can't
express the escalation step.

## Output

One short summary, then the condition as JSON.

Summary lines (plain text, above the JSON):
- Candidate's computed seniority and total YOE, and the stated target level if
  one was given and it differs.
- The expanded title list used, with the anchor marked, and which family/tag
  it came from (or that no family matched and the list came from judgment
  instead) — plus `excludeOffDomain` if the family carried a disambiguation
  list.
- Which fields came from the profile export vs. the CV vs. an explicit
  instruction in the request, don't let these blur together.
- Any sub-dimension YOE marked unverifiable from the profile/CV.
- The relocation rule applied and why.
- The board tiers included this run, and whether Indeed (Tier 3) is in scope
  for this run or held back until Tiers 1/2 are exhausted.
- The search strategy's `targetJobCount` and the two freshness windows, and
  whether any of those were user-overridden this run.

JSON condition, example shape:

```json
{
  "candidate": {
    "name": "Jane Doe",
    "targetTitle": "Technical Program Manager",
    "computedSeniority": "Mid-level",
    "totalYoe": 3.8,
    "statedTargetLevel": null,
    "yoeFloor": 2.8,
    "yoeCeiling": 3.8,
    "subDimensionYoe": {}
  },
  "titles": {
    "include": ["Technical Program Manager", "Program Manager", "TPM"],
    "excludeOffDomain": ["Product Manager", "Product Owner"],
    "excludeTooSenior": ["staff", "principal", "director", "vp", "head of", "chief"],
    "excludeTooJunior": ["junior", "entry level", "new grad", "intern", "associate"]
  },
  "geography": {
    "mode": "remote_and_current_city",
    "remote": true,
    "currentCity": {"city": "Austin", "region": "TX", "country": "US"},
    "desiredCity": null,
    "countryRestriction": "US",
    "relocationAllowed": false,
    "relocationNote": "Profile states Willing to relocate: No; scoped to remote plus current city"
  },
  "yoeRequirementRange": {"min": 2.8, "max": 3.8},
  "subDimensionYoe": {},
  "skills": {
    "keywords": ["Jira", "Agile", "Roadmapping"],
    "mode": "soft"
  },
  "salary": {"min": null, "currency": null},
  "companyPreferences": {
    "excludeAgencies": true,
    "includeCompanies": [],
    "excludeCompanies": []
  },
  "searchStrategy": {
    "targetJobCount": 140,
    "initialFreshnessDays": 7,
    "escalatedFreshnessDays": 14,
    "escalationRule": "Run at initialFreshnessDays first. If total jobs across all boards are below targetJobCount, re-run once at escalatedFreshnessDays. Stop after that second pass regardless of outcome — proceed with whatever was found once targetJobCount is met or the escalatedFreshnessDays pass completes, whichever comes first. Never escalate past this second pass."
  },
  "jobBoards": [
    {"url": "workatastartup.com", "target": "startup", "tier": 1},
    {"url": "https://startup.jobs/", "target": "startup", "tier": 1},
    {"url": "https://wellfound.com/jobs", "target": "startup", "tier": 1},
    {"url": "jobs.a16z.com", "target": "mixed", "tier": 2},
    {"url": "jobs.sequoiacap.com", "target": "mixed", "tier": 2},
    {"url": "https://builtin.com/jobs", "target": "mixed", "tier": 2},
    {"url": "https://hiringcafe.com/ai-search", "target": "mixed", "tier": 2},
    {"url": "indeed.com", "target": "general", "tier": 3}
  ],
  "notes": [
    "Profile does not state a target level; using YOE-derived Mid-level bucket.",
    "No management-track requirement expected for this title family; subDimensionYoe left empty.",
    "Tier 3 (Indeed) included for completeness; search Tiers 1 and 2 first and only fall back to it if those are thin or exhausted."
  ]
}
```

Field names and shape here are provisional and provider-agnostic, not GrokBot's
real schema (unknown as of this writing). Keep them stable across runs so a
later translation step has a consistent source to map from, rather than
reshaping the object per run.

## Rules

- Never invent a company list, a salary floor, or a location the profile/CV
  doesn't support, state the gap in `notes` instead.
- Never generate title variants freehand when the anchor matches a family in
  `candidate-job-matcher`'s Step 2 fixed table — use that table's base-noun
  set, specialization/tag containment, and disambiguation exclusion list.
  Freehand generation is only for an anchor the table genuinely doesn't
  cover, and that fallback must be stated explicitly, not silent.
- Never silently pick between a profile export and a CV when they disagree,
  say so and prefer the profile export.
- Never collapse a multi-dimensional YOE requirement (e.g. a separate
  management-years number) into a single `yoeRequirementRange`, use
  `subDimensionYoe` for anything that isn't the candidate's total YOE.
- Never call GrokBot, pull job postings, or run a pull-and-filter loop from
  this skill, that's out of scope by design; this skill only produces the
  condition. The Step 6 freshness-escalation policy is a declarative
  instruction carried inside the condition for GrokBot to execute, not a
  loop this skill runs itself.
- Never escalate the freshness window past the single `escalatedFreshnessDays`
  step (double the initial window), and never lower `targetJobCount` to make
  a thin first pass look sufficient, state the actual outcome in `notes`
  instead.
- Never override an explicit "Willing to relocate: No" with an "open to
  anywhere" location-preference line elsewhere in the profile, the relocation
  gate in Step 3 always wins for that candidate.
- Always include all three board tiers from Step 5 in the condition's
  `jobBoards` list, in tier order, don't drop or reorder them unless the user
  explicitly asked for a different set this run.
- Never run Indeed (Tier 3) ahead of or blended with Tiers 1/2, it's a
  fallback searched after the startup and mixed boards, not a peer in the same
  pass.
