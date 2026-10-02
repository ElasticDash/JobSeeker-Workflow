---
name: "cv-pass-gap-triage"
description: "Triage the Fail and Borderline checks from a cv-pass-check run: decide for each whether editing Skills or Experience can fix it, write fix specs for cv-pass-gap-fix, or hand it to a human. Ends with FIXABLE or HANDOFF."
---

# CV pass gap triage

Reads a cv-pass-check result and decides, gap by gap, whether the resume can be fixed by editing only Skills or Experience. Education is never edited. The Profile is not edited here: `cv-pass-gap-fix` regenerates it after Experience changes.

This skill only judges. It never edits the resume. It returns:
- fix specs for `cv-pass-gap-fix`, or
- a handoff package for a human.

## Settings

- `TOLERANCE_MONTHS = 6`: a years shortfall of this many months or less, raw and before rounding, is ignored. With 6 this is the same as the x.5 rule (a 3-year minimum accepts 30 months or more).
- `PARTIAL_FIX = off`: if any gap routes to Human, nothing is fixed and the whole CV goes to a human. If `on`, the fixable gaps are fixed first, then the CV is handed off with the rest.

## Inputs

1. cv-pass-check output: the check table (verdicts and Borderline causes), the YEARS table, Confirm items, and Fixes.
2. The pass list (requirement-finder output).
3. The current resume (`03_ideal_cv.md` in the pipeline).
4. The fixed frame: each role's employer, base title, dates and months, plus what the employer actually does (industry, products, stage). In the pipeline, take it from `02_cv_analysis.md` and the raw candidate material.
5. Mode: `first` or `second`. Default `first` when run alone.

If the cv-pass-check final result is PASS, say there is nothing to triage and stop.

## Scope

- Triage every HR, HM and HM-ALT check whose verdict is Fail or Borderline. For HM-ALT, only when its accept rule is not met.
- Confirm items (knockouts not visible on the CV) are not gaps. Copy them into the output and never let them block.
- Skip INT and NN items.

## Routes

Every gap gets exactly one route:

| Route | Meaning |
|---|---|
| Skills | Fixed by adding or moving an item in Skills |
| Experience | Fixed by rewriting, merging or replacing a bullet, or by a title suffix |
| Skills + Experience | A keyword that also backs a narrative HM check |
| Ignore | Years shortfall within `TOLERANCE_MONTHS` |
| Human | Cannot be fixed inside the fixed frame |

## Routing rules by check kind

| Kind | Route | Rule |
|---|---|---|
| keyword / tool | Skills | Add it, or move it up if the cause is `buried`. If a narrative HM check needs the same term, route Skills + Experience |
| narrative (most HM checks) | Experience | Cause `weak`: strengthen the existing bullet in the same role. No evidence: run the plausibility test. If no role passes, Human |
| title | Experience or Human | The base title never changes. Pass by a title suffix, or by ownership stated in bullets when the pass list allows it. Otherwise Human |
| years | Ignore or Human | Dates are fixed. Shortfall within `TOLERANCE_MONTHS`: Ignore. Otherwise Human. A years claim in the Profile never counts |
| degree, license, certification | Human | Never invented |
| knockout | not a gap | List under Confirm |

Borderline causes route like this:
- `weak`: Experience
- `buried`: Skills first, Experience if the term also needs a bullet
- `years-edge`: the years rule above

## Years shortfall

- Take counted months from the YEARS table, exactly as cv-pass-experience computed them. Do not recount.
- Shortfall = required months minus counted months.
- If the shortfall is `TOLERANCE_MONTHS` or less, route Ignore and note "within tolerance".
- Otherwise route Human, with the months and the roles counted.

## Experience plausibility test

Run for each gap routed to Experience that has no usable evidence yet. Test roles in this order:
1. roles already holding Weak evidence for the check
2. the rest, most relevant first

A role passes only if all four hold:

1. **Era:** the technology or practice existed in that time window.
2. **Employer business:** the employer's real business could contain this work.
3. **Base title and scope:** the base title can carry it. Interns get one feature or project, narrow decision rights, no people management, no "led".
4. **Time:** the role's months fit what the work needs, including time for any result to show.

- Pick the first role that passes, and record the role and the reason.
- If no role passes, route Human and list each role with the test it failed.

## Capacity check

Run after all gaps are routed, and before deciding FIXABLE:

- **Bullet cap.** The resume has at most 13 experience bullets. An Experience fix rewrites, merges or replaces an existing bullet. It adds a new bullet only when the count is under 13.
- **Protect passing evidence.** A bullet chosen for rewrite, merge or replacement must not be the only evidence cv-pass-check quoted for a check that passed. On a conflict:
  1. Try another bullet or role.
  2. If none works, route the gap Human with the reason "capacity conflict".
- **Role check.** Each target role must still pass the role check after the change: more than 3 rendered lines means it contains at least one M, H or N item.
- **Skills length.** Skills stay at 2 or 3 lines. If an addition overflows, the spec names an item to drop that backs no check.
- **Order.** When fixes compete for space, give priority by weight: skills, then experience, then title.

## Decision

**Mode `first`:**
- Every gap routed Skills, Experience, Skills + Experience or Ignore: **FIXABLE**.
- Any gap routed Human: **HANDOFF** (see `PARTIAL_FIX`).

**Mode `second`:**
- Always **HANDOFF**.
- Still fill every route and write fix specs, labelled "suggested, not applied", so the human can decide quickly.

## Output

1. **Triage table:** ID | Check | Verdict (cause) | Kind | Route | Reason
2. **Fix specs.** One block per gap routed Skills or Experience:
   - Check ID
   - Section: Skills or Experience
   - Target: the Skills line, or the role (employer, dates) plus the bullet to rewrite, merge or replace, quoted, or "new bullet"
   - Must show: what passes, from the pass list
   - Substance: the kind of work this employer, base title and time window could plausibly have had. Describe the substance, not the wording.
   - Constraints: the other check IDs this bullet or role must keep proving, intern scope, JD phrases to avoid, opening verbs already used
   - Needs confirmation: yes for any new claim, no for moving existing text
3. **Capacity:** bullet count before and after, and any conflicts found.
4. **Handoff package** (HANDOFF only):
   - Stage and mode
   - The current resume version, by file name
   - Open gaps: why each cannot be fixed, or "second check: goes to a human by rule"
   - What was tried: earlier fix specs and check results, if any
   - Questions for the candidate: evidence he may have but did not write down, named precisely
   - Confirm items (knockouts) and the risk each carries
5. **Last line**, bold: `Triage result: FIXABLE` or `Triage result: HANDOFF`

## Rules

- Be strict and consistent: the same gap gets the same route every time.
- Quote the CV. Never paraphrase it into something stronger.
- Fix specs describe plausible work; they never claim the candidate did it. Every new claim is marked for confirmation.
- Output in English.
- No em dashes.
- Give the assessment only. Do not offer outreach emails, LinkedIn messages or other client copy.
