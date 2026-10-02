---
name: "requirement-finder"
description: "From one job description, find the pass/fail list a recruiter screens on and the pass/fail list the hiring manager screens on, plus what only ranks. Triggers: HR 筛选标准, 用人经理看什么, pass list."
---

# Requirement Finder

Screens do not score CVs. They run pass/fail checks at two gates:

1. **HR gate**: application-form knockouts, then a recruiter skim.
2. **Hiring manager gate**: a short list of "has this person actually done the work" checks.

A candidate who passes both gates is worth interviewing. Nothing else gates. Everything else in the JD only ranks candidates who have already passed.

Use this skill instead of jd-evaluator when the user wants to know what a candidate must show to get through screening, or asks for the HR list and the hiring manager list. Use jd-evaluator when they want the full six-dimension checklist.

## How screening actually works (the rules below rest on this)

- **ATS software rarely rejects on CV content.** Automatic rejection happens almost only through knockout questions on the application form (work authorization, location, licenses, minimum education or years). So a knockout is answered in the form, not proven by the CV.
- **The recruiter skim takes seconds and reads titles first**, then company names, dates and education. Years of experience and type of experience are the top factors in a recruiter's first review. Every skim check must be visible in a title, a company, a date range, the degree line, or a keyword used in context.
- **Recruiters usually get 3 or 4 must-haves and the deal-breakers from the hiring manager in an intake call.** The requirement that makes this role different from a generic version of its title often reaches the skim as a keyword or title check, even when the recruiter has no domain knowledge.
- **A listed degree still filters**, even at companies that say they dropped degree requirements. Treat a listed degree as an HR check. The hiring manager rarely cares.
- **The hiring manager reads for proof of similar work at the right level**, not keyword match. Their checks need a named project or role, not a Skills-list entry.
- **Preferred qualifications screen in, not out.** On low-volume roles, interview slots tend to go to candidates who pass and also meet preferred items, so the ranking list decides who among the passes gets a slot.
- **Overqualification is a real HR filter** when the JD caps years or the pay band is narrow: recruiters screen out candidates whose level or salary expectation sits above the band.

## Input

- Raw JD text, job-board copy-paste, or a careers-page link (fetch it with WebFetch).
- Strip job-board noise: match widgets, applicant counts, Save / Apply buttons, extension names, trailing "... more".
- Pasted JDs often drop the posting boilerplate and the application questions. When a link is given, look for the application questions on the live posting. When only text is given and the company is in a regulated field (aerospace, defense, space, semiconductors, government contracting, healthcare, finance), flag the likely extra knockout and say to confirm it on the live posting.

## Step 1: Read for signals

Before listing anything, note:

- **Section labels.** "Required / minimum / must" feeds the HR gate. "Preferred / bonus / things that make a difference / a plus" is ranking only.
- **The distinguishing requirement.** What separates this role from a generic version of the title (for example, a "Software" TPM at a hardware company who must have worked at the software/hardware interface). This drives the first hiring manager check and usually one skim keyword.
- **Core responsibility verbs.** The three or four things the person will own. These become hiring manager checks.
- **Level signals.** Years range, especially an upper bound; pay band width; reporting line; people management or IC.
- **Logistics.** Onsite location, travel percentage, domestic or international travel, evenings or weekends, physical requirements.
- **Regulated context.** Export control, clearances, licenses, certifications "as appropriate".

## Step 2: HR pass list

Table: `# | Check | Where | What passes`

`Where` is **Form** (application-form knockout, answered by the candidate) or **Skim** (recruiter reads it off the CV in seconds).

Form checks (include each one the JD or its industry supports):
- Work authorization and sponsorship
- Location: onsite city, or willing to relocate
- Travel percentage and whether it is international
- Evenings, weekends, physical requirements when listed
- Export control or clearance status when the field is regulated (mark "confirm on live posting" if not in the text)
- Salary expectation within the band

