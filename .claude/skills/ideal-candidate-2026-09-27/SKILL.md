---
name: "ideal-candidate-2026-09-27"
description: "Rewrite a candidate's CV into the most plausible ideal candidate for one JD, in English: employers, dates, base titles and education fixed, max 13 bullets, credibility pass, mandatory resume humanize pass, invented claims listed."
---

# Ideal Candidate Builder

Takes one job description (raw or already analyzed) and one candidate CV or profile (raw, export, or an analysis of it) and produces the closest-to-ideal version of that candidate for that job, inside a fixed frame. The result must read like a real person's record that survives an interview, not like the JD rewritten in the first person, and not like an AI draft that was humanized by rule.

Triggers: "ideal candidate", "理想候选人", "根据这个 JD 和 CV 生成一个新的 candidate profile", "按这个 JD 改成最匹配的版本".

If either input is missing, ask for it before writing anything. Two copies of the same file do not count as two inputs.

## Output language

The entire output is in English: the profile and every closing list. This holds even when the user writes in Chinese or the inputs are in another language. Only a clarifying question asked before writing may follow the user's language.

## Fixed vs editable

| Element | Rule |
|---|---|
| Header (name, phone, email, links) | Fixed, as in the candidate's material or the .docx template. The location follows the Header location rule below |
| Employer names | Fixed |
| Start and end dates of every role | Fixed |
| Education (degrees, fields, schools, locations, dates) | Fixed. Academic projects may be dropped if irrelevant, never altered |
| Job title | Base title fixed. A suffix or parenthetical may be added, e.g. "Technical Program Manager (Payments & Partner Integrations)" |
| Everything under each role | Fully editable: projects, systems, responsibilities, skills used, outcomes |
| Summary and Skills | Regenerated from the new profile |
| Personal projects | Optional; drop if they do not serve the JD |

## Hard limits

- **Max 13 experience bullets in total**, across all roles combined.
- **Zero hard gaps.** Every must-have (every M item, elimination set included) appears in experience as something the candidate did, at Strong level: a named piece of work with the candidate's own actions, not only a Skills keyword. The only must-haves that may stay unmet are the permitted hard gaps in Gap rules below.
- **At most 3 non-hard gaps.** Hidden requirements (H) and nice-to-haves (N) are covered too, but up to 3 of them in total may stay Weak or Missing. Leaving 2 or 3 is fine and reads more natural than a page that hits every item; choose the lowest-weight ones.
- Long-tail items inside one list-shaped JD sentence (document types, meeting names, example tools) are not separate requirements; the practice they belong to is what must be covered (see step 7).
- **JD requirements in the candidate's own words.** Cover each requirement by describing the work, not by repeating the JD. No run of 3 or more consecutive words copied from the JD anywhere on the page (Summary, Skills, bullets, title suffixes). The only exceptions are proper names with no substitute: tools, platforms, languages, frameworks, standards, certifications and product names (Kubernetes, SQL, SOC 2). A single field term such as "roadmap" or "SLA" is fine; the JD's phrase around it is not.
- **Long roles must earn their space.** Any role whose description runs past 3 lines on the page must contain at least one JD requirement (an M, H or N item) as work the candidate did. Count rendered lines: each bullet starts a new line and wraps at about 100 characters, or at the template's real width when known. Checked with the role check in step 5.
- **No em dashes** anywhere in the output.
- **Experience ordered most recent first.**
- **No opening verb repeated** across any bullets in the whole section.
- **Internships use weaker verbs** (managed, proposed, tested, supported), never "led".
- Spelling follows the JD's market (US English for US roles).
- **The final output is always humanized** (step 7). Never return a draft that has not been through it.

## Gap rules

A hard gap is an M item (or a hard gate) left Weak or Missing. It is permitted only for these reasons:

