---
name: "cv-pass-gap-fix"
description: "Apply the fix specs from cv-pass-gap-triage to a resume: edit only Skills and Experience under the ideal-candidate hard limits, log every new claim for confirmation, regenerate the Profile, and hand back for a cv-pass-check rerun."
---

# CV pass gap fix

Applies the fix specs that `cv-pass-gap-triage` returned with **FIXABLE**. It writes the actual wording. It does not decide what is fixable, and it never fixes a gap the triage routed to Human.

## Inputs

1. The triage output: the triage table, the fix specs and the capacity notes.
2. The current resume (`03_ideal_cv.md` in the pipeline).
3. The JD text, for the copy scan.
4. The fixed frame (employer, base title, dates, what the employer does), from `02_cv_analysis.md` and the raw candidate material.
5. The confirmation list (`05_confirmation.md` in the pipeline).

If the triage result is not FIXABLE, stop and say so. If a fix spec is missing a target or the "must show" line, stop and send it back to triage rather than guessing.

## What can change

| Element | Rule |
|---|---|
| Employer, dates, base title, education | Never change |
| Title suffix or parenthetical | May be added when a fix spec says so |
| Experience bullets | Rewrite, merge or replace as the spec says. Add a bullet only when the spec says "new bullet" |
| Skills | Add, move or drop items as the spec says |
| Profile | Regenerated at the end (step 5), never patched line by line |
| Anything no spec touches | Leave word for word |

## Steps

### 1. Save the current version

Before any edit, copy the current resume to the next version file (`03_ideal_cv_vN.md` in the pipeline). Every run of this skill starts from a saved copy.

### 2. Apply Skills fixes

- Add each required term exactly as the pass list spells it for proper names (tools, platforms, standards). Name practices in the candidate's own words.
- For a `buried` cause, move the term into the first half of its line.
- Keep Skills at 2 or 3 lines. If a line overflows, drop the item the spec names.
- Keep 2 or 3 real items from the candidate's material that the JD did not ask for.
- A Skills entry never stands in for a narrative check. If the spec also routes the same check to Experience, do both.

### 3. Apply Experience fixes

Apply the specs one role at a time, in the triage's priority order.

For each bullet written or changed:

1. **Substance from the spec.** Write the work the spec describes, as someone who did it would describe it: concrete systems, the teams involved, what the candidate owned and who owned the rest.
2. **Keep what it already proved.** A bullet listed under the spec's constraints must keep proving those check IDs after the edit. Reread it against each one.
3. **Candidate's own words.** No run of 3 or more consecutive words copied from the JD, except proper names and runs of plain function words.
4. **Verbs.** No opening verb repeated anywhere in the Experience section. Internships use weaker verbs (managed, proposed, tested, supported), never "led".
5. **Credibility pass,** on that bullet:
   - Timeline: the role's months fit the work and any result.
   - Numbers: sparse, modest and sized to the role. Do not add a number just to look complete.
   - Title vs content: if the base title differs from the target title, say what was owned.
   - Intern scope: one feature or project, narrow decision rights.
   - Domain: name the risk that actually matters in that setup.
6. **Shape.** Do not force every new bullet into problem, action and result. A flat, task-only bullet is fine and often reads more real.

After each role is edited, run the **role check**: if its description runs past 3 rendered lines (a bullet starts a new line and wraps at about 100 characters), it must contain at least one M, H or N item. If it fails, fix that role before moving on.

### 4. Whole-section checks

- Experience bullets total 13 or fewer.
- No repeated opening verbs across the section.
- Roles ordered most recent first.
- Fixed fields untouched: compare employers, dates, base titles and education against the saved version.
- Only one honest limit on the whole page. If a fix added a second caveat about the candidate's own impact, cut it.
- **Copy scan** over the whole page. Save the JD and the resume as text files, then run:

```
python3 - jd.txt cv.txt <<'PY'
import re, sys
w = lambda p: re.findall(r"[a-z0-9+#./-]+", open(p).read().lower())
jd, cv = w(sys.argv[1]), w(sys.argv[2])
g = {tuple(jd[i:i+3]) for i in range(len(jd) - 2)}
hits = sorted({" ".join(cv[i:i+3]) for i in range(len(cv) - 2) if tuple(cv[i:i+3]) in g})
print("\n".join(hits) or "no 3-word overlaps")
PY
```

Rewrite every hit except proper names and plain function-word runs.

### 5. Regenerate the Profile

Rewrite the Profile from the finished Experience, in this structure:

"[soft skill] [title] with [N] years of experience in [focus area]. Highly experienced in [past fields covered]. Passionate about [a larger personal goal]. [traits important for the target role] who can [short description of capability]."

- N is a plain whole number from the fixed dates: total months divided by 12, rounded to the nearest whole year, halves up. No "nearly" or "over".
- If the years span several functions, say so ("across engineering, program and product roles"), so it does not imply every year was in the target title.
- No metrics or achievement numbers.
- No tired resume words such as "detail-oriented" or "results-driven". If the JD asks for attention to detail, use a fresher phrase like "a sharp eye for detail".
- Nothing in the Profile may claim more than the Experience now shows.
- Run the copy scan on the Profile too.

### 6. Update the confirmation list

For every new or changed claim, add a line to "Needs candidate confirmation":
- the claim, quoted
- the check ID it serves
- what to ask the candidate

Order the list with the most interview-exposed claims first. Moving existing text needs no confirmation line. Any number carried over from the source CV that now sits in a different context gets a line too.

### 7. Save

Save the result as the new current resume (`03_ideal_cv.md` in the pipeline).

## Output

1. The fix log: Check ID | Section | Before (quoted, or "none") | After (quoted)
2. Bullet count before and after, and the copy scan result
3. The new confirmation lines
4. Last line, bold: `Fix applied: rerun cv-pass-check`

This skill does not humanize. In the pipeline, stage 5 humanizes the whole page after the first check. When run alone, say that the changed bullets have not been through humanizer-us-resume.

## Rules

- Apply only what the specs say. Do not fix things the triage did not list.
- Never invent education, certifications, dates, employers or base titles.
- Output in English, US spelling for US roles.
- No em dashes.
- Give the deliverable only. Do not offer outreach emails, LinkedIn messages or other client copy.
