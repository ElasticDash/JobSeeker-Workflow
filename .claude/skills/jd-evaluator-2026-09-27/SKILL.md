---
name: "jd-evaluator-2026-09-27"
description: "Break a pasted job description into a six-dimension requirements checklist, a hard/soft skill split, and an ideal candidate profile for screening CVs. Triggers: 拆解 JD, 分析职位需求, 理想候选人画像."
---

# JD Evaluator

Turn one job description into three outputs that are used to screen and score CVs against that JD:

1. A requirements checklist across six dimensions
2. A hard skill / soft skill split
3. An ideal candidate profile (what projects, companies and roles the best candidate has behind them)

Produce all three in one reply unless the user asks for only one part.

**The output is always in English**, even when the user writes in Chinese or another language, and even when the JD itself is not in English. All headings, table columns, labels and prose in the output are English.

## Input

- Raw JD text, LinkedIn or job-board copy-paste, or a careers-page link (fetch the link with WebFetch).
- Strip job-board noise before reading: match widgets ("Your profile matches...", "Show match details"), applicant counts, Save / Apply buttons, browser-extension names (e.g. LoopCV), "Benefits found in job post", trailing "... more".
- Keep: salary, location, visa, employment type, interview process, team size and composition, company stage, customers.
- If the text is not a JD or has no requirements section, say what is missing and work with what exists.

## Step 1: Read for signals before listing anything

Note these before building tables:

- **Requirement strength.** "Required / must" is strict. "You may be a good fit if" is softer. "Preferred / bonus / strong candidates may also" is nice-to-have. Softening lines such as "encouraged to apply even if you don't meet all criteria" or "we prioritize aptitude over years" lower the strictness of the must-haves; say so explicitly.
- **Responsibilities that imply unlisted requirements.** Example: "manage external vendors" in responsibilities but not in qualifications means vendor management is a hidden requirement.
- **Interview process.** Technical rounds or a work trial mean hands-on technical ability is expected even if the title is non-engineering.
- **Salary range width.** A wide range means level is decided at interview.
- **Logistics.** Location, timezone overlap, visa sponsorship (and any qualifier like "for strong candidates"), full-time or contract.
- **Company context.** Stage, team size, who the customers are, what the core business is.

## Step 2: Requirements checklist

### 1. Hard gates

Table: `Item | What the JD says | Verdict`

Always check: location / timezone, work visa, minimum years, certificates / degree, employment type. For each, state whether it is a real gate (binary, fail = out) or not. Visa sponsorship offered means visa is not a gate; note any qualifier. If the JD says nothing about minimum years, write "Not a gate".

### 2. Must-haves

Table: `# | Requirement | Evidence to look for in the CV | Weight`

- Number items M1, M2, ...
- Evidence must distinguish "mentioned in a Skills list" from "demonstrated in a specific project". Describe the project-level evidence to look for.
- Weight: Highest / High / Medium-high / Medium. Mark as Highest the requirement that separates this role from a generic version of the same title.
- Flag requirements that a CV cannot prove well (e.g. communication) as "Mainly verified in interview".
- If the JD softened its must-haves, say to score by coverage rather than eliminating on one gap.

### 3. Hidden requirements

Table: `# | Hidden requirement | Source in the JD | Evidence to look for in the CV`

Number H1, H2, ... Only include items traceable to a specific line in the JD (a responsibility, the interview process, the customer type). Name the source line.

### 4. Nice-to-haves

Table: `# | Plus | Evidence to look for in the CV`

Number N1, N2, ... If a nice-to-have is the company's core business, say its weight is close to a must-have.

### 5. Seniority

Bullets: Years, People management (manager or IC), Scope, Decision rights. Use salary range and responsibility wording as evidence.

### 6. Domain experience

Table with three tiers: `Tier | Background | Examples`

- Direct match: same industry and problem type
- Adjacent: use the adjacent fields the JD itself lists where possible
- Distant: same title, unrelated domain

### 7. Recency

