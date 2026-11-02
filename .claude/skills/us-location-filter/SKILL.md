---
name: us-location-filter
description: "Shared post-receipt US-only screen for job results from any source (Hirebase, TheirStack, Apify/Wellfound, fetch-ats-jobs, GrokBot/markdown). Classifies each job usStatus us/non-us/unknown from its own location fields (structured country wins over free text); non-US are dropped, unknown need a JD-level US-eligibility check. Use after any job pull, before counting toward N."
---

# us-location-filter

US-only is enforced after jobs are received, never trusted to a provider's own geo filter.

```
node .claude/skills/us-location-filter/us-location-filter.mjs <jobs.json> [--out <dir>] [--keep-non-us]
```

Input: an array, or an object with `jobs[]`/`data[]`. Output: `us_kept.json` (us + unknown, each with `usStatus`) and `non_us_dropped.json`. Library: `classifyJob(job)`, `classifyUsLocation(...texts)`.

- `us`: keep. `non-us`: drop, never counts toward N. `unknown` ("Remote", "Hybrid", "2 Locations"): read the JD's work locations; drop unless a US location or explicit US-remote eligibility is stated.
- A job with any US location counts as US. Structured country fields win over free text ("Vancouver, CA" with country CA is Canada).
- Override only on an explicit user ask for a non-US search for that run.