1. **Years.** The JD's minimum years (target-role or total) is above what the fixed dates give, rounded as in the Summary rule.
2. **Era or employer mismatch.** No fixed role (employer, base title and time window together) could plausibly have done the work: the technology or practice did not exist yet in that window (e.g. LLM agent work before late 2022), the employer's real business could not contain it (bank regulatory reporting at a game studio), or the base title cannot carry it (direct reports as an intern). Test every role before declaring this. If one role could plausibly have done it, write it there.
3. **Fixed facts outside experience.** A required degree, certification or license not held, location, or work authorization. These are never invented.

Everything else is fillable and gets filled: domain, market, tools, practices, scale, stakeholder types, ownership. "The source CV does not mention it" is never a reason to leave a gap; it is a reason to write it and put it on the confirmation list.

## Header location rule

The header's location shows where the candidate lives now, plus a relocation note when the job is somewhere else.

1. **Candidate location:** the current city and state (or country) from the candidate's material. When the CV and the profile export disagree, use the more recent source and flag it.
2. **Job location:** the city or cities the JD or the posting subtitle names for the role (onsite or hybrid). Note whether the role is remote.
3. **Compare:**
   - The job names one or more cities and the candidate is not in the same metro area as any of them (not within a normal daily commute): write the location as `City, ST (able to relocate)`, e.g. "San Francisco, CA (able to relocate)" for a New York or Seattle role.
   - The candidate is in the same metro area as one of the listed cities (e.g. San Francisco for a San Francisco or Menlo Park role): write the location alone, no note.
   - The role is fully remote in the candidate's country, or the JD and posting give no location: write the location alone, no note.
4. **Relocation answer in the candidate's material:**
   - Says willing to relocate: add the note as above.
   - Says nothing: add the note as above, and put "Confirm willing to relocate to <city>" on the Needs candidate confirmation list.
   - Says not willing to relocate: no note; list the location mismatch as a hard gap (Gap rules 3) instead.
5. The wording is always exactly "(able to relocate)", in parentheses right after the location, on the contact line. Never add it anywhere else, and never change the rest of the contact line.

## Summary template

Always this structure, wording adjusted per job:

"[soft skill] [title] with [N] years of experience in [focus area]. Highly experienced in [past fields covered]. Passionate about [a larger personal goal]. [traits important for the target role] who can [short description of capability]."

- N is a plain whole number, no "nearly" or "over". Compute it from the fixed dates: sum the months, divide by 12, and round to the nearest whole year, halves up (30 months = 3, 29 months = 2), the same rule as cv-analyzer.
- If the years span several functions, say so ("across engineering, program and product roles") so it does not imply all years were in the target title.
- No metrics or achievement numbers.
- No tired resume words ("detail-oriented", "results-driven"). If the JD asks for attention to detail, use a fresher phrase like "a sharp eye for detail".
- No distinctive JD phrases (see JD echo below).
- The trait opener comes from the humanizer-us-resume G4 tiers, and sentence 3 names a plain interest, not a slogan.

## Workflow

### 1. Read the frame
List each role with employer, base title, dates and duration in months, plus education. Note what each employer actually is and does (industry, stage, geography, products). This bounds what can plausibly be written under it. Also note the candidate's current location and any relocation answer in their material.

### 2. Read the JD
Extract: must-have skills, hidden requirements implied by responsibilities, strongly preferred domains, seniority and scope. Note the JD's distinctive phrases so they can be avoided later, and sort its terms into core and long tail (humanizer-us-resume G7c). Note the job location(s) and whether the role is remote, for the Header location rule.

### 3. Choose a story per role
For each role, pick the JD-relevant work that this employer could genuinely have had someone with this title doing in this time window. Prefer a real business line of the employer (e.g. supplier payments at a manufacturing marketplace, billing integrations at an enterprise software company) over a transplant of the target company's product.

Pick one **primary role**: the one that can carry the JD's hardest requirement most plausibly. It gets the most bullets (about 4 to 5). Recent short roles and internships get 2 to 3. Older or less relevant roles get 1 or 2. Bullet counts per role should differ.

