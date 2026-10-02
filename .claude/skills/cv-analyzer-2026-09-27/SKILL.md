---
name: "cv-analyzer-2026-09-27"
description: "Analyze a candidate's resume or profile export: timeline, education, hard and soft skills with recency, seniority, domain experience, and red flags. Triggers: 分析候选人, 硬技能软技能, 资历层级."
---

# CV Analyzer

Turn a candidate's resume, CV, LinkedIn copy or WideApply export into a structured, evidence-based profile a recruiter can screen against. The point is to separate what the candidate has proven in real jobs from what they only list, and to show how recent each skill is.

## When to use

The user pastes or uploads a candidate profile (resume PDF, WideApply export, LinkedIn text) and asks for an analysis of skills, experience, education, seniority, domain or recency. The request may be written in English or Chinese (for example: 分析这个人, 硬技能软技能, 资历层级, 领域经验, 近期性, 学历, 候选人画像). These phrases are recognition cues only; the output is always English.

If a JD is also supplied, still run this analysis first, then add a short fit section against the JD. For breaking down a JD on its own, use jd-evaluator instead.

## Output rules

- Write the entire analysis in English, including headings, table headers and labels, even when the user's request is in Chinese.
- Never use em dashes. Use commas, colons or parentheses.
- Give the assessment only. Do not offer to write outreach emails, LinkedIn messages or client-facing copy.
- Answer in the chat reply, not a file, unless the user asks for a document.
- Use tables for the multi-column sections; short bullets elsewhere. No filler recap at the end.

## Procedure

### 1. Reconcile sources

If there is both a resume and a profile export, read both. Note anything present in one but not the other (MBA consulting projects, extra skills, locations, education bullets). Use the richer source, but flag contradictions.

Before writing anything, list every education entry found across all sources (degrees, diplomas, bootcamps, exchange programs, certifications). Every one of them must appear in the Education section, including undergraduate and pre-master degrees, not only the most recent or most prestigious one.

### 2. Snapshot

One or two sentences: career archetype (e.g. engineer-turned-TPM moving into PM), real full-time years split by function, highest and foundational degree, and the single most important caveat (usually recency or a gap).

### 3. Timeline

Table with columns: Period | Role | Type (Full-time / Internship / Education / Gap) | Duration.

- Include every degree as its own Education row, undergraduate included, alongside the jobs.
- Compute months per role from the dates.
- Sum full-time years yourself and compare with the candidate's own claim ("4 years" etc.). Say if the claim includes internships or rounds up.
- Show gaps explicitly, including the current one (from last role end to today's date).
- Note overlaps (working while still studying, e.g. a full-time job starting before the bachelor's end date) and say what they imply.

### 4. Education

Table with one row per degree, oldest to newest or newest to oldest consistently, columns: Degree and field | Institution | Location | Dates | Status | Relevance.

- Status: Completed / In progress / Expected (date) / Unclear. If the end date is in the future or missing, say so.
- Location: country or city of the institution; infer only when obvious and say "likely".
- Relevance: how the degree supports the candidate's current direction (e.g. CS bachelor's underpins technical credibility for TPM roles; MBA supports the PM and GTM pivot).

Then cover, for each degree where the sources give anything:

- Academic projects, consulting engagements, competitions, honors, scholarships, thesis or notable coursework, with what skill each one evidences. Label these as academic, not professional, experience.
- GPA only if listed, stated as a fact; never treat it as a strength or weakness on its own.
- Institution context in one line when useful (e.g. a well-known domestic university outside the target market, a US program that is STEM-designated and so affects OPT length).

Finish with an "Education takeaway" line: what the education stack adds up to (e.g. technical foundation plus business pivot), how recent the latest degree is, and any gap between the field of study and the roles targeted.

### 5. Hard skills and recency

Table with columns: Skill | Evidence | Last seen | Recency.

- Evidence: Strong (concrete bullet with scope or numbers), Medium (mentioned in a bullet but the candidate was a participant or coordinator), Weak (implied or peripheral, including degree coursework only), Unsupported (appears only in the Skills list).
- Last seen: the most recent role, academic project or personal project where the skill is actually used, with its end date.
- Recency: Current / Recent / N years ago / Stale. Treat 3+ years of unused hands-on engineering as stale.
- Distinguish professional use from personal or academic projects; label them "non-professional" or "academic" even when they are the most recent.
- Group coordination skills vs hands-on skills so it is clear whether the person built or managed.

After the table, write a "Key takeaway" line summarizing the pattern (e.g. the hottest skills have no workplace validation; the validated ones are old).

### 6. Soft skills

Bullets, each tied to evidence from a specific role or academic project (counts of interviews, number of teams coordinated, case competition results, etc.). End with a "Gaps" bullet naming soft skills with no evidence (strategy, vision, people management, negotiation) where relevant.

### 7. Seniority

Four labelled parts:

- Level: approximate level (e.g. mid-level IC, roughly L4 to L5; or APM / new-grad MBA PM). Judge from years, title and scope, not from the candidate's self-description. Note when a recent degree resets the market's view of level (e.g. post-MBA hires are usually slotted at entry PM level).
- People management: direct reports or not. "Led N engineers" as a TPM or PM is coordination, not a reporting line, unless the resume says so.
- Scope: per role, one line (single feature, team, multi-team program, org-wide platform). Separate business context numbers (company spend, platform MAU) from what the person personally owned.
- Decision rights: what they actually decided (scope, acceptance criteria, go/no-go, prioritisation) versus what they influenced. Call out absence of budget, hiring or product-direction authority.

### 8. Domain experience

Table with columns: Company | Industry | Product type | User type. One row per employer (split a company into rows if the role changed domain). Include academic or consulting projects as separate rows, labelled as such. If the industry is a reasonable inference (e.g. clinical workflows at Oracle suggesting Oracle Health), say "likely" rather than stating it as fact.

Finish with the deepest domain and which domains are shallow.

### 9. Watch-outs

Numbered list. Check each of these and include only those that apply:

1. Gaps and recency: time since last full-time role; whether a degree explains it.
2. Geography: how much experience and education is in the target market (e.g. US) vs abroad; unstated locations.
3. Inflated numbers: platform or company-level figures presented as personal impact.
4. Years claim vs computed full-time years.
5. Skills listed with no supporting experience.
6. Work authorization inconsistencies (e.g. on F-1 OPT but answers no future sponsorship needed; OPT end date implying STEM OPT).
7. Title inflation or verbs overstating the role ("led" for an intern).
8. Education issues: degrees missing dates or status, a degree listed in one source but not the other, date overlaps between study and full-time work, or a field of study far from the target role.

### 10. Fit direction

Two short lines:

- Best fit: role type, level and domain where this person is strongest, plus what would help them in interviews.
- Not a fit: levels or role types to avoid screening them for.

If a JD was supplied, replace this with a short match against the JD's must-haves (including any education requirement), marking each as Met / Partial / Missing with the evidence.

## Quality checks before replying

- The whole output is in English, with no Chinese headings or labels.
- Every education entry from every source appears in both the Timeline and the Education section, undergraduate included.
- Every claim in the skills, seniority and domain sections points to a specific role, academic project or personal project.
- All durations and gaps were computed from the dates, and today's date was used for the current gap.
- No em dashes anywhere.
- No offer to write outreach at the end.