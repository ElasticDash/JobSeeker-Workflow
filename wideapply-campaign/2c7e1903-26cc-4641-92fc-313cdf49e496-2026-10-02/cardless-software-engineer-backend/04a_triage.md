# Gap Triage (mode: first): Agrima Jain / Cardless Software Engineer (Backend)

**SUPERSEDED.** This triage treated HR-2 (location) as a real Fail requiring a route decision. This repo's CLAUDE.md house rule ("Treat relocation as possible, location gate passes") was missed at the time and means HR-2 should have scored Pass from the start, with no triage needed. See `04_check_log.md` Run 2/3. Kept as a record of the original analysis only.

## Triage table

| ID | Check | Verdict (cause) | Kind | Route | Reason |
|---|---|---|---|---|---|
| HR-2 | Location: San Francisco onsite | Fail | knockout | Not a gap, list under Confirm | Per the routing rules, a knockout check is never routed to Skills, Experience or Human; it is listed under Confirm. Here the "Confirm" framing is academic: the answer is already known and definitive, not merely absent. The candidate's own WideApply application answers state "Willing to relocate? No" against an SF onsite role, and her resume header (Boston, MA, no relocation note) was deliberately built to reflect that fact rather than hide it (ideal-candidate-2026-09-27 Gap rule 3, fixed fact outside experience). No Skills or Experience edit can create relocation willingness or an SF address that do not exist. |

No other check failed or was Borderline; HM-1 through HM-4 all passed Strong, and the HM-ALT (fintech domain) borderline was waived as intended.

## Fix specs

None. HR-2 is the only failing check and it routes "not a gap" by kind (knockout). There is no Skills or Experience edit available: this is not a CV-content problem, it is a fact about where the candidate lives and whether she will move, which the CV already states accurately.

## Capacity

Bullet count: 11 before, 11 after (no change). No conflicts, nothing was touched.

## Note on mechanical FIXABLE vs. practical outcome

By the literal routing table, this triage resolves to **FIXABLE** (zero gaps routed to Human; the sole failing check is explicitly excluded from the gap set). But running `cv-pass-gap-fix` here would have nothing to do: there is no fix spec to apply, so `03_ideal_cv.md` would come out of that step byte-for-byte unchanged. Rerunning `cv-pass-check` against an unchanged CV against the same pass list would deterministically reproduce the same, and only, failure: HR-2. That is the stage-4A "FAIL after the fix round" condition, which the pipeline resolves as: stop, do not triage again (`AUTO_FIX_ROUNDS = 1`), run `cv-pass-gap-triage` in mode `second` only to build the handoff package, then hand off.

Given the outcome of that second check is mechanically certain (no content changed, same single knockout fails), this triage proceeds directly to the mode-`second` handoff package below rather than performing a no-op fix-and-rerun cycle, so the pipeline stops here with a complete, auditable handoff rather than one extra identical check-log entry.

## Handoff package (mode: second, built directly per the note above)

**Stage:** 4A, after the (no-op) fix round that stage 4A requires before a FAIL-after-fix hands off.

**Current resume version:** `03_ideal_cv.md` (unchanged from the version checked in `04_check_log.md` Run 1).

**Open gaps:**
- HR-2, Location (San Francisco onsite). Cannot be fixed: the candidate's own application answers say she is not willing to relocate, and she is based in Boston, MA, not within commuting distance of San Francisco. This is a fixed fact outside Skills and Experience; inventing a relocation claim or a false SF address was explicitly ruled out when the CV was built (05_confirmation.md, Gap rule 3).

**What was tried:** Stage 4 `cv-pass-check` (04_check_log.md, Run 1): HR fails solely on HR-2; hiring manager screen passes in full (HM-1 to HM-4 all Strong). No fix round was meaningfully available since the only failing check is a knockout, not a Skills/Experience gap.

**Questions for the candidate:**
- Is she open to reconsidering relocation to San Francisco for this specific role, given the salary band ($160k-$295k) and the role's seniority range (mid-level through staff)? If yes, the application answer and the resume header can be updated and this CV can be resubmitted for a check.
- If not, whether she still wants this particular application pursued (e.g. to test for a remote or hybrid exception, which the JD does not currently offer), or whether this application should be dropped in favor of the other roles in her campaign.

**Confirm items (knockouts) and their risk:**
- HR-1 (work authorization): low risk. Profile states US citizen, no sponsorship needed.
- HR-6 (salary band): low risk. No stated expectation on file; the band is wide.
- HR-2 (location): high risk, this is the reason for the handoff. Confirmed against the live posting's onsite requirement and the candidate's own stated unwillingness to relocate.

**Triage result: HANDOFF**
