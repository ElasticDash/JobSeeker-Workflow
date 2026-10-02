---
name: "cv-pass-rest"
description: "Check a CV's profile summary, education, certifications and header against a pass list, including knockouts. Run by cv-pass-check, or alone when asked to check just those parts."
---

# CV pass: Profile, education and the rest

**Scope:** everything outside Skills and employment history:
- the header (name, location, contact line)
- the profile summary
- education
- certifications
- any other short sections, e.g. languages or clearances

Do not read Skills or Experience for evidence. The one exception is to compare Profile claims with the dates, and in full mode `cv-pass-check` does that step.

## Before you start

You need two things from `cv-pass-check`:
- the check register (its Step 1)
- its evidence strength definitions

If the register is not already in the conversation, load `cv-pass-check` and do only its Step 1.

## Profile summary

1. **Title and years.** Quote the title and years it states.
   - When run alone, compare them with the Experience dates yourself.
   - In full mode, add an OPEN line so `cv-pass-check` compares them against the YEARS table.
   - The Profile must never claim more years than the dates support.
   - It must not imply that all the years were in the target title when some were in another function.
2. **Pitch.** Check that it is pitched at the band. A Profile that reads far more senior than the role raises salary-filter risk, so add a fix.
3. **Keywords.** Record the keyword checks it carries, as keyword evidence only.
4. **Not proof.** It is never proof of a narrative HM check. At most, note it as supporting.
5. **Format.** Check the Profile against the house format:
   - a plain whole number of years, with no hedges like "nearly"
   - no metrics
   - no overused terms such as "detail-oriented"
   Add a fix for anything that breaks it.

## Education

- Compare each degree's field with the degree check, and quote the degree line.
  - A related field that the pass list does not name is Weak.
  - An unrelated field is None.
- Every entry needs dates, written as a range with an en dash. Add a fix for any missing.
- A degree above the required level is NN. It is neutral: never extra credit for a required check.

## Certifications

Record each one's value, if any, as keyword evidence or RANK evidence. Certifications the pass list calls ranking-only are never credited toward a required check.

## Header and knockouts

- **Location.** Relocation is always treated as possible, so the location gate passes. The exception is when the CV says the candidate won't move.
- **Travel, work authorization, salary.** Quote anything the CV states.
- **Not visible.** A knockout not visible on the CV goes on an OPEN line: "Confirm with candidate". It is never a Fail.
- **Pass-list warnings.** Carry over any warning tied to a knockout. For example, international travel may be hard for someone who cannot leave the country easily.

## RANK

Record any RANK evidence found in these sections.

## Output

Return the evidence block exactly as defined in `cv-pass-check`.

When run alone, add a short summary:
- whether the degree check is met
- the knockouts to confirm
- any Profile problems

Give no overall verdict.

No em dashes.