Skim checks (5 to 7 total, each checkable in under a minute without domain knowledge):
- **Degree**: level and accepted fields, as listed
- **Years in titled roles**: each years requirement becomes "N+ years in roles titled X, Y or Z". Name the acceptable titles
- **Required tools**: name the ones from the required section; say which single tool is the minimum
- **Required methods or keywords**: only those listed as required, as they would appear in a CV (e.g. "Agile" and "Phase Gate / stage-gate")
- **Distinguishing requirement as a keyword**: the one or two words a recruiter was likely told to look for, traceable to the JD
- **Overqualification**: add only when the JD caps years or the pay band is narrow. State the band and the kind of candidate likely filtered out

After the table, at most two short notes on anything easy to miss (a knockout hidden in logistics, a degree HR will check literally, a band that makes the upper years bound real).

## Step 3: Hiring manager pass list

Table: `# | Check | What passes`

- 3 to 5 checks. Fewer is better. If everything is a must-have, nothing is.
- The first check is the distinguishing requirement.
- The rest come from core responsibilities and the level of ownership the JD describes.
- Each "What passes" names project-level evidence: what the candidate did, with whom, to what outcome. A Skills-list mention never passes.
- Never include preferred items, degree, certifications, or soft skills a CV cannot prove.

Then, when one exists, one line: **Likely fifth (borderline)**: a check most managers will waive if the others are strong, or accept one of two alternatives. Say which.

Then one line on soft skills from the required section: they sit on neither list because a CV cannot prove them; they are tested in interview.

## Step 4: Not needed to pass either list

One line listing preferred items, advanced degrees, certifications, and industry experience marked preferred.

## Step 5: Ranking among passes

One short paragraph. Order the preferred items by closeness to the company's core business, first item first. If a preferred item is the company's core business, say it ranks first. Add responsibility items that did not make the pass list but still separate candidates (e.g. sustainment, external partners). Note where a certification helps at the skim but carries little weight with the manager.

## House rules

- **Relocation always passes the location check.** Write the location knockout as "based in X or willing to relocate".
- **x.5 years counts as x+1** against a minimum years requirement. State the effective threshold (e.g. "3+ years (2.5 is fine)").
- **Stay inside the JD.** Every check traces to a JD line, the posting's application questions, or a regulated-field knockout flagged for confirmation. Do not invent requirements.
- **Output in English**, whatever language the user or JD uses. Keep company, product and technical terms as written.
- **Never use em dashes.**
- **No preamble and no recap.** Open with one sentence on what makes this role different from a generic version of its title, then the lists.
- **Give the assessment only.** Do not offer to write outreach emails, LinkedIn messages or client-facing copy.

## Follow-up: checking a CV against the lists

If the user supplies a CV:

1. HR list: for each Skim check, quote the CV line that passes it or write "not found". List Form checks as "answer on application" unless the CV shows a problem (e.g. based abroad with no relocation signal is still a pass under the house rule; a clear visa conflict is not).
2. Hiring manager list: for each check, quote the project-level evidence or write "not found". A Skills-list mention is "not found".
3. Verdict: **Interview-worthy** only if every HR check and every hiring manager check passes (the borderline item may be missing). Otherwise **Not yet**, naming the failed checks, HR ones first.
4. If interview-worthy, one line on where the candidate sits in the ranking from Step 5.

## Example (Technical Program Manager II, robotics company)

Opening line: A coordination-focused TPM for hardware/software robot programs, more junior than the title suggests (2 to 4 years, narrow band).

| # | Check | Where | What passes |
|---|---|---|---|
| 3 | TPM years | Skim | 1+ year with a TPM, program manager or project manager title, or clear program ownership inside a product development role |
| 5 | Methodology keywords | Skim | Both "Agile" and "Phase Gate" (or "stage-gate") visible |
| 7 | Overqualification | Skim | Level fits a 2 to 4 year role; candidates expecting well above the band are likely filtered on the salary question |

| # | Check | What passes |
|---|---|---|
| 1 | Multi-discipline hardware programs | Coordinated software, hardware and firmware teams on one product |
| 3 | Phase-gate hardware development | Real gated hardware product development, not only software sprints with "phase gate" in Skills |