---
name: "cv-pass-check"
description: "Check a whole CV against an HR and hiring manager pass list: builds the check register, runs the section checkers, and gives HR, hiring manager and overall verdicts with fixes."
---

# CV pass check (orchestrator)

This skill owns the shared rules:
- the check register
- evidence strength
- the evidence block format
- verdicts and weighting
- the final result

Section rules live in their own skills:
- `cv-pass-skills`: the Skills section
- `cv-pass-experience`: employment history
- `cv-pass-rest`: profile summary, education, certifications, the header and knockouts

To change how a section is read, edit that section's skill. To change how checks are parsed or judged, edit this one. If a section skill is replaced by a new version, update its name in the list above and in Step 2.

A FAIL from this skill feeds `cv-pass-gap-triage`, which decides what can be fixed.

## Input

- A pass list with HR checks and hiring manager checks. It usually also has notes on borderline checks, interview-only traits, things not needed, and ranking among passes. It often comes from `requirement-finder`.
- A CV, pasted or attached. For .docx or .pdf, extract the text first.

If the user asks about one section only, do Step 1, run only that section's skill, and stop. Do not do Step 3.

## Step 1. Build the check register

Parse the pass list into rows before reading the CV:

| ID | Check | What passes | Kind | Provable in |

IDs:
- HR-1, HR-2, ...
- HM-1, HM-2, ...
- HM-ALT: an either/or or "likely extra" check. Record its accept rule, e.g. "one of two".
- INT: tested in interview only. Not scored.
- NN: not needed. Never counts against the CV.
- RANK-1, RANK-2, ...: ordered tie-breakers among passing CVs.

Kinds, and where each can be proven:
- keyword: any section, since the ATS reads the whole document
- years: Experience dates only. A years claim in the Profile is not evidence.
- title: Experience job titles. Clear ownership stated in bullets also counts, but only if the pass list allows it.
- degree: Education
- narrative (most HM checks): Experience bullets. A mention in Skills or the Profile is supporting at most.
- knockout (location, travel, work authorization, salary): the header, the Profile, or nowhere

Carry over any warnings the pass list gives, e.g. a salary cap that filters senior candidates, or international travel.

## Evidence strength (used by every section skill)

- Strong: specific and concrete. A named product, a program, the mix of teams involved, or an outcome a hiring manager would believe.
- Weak: generic, a keyword echo, or a claim with no example.
- None.

## Evidence block (the contract with the section skills)

Every section skill returns exactly this:

```
SECTION: <skills | experience | rest>
| ID | Evidence (short CV quote) | Strength | Note |
OPEN: <ID>: <what is missing>, may be settled by <section>
FIXES: <section-specific fixes, most important first>
```

`cv-pass-experience` also returns a YEARS table.

If you change this format, change all three section skills in the same edit.

## Step 2. Run the sections

Load each section skill with the Skill tool, in this order:
1. `cv-pass-skills`
2. `cv-pass-experience`
3. `cv-pass-rest`

Give each one the register and the CV, and collect the three evidence blocks. If the CV has no such section, record that section's rows as None and note it.

## Step 3. Combine

Cross-section rules:
- A keyword found in any block satisfies an HR keyword check.
- A narrative HM check passes only on Experience evidence. Skills or Profile mentions alone make it Borderline at most.
- Years come from the YEARS table only.
- Resolve each Skills-only claim flagged by `cv-pass-skills` against the experience block. If there is no backing there, the matching HM check is Borderline or Fail.
- A Profile claim that goes beyond the YEARS table is a fix.

Give each check one verdict:
- **Pass:** meets "what passes". Narrative checks need at least one Strong item. Keyword, years, degree and title checks need exact evidence.
- **Borderline:** tag every Borderline with exactly one cause:
  - `weak`: only Weak evidence
  - `years-edge`: years exactly at the edge of the rounding rule
  - `buried`: evidence exists but a reader would have to dig for it
- **Fail:** no evidence, or the evidence contradicts the check.
- **Confirm:** a knockout not visible on the CV.

Apply each HM-ALT accept rule.

Use this weighting for close calls and when ordering fixes:
1. Skills. A missing core skill or tool can fail the CV outright.
2. Experience.
3. Profile and title.
4. Education, even when the pass list names a degree.

Screen outcomes:
- **HR:**
  - Pass if every HR check is Pass.
  - Borderline if any check is Borderline and none is Fail.
  - Fail if any check is Fail.
  - List Confirm items separately, with the risk each one carries.
- **Hiring manager:** the same rules over the HM checks plus HM-ALT. Report this even when HR fails, and say the CV would not reach the hiring manager.
- **Overall:** one of "Passes both", "Borderline", "Passes HR, fails HM", or "Fails HR". Borderline here means no Fail anywhere but at least one Borderline.
- **Ranking:** if both screens pass, list the RANK items met in pass-list order and give a tier.

## Step 4. Final result

Resolve the outcome into one binary result:

- **PASS:** HR is Pass and hiring manager is Pass.
- **FAIL:** anything else. A Borderline screen counts as Fail for the final result.
- Confirm items never decide the result. They are listed for the candidate.

## Output

1. A one-line verdict: HR outcome, hiring manager outcome, overall.
2. A check table: ID | Check | Verdict (Borderline cause) | Evidence (short quote, section) | Why
3. The YEARS table from `cv-pass-experience`, when any years check exists.
4. Confirm with the candidate: the knockouts and the risk each carries.
5. Fixes, ordered by what flips a Fail or Borderline to Pass, highest weight first.
   - Each fix names the section and what to change.
   - Where the candidate may have evidence they didn't write down, say what to ask them. Never invent it.
6. Ranking among passes, only if both screens pass.
7. **The final result, always the last line**, bold: `Final result: PASS` or `Final result: FAIL`. On FAIL, name the checks that caused it after a colon, e.g. `Final result: FAIL: HR-1 (Borderline, years-edge)`.

## Rules

- Be strict and consistent: the same evidence gets the same verdict every time.
- Quote the CV. Don't paraphrase it into something stronger.
- Don't score interview-only traits.
- Never count NN items against the CV. Never credit them as meeting a required check.
- No em dashes in the output.
- Give the assessment only. Don't offer outreach emails, LinkedIn messages or other client copy.