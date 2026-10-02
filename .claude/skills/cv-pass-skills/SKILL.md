---
name: "cv-pass-skills"
description: "Check the Skills section of a CV against a pass list's keyword and tool checks. Run by cv-pass-check, or alone when asked to check just a CV's Skills section."
---

# CV pass: Skills section

**Scope:** the Skills section, plus a separate Tools or Technical line if the CV has one. Do not read other sections for evidence.

## Before you start

You need two things from `cv-pass-check`:
- the check register (its Step 1)
- its evidence strength definitions

If the register is not already in the conversation, load `cv-pass-check` and do only its Step 1.

## Rules

1. **Keyword checks.** Check exact presence for every keyword check.
   - Accept a variant only when the pass list names it (e.g. "stage-gate" for Phase Gate).
   - A vendor name alone does not count for a named tool (e.g. "Atlassian" does not count for Jira).
   - A found keyword is Strong. A missing one is None.
2. **Skills-only claims.** Some keywords are also needed by a narrative HM check (e.g. Phase Gate). For each such keyword, add an OPEN line: "needs backing in Experience". A Skills listing never passes a narrative check on its own.
3. **Buried keywords.** If a required keyword is present but buried at the end of a long list, add a fix to move it up.
4. **RANK items.** Record any RANK items listed here, e.g. PMP or CSM certifications.
5. **NN items.** Never penalise them. Mention them only if they crowd out required keywords.

## Output

Return the evidence block exactly as defined in `cv-pass-check`.

When run alone, also add a two-line summary:
- the HR keyword checks met in this section
- the HR keyword checks still missing

Give no overall verdict.

No em dashes.