### 4. Map coverage
Make an internal checklist of every M, H and N item. Map each M item to at least one bullet where it shows as Strong, unless it is a permitted hard gap. Map the H and N items as well; pick at most 3 of them to leave uncovered, lowest weight first. Merge where one piece of work honestly shows two or three things. The 13-bullet cap is met by merging, never by dropping a must-have.

### 5. Draft
Write the Header (applying the Header location rule), Summary, Skills, Experience, Education. Skills lines use field vocabulary and only list things the experience supports.

Write the experience one role at a time, and run the **role check** as soon as each role's description is finished:

1. Count its rendered lines (see Hard limits).
2. If it is 3 lines or fewer, it passes.
3. If it is more than 3 lines, find at least one bullet that covers an M, H or N item from the step 4 checklist, and note the item ID internally.
4. If none does, rewrite a bullet so it carries a requirement this role can plausibly hold, or cut the description to 3 lines or fewer. Then check again.

The role check runs again on every role that is edited later, in any step.

### 6. Credibility pass (mandatory)

**Timeline arithmetic.** For each role, count the months and check that everything claimed fits: discovery, approval, build, pilot, expansion. Anything that needs elapsed time to measure (repayment, default or delinquency rates, retention, churn) must have had that time. If a lending product's cycle is 60 to 90 days, a loss rate needs several cycles; if the role cannot supply them, drop the rate and describe what was actually observable.

**Realistic numbers.** Keep numbers sparse and sized to the role, stage and tenure. No headline scale borrowed from the employer. Prefer modest, specific figures (40 to about 120 suppliers over four months) over round impressive ones (600+ with delinquency under 1%). Numbers carried over from the source CV must still make sense in their new context; if one describes something different now, flag it.

**Title vs content.** If the base title is not the target title (TPM, analyst, engineer), the bullets must say what the candidate owned and who owned the rest, e.g. "owned requirements and the pilot, reporting to the lead who held the P&L". Interviewers will ask "did you own it or coordinate it"; the page should already answer.

**Intern scope.** One feature or project, narrow decision rights, weaker verbs. Results may be incomplete at handoff.

**JD echo scan.** Remove JD-distinctive phrasing from every section: named methods lifted from the JD ("fake-door", "beta-to-GA"), its soft-skill slogans ("create structure in ambiguity"), and its named company categories ("benchmarked neobanks" for a neobank JD). Use the words a practitioner in that field would use (dunning, pilot, rejection history, settlement files). Depth should be uneven: not every JD item gets equal airtime. Uneven depth never means leaving a must-have out.

**Copy scan.** Save the JD and the page as text files and list every 3-word run the page shares with the JD:

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

Rewrite every hit in the candidate's own words, except proper names and runs of plain function words ("a team of", "and the"). The header location (a city name the JD also uses) counts as a proper name.

**Domain correctness.** Describe mechanics the way someone who did the work would. Name the risk that actually matters in that setup (e.g. when the employer is the paying buyer in supply chain finance, the risk is recovering advances on rejected goods, not supplier default).

**Exactly one honest limit.** One on the whole page, not one per role: a test that had not concluded at handoff, an idea that was dropped, a fix made after users misread something. Real candidates rarely volunteer limits on their own impact; one reads as honest, two or more read as a technique. Put it where a limit is most natural (an internship handoff, a small tool, a pilot), never on the primary role's headline bullet, and state it plainly inside the sentence rather than as a tacked-on closing clause.

### 7. Humanize pass (mandatory)

Load the `humanizer-us-resume` skill with the Skill tool and apply it to the whole draft (it runs humanizer-us sections A to F, then its document-level section G). Write the draft to a text file first and run both of its scan scripts on it; fix what they flag.

