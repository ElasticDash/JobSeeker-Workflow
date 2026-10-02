---
name: "cv-pass-experience"
description: "Check a CV's employment history against a pass list: years by type, titles, and hiring manager evidence per check. Run by cv-pass-check, or alone when asked to check just the experience."
---

# CV pass: Experience section

**Scope:** employment history only (titles, employers, dates, bullets). Do not read other sections for evidence.

## Before you start

You need two things from `cv-pass-check`:
- the check register (its Step 1)
- its evidence strength definitions

If the register is not already in the conversation, load `cv-pass-check` and do only its Step 1.

## Years

- Compute every years check from the dates, to the month.
- If a month is missing, assume the conservative end.
- Against a minimum, x.5 years counts as x+1.
- Keep years separate by type where the pass list distinguishes them, e.g. engineering years vs TPM or program years.
  - A role counts toward a type only through its title, or through bullets that clearly show that work.
  - Count a role toward more than one type only if the pass list allows overlap.
- Return this table:

| Role | Employer | Dates | Months | Counts toward |

Then give the total per type, the rounded total, and the minimum it is compared against.

## Titles

For title checks, quote the matching title. If the pass list allows ownership shown in bullets instead of a title, quote the bullet and mark it Weak unless the ownership is explicit.

## Narrative checks

1. For each narrative HM and HM-ALT check, give the best one or two bullets and their strength.
2. Test the specific trap the pass list names, for example:
   - real gated hardware development vs software sprints labelled phase gate
   - a concrete risk and its mitigation vs a line like "managed risks"
   - several disciplines coordinated on one product vs a single software team
3. If nothing qualifies, mark it None and say what kind of bullet would pass.
4. Check every narrative check, including any that `cv-pass-skills` flagged as Skills-only.

## Seniority vs band

If the pass list gives a pay cap or a years band, compare total relevant years to the top of the band. Put any risk of being filtered out on salary in the Note column of the relevant HR row.

## Other

- Record RANK evidence, e.g. robotics or autonomy, sustainment after launch, external partner programs.
- Roles must run most recent first. If they don't, add a fix.
- For a fix that needs evidence the candidate may have but didn't write down, say what to ask them. Never invent it.

## Output

Return the evidence block exactly as defined in `cv-pass-check`, plus the YEARS table.

When run alone, add a short summary:
- which HM checks this section supports Strong, Weak or not at all
- whether each years minimum is met

Give no overall verdict.

No em dashes.