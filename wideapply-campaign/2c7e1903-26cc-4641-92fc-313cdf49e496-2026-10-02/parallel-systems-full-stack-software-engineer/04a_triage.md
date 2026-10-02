# Gap Triage: Stage 6A (mode: second)

Mode `second` always ends in HANDOFF, regardless of individual routes, per pipeline rule: no automatic fix happens after the second check even when a gap would otherwise route as fixable or as "not a gap."

## Triage table (second check, after the one permitted fix round)

| ID | Check | Verdict (cause) | Kind | Route | Reason |
|---|---|---|---|---|---|
| HR-2 | Location: based in/around LA or willing to relocate | Fail (unchanged across both checks) | knockout | Not a gap, listed under Confirm (route unchanged) | Still a fixed fact outside resume content: the candidate's application material states she is not willing to relocate, the role is onsite only in Los Angeles, and she is based in Boston, MA. No Skills or Experience edit changes a stated relocation preference |
| HR-7 | Overqualification | Borderline (years-edge), unchanged | years / seniority framing | Ignore (route unchanged, suggested not applied) | Same reasoning as the first triage: fixed dates (~4 computed years) and fixed MS CS education cannot be edited; the JD's own language de-emphasizes years; editing the bullet carrying Strong HM-3 evidence to sound less senior would risk a capacity conflict |
| HM-4 | Collaboration with non-software stakeholders | Pass (resolved in the one fix round) | narrative | Already fixed, no further route needed | Resolved at stage 4A: the Codametrix bullet was rewritten to show concrete translation of stakeholder input into system/interface decisions, and the rerun scored this Pass |

Only HR-2 remains open. HR-7 is an accepted residual risk, not an open gap requiring further action. HM-4 is closed.

## Fix specs (suggested, not applied)

No fix spec is offered for HR-2: it has no Skills or Experience lever by definition (knockout kind, a fixed fact about the candidate's own stated preference). The only "fix" available is outside the resume: the candidate either confirms willingness to relocate to Los Angeles (updating her application answer, not the CV) or the application is not submitted for this specific onsite role.

No fix spec is offered for HR-7 beyond what stage 4A already concluded (Ignore, accepted residual risk); re-opening it risks weakening HM-3's passing evidence for no clear gain, since the underlying years and degree cannot change.

## Capacity

- Bullet count: 13 of 13 (unchanged from the stage 4A fix; no further edits made in this mode-second pass).
- No new conflicts: no further edits were attempted.

## Handoff package

**Stage and mode:** Stage 6A, triage mode `second`, following one completed fix round at stage 4A (AUTO_FIX_ROUNDS = 1 exhausted).

**Current resume version:** `03_ideal_cv.md` (the version with the HM-4 fix applied; the pre-fix version is preserved at `03_ideal_cv_v1.md`).

**Open gaps:**
- HR-2 (location/relocation): cannot be fixed inside the fixed frame. The candidate's own application-question answer ("Willing to relocate? No") conflicts with this role's onsite-only Los Angeles requirement, and she is based in Boston, MA with no metro-area overlap. Per the ideal-candidate skill's own header-location rule, this is correctly treated as a hard gap (Gap rule 3: fixed fact outside experience), not something resume wording can resolve. Per triage mode `second`, this and the run end in HANDOFF by rule even though the specific route (knockout, not a gap) would not independently force a human the way a Human-routed Experience or Skills gap would.

**What was tried:**
- Stage 4 (first check): FAIL on HR-2 (Fail), HR-7 (Borderline, years-edge), HM-4 (Borderline, weak).
- Stage 4A triage (mode first): HR-2 routed "not a gap" (Confirm only); HR-7 routed Ignore (accepted residual risk); HM-4 routed Experience (weak cause). Decision: FIXABLE.
- Stage 4A fix: rewrote the Codametrix stakeholder-collaboration bullet to show concrete translation of ambiguous clinical/operational input into system/interface decisions (extraction schema, API responses). Logged as a new claim needing candidate confirmation in `05_confirmation.md`.
- Stage 4A rerun (second cv-pass-check): HM-4 now Pass. HR-2 still Fail, HR-7 still Borderline (unchanged, as expected since nothing targeted it). Final result: FAIL, on HR-2 alone.

**Questions for the candidate:**
- Is she in fact willing to relocate to Los Angeles for this specific role? If yes, her WideApply application answer ("Willing to relocate? No") needs to be updated before or alongside submission, and the resume header could then take the "(able to relocate)" note per the standard rule.
- If she is not willing to relocate, does she still want this specific application submitted (accepting the location-knockout risk), or should it be withdrawn from this run?

**Confirm items (knockouts) and their risk:**
- HR-1, work authorization: low risk. Not visible on the CV by design; her own material states US citizen, no sponsorship needed.
- HR-2, location/relocation: high risk, the reason for this handoff. A stated "no" on relocation for an onsite-only role in a different metro area is the kind of answer an ATS knockout question is built to catch; this is very likely to end the application at the form stage regardless of resume quality.

**Triage result: HANDOFF**