Bullets: how new the field is, which experiences should appear in the most recent one or two roles, what to down-weight (old or outdated versions of the same domain).

### Suggested scoring order

Three steps: gates, must-have coverage (name which must-haves need explicit evidence), then ranking factors in order.

### What this JD is really worried about

One or two sentences on the employer's core anxiety (what goes wrong if they hire the wrong person), and which checklist items best test for it.

## Step 3: Hard skills and soft skills

Two tables, each: `Skill | Level | What the JD says`

Level is one of Must-have / Hidden / Nice-to-have.

- **Hard skills:** tools, languages, analysis methods, technical methods, domain techniques, delivery and process mechanics, vendor delivery management.
- **Soft skills:** judgment, structuring ambiguous problems, making trade-offs, communication, cross-functional collaboration, stakeholder or customer expectation management, independence, learning ability.
- Split a requirement that mixes both. Example: "quantitative and qualitative judgment about data" becomes hard skills (distribution analysis, sample inspection) plus a soft skill (judging whether data is useful).

Then a short list **Items that are not skills** so nothing from Step 2 is lost: gates, domain experience, seniority, recency.

If a classification is debatable, add one note explaining the choice and the alternative.

## Step 4: Ideal candidate profile

### Ideal candidate in one sentence

One sentence combining the domain, the kind of ownership, and the two or three capabilities that matter most.

### Project types they have ideally done

Table: `Project type | What they actually did | Maps to`

- Rank by closeness to the company's core business.
- Describe concrete work (what the person actually did in the project), not skill labels.
- Map each project back to M / H / N items.

### Companies or teams they have ideally worked in

Company categories, with a few well-known examples per category where they exist. Do not claim any company is hiring and do not name individuals.

### Best-fit role backgrounds

Ranked list, closest first. Note the trade-off for backgrounds that are strong on one axis and weak on another (e.g. engineers who never owned a program).

### The ideal skill combination

The combination that is rare, as three or four bullets. Say plainly that single items are common and the combination is what is scarce, if true.

### Strong and weak signals on a CV

- Strong signals: CV descriptions that indicate a high match, written as the kind of line you would see on a CV.
- Weak signals: things that look related but carry little weight (certificates without practice, keywords in Skills with no matching project, old experience, process-only work in large companies).

## Output rules

- Always write the output in English, whatever language the user or the JD uses. Keep company names, product names and technical terms as they appear.
- Never use em dashes.
- Use tables for requirement and skill lists, short bullets elsewhere. No preamble, no recap at the end.
- Stay inside the JD. Do not invent requirements. Anything inferred is labeled Hidden and cites the JD line it comes from.
- Give the assessment only. Do not offer to write outreach emails, LinkedIn messages or client-facing copy.

## Follow-up: scoring a CV

If the user then supplies a CV, score it in English using the checklist in this order:

1. Gates: any failed gate means out; say which.
2. Must-have and hidden requirements: for each item, quote the CV evidence (or state none found) and rate 0 = no evidence, 1 = mentioned only, 2 = did it, 3 = owned or led it.
3. Nice-to-have, domain tier, recency: use for ranking.
4. End with the overall verdict and the one or two biggest gaps.

## Example rows (Technical Program Manager at an AI training-data and evals company)

Must-haves:

| # | Requirement | Evidence to look for in the CV | Weight |
|---|---|---|---|
| M2 | Quantitative and qualitative judgment about data | Ran data QA, analyzed distributions, spot-checked individual samples, found data problems and drove fixes | Highest |

Hidden requirements:

| # | Hidden requirement | Source in the JD | Evidence to look for in the CV |
|---|---|---|---|
| H2 | Hands-on technical ability | 2 technical interviews plus a 2-3 day work trial | Writes scripts or SQL to analyze data, or has an engineering background |

Project types they have ideally done:

| Project type | What they actually did | Maps to |
|---|---|---|
| Building RL environments or agent eval task sets | Designed tasks, validated rewards / graders, analyzed pass rates and difficulty distribution | Core business; covers M2 and N1 |