**Overrides inside this skill:**
- This skill's hard limits win over any humanizer suggestion: 13-bullet cap, no repeated opening verbs, zero hard gaps and at most 3 non-hard gaps, fixed fields untouched.
- Numbers and claims this skill invented may be cut, rounded or rewritten directly, since they are all on the confirmation list anyway. Numbers from the source CV are still never changed silently: flag them under "Needs candidate confirmation".
- The humanizer's "For you to decide" items go into "Needs candidate confirmation". Its "What changed" section is not output.
- Planned imperfections (G13): use 2, not 3. The honest limit from step 6 is not one of them. The header, including the "(able to relocate)" note, is a protected zone.
- After the humanize pass, rerun the role check on every role whose text changed.
- G7c's core tier does not keep the JD's wording here: only proper names stay as the JD spells them; core practices are described in the candidate's own words.
- G7c (JD coverage too complete) governs wording only. It may paraphrase or merge long-tail list items, but it never removes the only coverage of an M item and never pushes H and N gaps past 3. Its "every responsibility has a matching line" tell does not apply to must-haves.

**The reader tells to kill.** On top of section G, check these explicitly. They are what a hiring manager who reads many AI resumes notices first:

1. **Convenient caveats.** Count sentences that limit the candidate's own impact ("completed after I left", "engineers still edited every draft", "a few kept by design"). Exactly one may remain (step 6). Cut the rest outright; do not rephrase them.
2. **Uniform bullet shape.** Count bullets built as verb, object, colon or comma, then a list of three. At most 3 on the page, at most 1 per role. At least 3 bullets are flat and task-only, with no result, no list and no colon, and at least 2 of those are under 70 characters ("Planned sprints for 2 Scrum teams of 12 engineers.").
3. **A complete arc in every bullet.** At most half the bullets carry problem, action and resolution. At most 1 bullet on the page ends on a neat payoff clause ("which then got its own fix sprint", "which cut X"). Older and minor roles are the first to go flat.
4. **Clustered hedges.** "About", "roughly", "around", "~" and "approximately" appear at most once per role and at most twice on the page. Prefer a plain whole number, or drop the number and describe scope.
5. **Skills as JD requirements turned into nouns.** Skills list tools, languages, platforms and a short methods line in the candidate's own words. No more than about half of the Skills items may restate a JD requirement; proper names keep the JD's spelling, while practices and methods are named in the candidate's own words, not the JD's phrasing ("release management", not "release trains and go/no-go"). End with 2 or 3 real items from the candidate's material that the JD did not ask for (humanizer G15).

**Reader test.** Read the finished page as a skeptical hiring manager who screens AI-written resumes every day and ask: what is the first thing that gives this away? If there is a specific answer, fix it and ask again. Stop only when the answer is nothing specific.

### 8. Final recheck

After humanizing, recheck: bullet count at or under 13, no repeated opening verbs, no em dashes, reverse chronological order, fixed fields untouched, the Header location rule applied (the "(able to relocate)" note present exactly when the job location differs from the candidate's and the candidate has not said no to relocating), every M item still Strong or a permitted hard gap, at most 3 H or N items Weak or Missing, role check on every role, JD echo re-scan and copy scan on the whole page (no 3-word run from the JD except proper names), and every claim that changed or was added since step 5 reflected in the confirmation list. Everything in English.

## Output

All in English:

1. Header: name, headline, and contact line, with the location written per the Header location rule
2. Summary
3. Skills (2 to 3 grouped lines)
4. Experience: `**Employer** | Title (suffix) | Location if known | Mon YYYY to Mon YYYY`, bullets beneath
5. Education, exactly as given
6. **Needs candidate confirmation:** every claim not in the source material, most interview-exposed first, and any source number now attached to a different context. This list is mandatory: nothing here goes out as the candidate's record until he has confirmed or cut it.
7. **Intentional imperfections:** the 2 planned G13 imperfections, quoted, each with its clean version, so they can be removed.
8. **Gaps**, two short lists:
   - Hard gaps: only the permitted kinds from Gap rules, each naming its rule. For an era or employer mismatch, name the roles tested and why none fits. Usually this list is empty or only years.
   - Non-hard gaps: the H or N items left Weak or Missing, at most 3.

Keep every list short. Do not recap the workflow or the humanize checks.