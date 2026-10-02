---
name: "humanizer-us-resume"
description: "Humanize a resume or CV for US readers: runs humanizer-us, then a whole-document pass for bullet templates, sparse round numbers, tool name-drops, JD coverage that is too complete, uneven depth and length, self-praise and power words, planned low-risk imperfections, and plausibility."
---

# Humanizer (US) for resumes

A resume can pass a sentence-by-sentence humanizer and still read as machine-written, because the tells live across the whole document: every bullet built on the same template, a balanced list in every line, a number in most bullets, the same distinctive phrase reused in two bullets, method acronyms dropped in for keywords, a tool named in nearly every bullet, every long-tail phrase from the job description reproduced once, a Profile whose wording is too polished, and a page so even and so clean (same bullet count per role, same bullet length, not one rough edge anywhere) that no person would have written it. This skill adds a document-level pass for those.

It also checks plausibility. Tools listed on a role before they existed, tech stacks copied from role to role, tense that drifts between bullets, and a full-time job that overlaps full-time study are what a recruiter flags first, whoever wrote the page.

Human texture comes mainly from uneven depth, sparse round numbers, concrete detail and the candidate's own wording. On top of that, the page carries 2 or 3 small, low-risk imperfections of the kind real resumes have (G13): placed on purpose, kept out of the places a recruiter reads hardest, and listed in the output so the user can take any of them out. Never add spelling typos, tense drift, wrong facts or anachronisms.

## How to work

1. Read `.claude/skills/humanizer-us/SKILL.md` and apply sections A to F to the resume as usual.
2. Then run section G below across the whole document, not bullet by bullet. Count before you edit: tally how each bullet ends, how many bullets use the "action; result" semicolon split, how many lists of three or more appear, how many bullets carry a number, how many are percentages and how many figures each bullet carries, how many bullets name a tool, which distinctive phrases of two or more words appear in more than one bullet, how many bullets each role has and how long each bullet is, which low-risk slips the source already has, and, when the JD is available, how many of its long-tail terms appear word for word.
3. Run the checks in G9, then place the planned imperfections (G13) last, after every other rewrite, so later edits do not remove or multiply them. Re-read your own rewrites: new wording you introduce is the most common source of fresh tells (a phrase you reach for twice, a new list of three, every bullet trimmed to the same length).

## Two layers

A resume is read by software and then by people. Keep the machine layer in the structure and the Skills section: standard sections, the target title, and every core JD term in its exact spelling. Keep the human layer in the Profile and bullets, written the way the candidate would say it. So when you cut a keyword from a bullet, check that it is in Skills and move it there if not. Never cut a core term from the page entirely. A core term should appear in no more than 2 bullets; flag a third use and point to Skills.

## House rules that override the critique of AI resumes

These come from the user and win over any general advice:
- Never repeat an opening verb across bullets. Do not introduce a repeated verb to look human, even when a reviewer suggests it. Get the same effect from plain verbs (G5).
- Keep the Profile template structure: "[soft skill] [title] with [years] of experience in [focus]. Highly experienced in [fields]. Passionate about [goal]. [traits] who can [capability]." The Profile has no metrics. Avoid overused resume words (e.g. "detail-oriented"; use "a sharp eye for detail" when the JD asks for detail). The years are a plain whole number with no hedge ("4 years", never "nearly 4 years"), and the phrasing must not imply all the years were in the target title when some were in another function.
- Internships use softer verbs ("managed", not "led").
- Experience stays in reverse chronological order.
- No em dashes anywhere. Leave date-range dashes as the user wrote them.

## G. Resume-level patterns

### G1. One bullet template repeated

**Watch for:** action verb, then context, then a trailing result clause ("..., cutting lead time 30%", "..., delivering $2M in savings", "...that cut cycle time 83%"), or a semicolon followed by metrics, on most bullets.
**Fix:** Keep that shape on no more than about half the bullets. Vary the rest: lead with the result ("Cut lead time 30% on a 0-to-1 factory platform by..."), put the number mid-sentence, split one bullet into two short sentences, or state scope only with no result clause. Change the shape, not the facts.

**Semicolon splices count separately.** "Action; result" ("Launched X for Y; adoption hit 95% and cycle time fell 83%") is the strongest single form of this template, and one of the easiest tells for a reader to spot. Allow it on at most 2 bullets on the page. Rewrite the rest as one unsplit sentence ("...in phases, which got adoption to 95%"), with the result first ("Got adoption to 95% by releasing in phases"), or with the number folded into the main clause ("Kept sprint commitment above 90% across 4 workstreams"). Count again after your edits, since fixing G3 stacks often creates new splices.

**Trailing result sentences count too.** Splitting a splice at the semicolon ("...documented for each. Sprint commitment stayed above 90%.") only moves the tell: a long sentence followed by a short one that holds nothing but the result is the same template, and readers spot it as fast. Allow at most 1 on the page. Do not use a period split as the default fix for a splice.

**Spans.** "From X to/through Y" ("from scope through UAT and launch", "from requirements to rollout", "on scope through release") is a normal way to show end-to-end ownership. One or two per page read as ownership; more read as a template. Allow at most 2. A numeric before/after ("from 45 to 14 days") does not count.

**Result by doing X.** The XYZ formula ("accomplished X, measured by Y, by doing Z") is standard and fine. The tell is applying it to nearly every bullet. People who use it put it on their 2 or 3 strongest results and write the rest more loosely. Keep "[result] by/through [doing]" on about a quarter of the bullets, chosen for the results that matter most to the target role.

**Unevenness is the goal, not variety.** Rotating opening verbs while every sentence keeps the same skeleton is itself a machine pattern. Humans start from templates too; what gives them away is that they apply the template strictly on the bullets they care about and loosely on the rest. When the page reads too even, let one or two lower-priority bullets be plainer or a little longer rather than polishing every line to the same finish. G10 covers evenness in bullet counts and length.

### G2. List density

**Watch for:** enumerations of three or four balanced items ("engineering, finance and the vendor", "APIs, data stores and integrations") in most bullets. More than one per role is a tell.
**Fix:** Keep an item when it is a JD keyword or a distinct fact the reader needs. Cut generic items ("requirements, validation and rollout" can often become "through rollout"). Aim for at most one list of three or more per role. If you cut a JD keyword from a bullet, check that it still appears in Skills or elsewhere. A list of concrete specifics the candidate actually dealt with (the three bugs they fixed, the three countries the team sat in) is detail, not a template, and can stay.

### G3. Metrics: fewer, rounder, and where they count

A human-written resume has fewer numbers than a generated one. People quantify the few results they remember and are proud of, and describe the rest. In the reference human resume behind these rules, about a third of the bullets carried a number, and most of those were scale or money ("a team of 5", "30,000+ early users", "over $500,000 revenue in 3 months"), with a single percentage on the page.

- **Density.** Aim for about 40% of bullets carrying any number (35 to 50%), never more than half. A number on most bullets reads as "someone was told every bullet needs a number". Above half, name the weakest ones to turn into plain scope statements. A role with 3 or more bullets keeps at least one plain bullet with no number. Older and less relevant roles may carry none.
- **Kinds.** Prefer scale, money and counts, written round, with a plus where natural (30,000+ users, $500K+, 15 people across 3 countries). Allow at most 2 percentages on the page, and at most 1 before/after pair. Plain-language outcomes ("the app was how most riders booked by the end of year one") are real results, not missing numbers.
- **Placement.** Numbers go on the bullets that matter for the target role. A number on a minor bullet ("saved each team ~4 hours a week") adds little and adds to the pattern. Minor bullets are the first to go plain.
- **Precision.** People remember numbers roughly ("about 80%", "roughly $150K a year", "5x faster"). Figures like 57%, 24% and 16% look computed and invite "faster than what baseline, over what period?". Keep exact figures the candidate actually measured; suggest a rounded form for the rest. No decimals.
- **One metric per bullet.** Three figures in one line reads like a generator filling slots, and one strong number lands harder. Allow two only when they form a before/after pair ("from 45 to 14 days") or a result plus its base or time frame ("saved $2M on $600M of spend", "$500,000 revenue in 3 months"). Scope counts such as team size do not count toward the limit. For a stacked bullet, name the figure to keep and put the choice under "For you to decide" with the one-metric version ready to paste.
- **Filler.** A number attached only to make a weak bullet count ("flagged 3 critical risks early") gets flagged. So does a vague "increased customer satisfaction by 10%" with no measure behind it: ask how it was measured, or suggest a plain version.
- **The interview test.** Every number is something an interviewer can ask about. Flag any figure the candidate may not be able to explain, with the question to ask them.
- **Never silently.** Do not add, delete, round or change a number yourself. Put every density, kind, placement, precision and filler suggestion under "For you to decide", with the plain or rounded wording ready to paste. Never introduce a new number in a rewrite.

### G4. Profile wording too polished

The template structure is fine; the wording inside it is where the Profile gives itself away. It is usually the most AI-sounding part of the page.

**Watch for:**
- **Slogan goals** in sentence 3: a metaphor or a neat formula ("portfolios that put every dollar behind the highest-value work").
- **Polished capability lines** in sentence 4: "turn X into clear, data-backed Y", "bridge A and B", "translate strategy into execution", paired adjectives before a noun ("clear, data-backed decisions").
- **Trait openers outside the tiers** in sentence 1. Use this list:
  - Tier 1 (safe when the page supports it): delivery-focused, execution-minded, systematic, risk-aware, data-minded, business-minded, pragmatic, structured.
  - Tier 2 (only with a bullet that proves it; name that bullet): hands-on (managers and leads who do the technical work themselves; never before an engineer title), customer-facing, field-experienced, product-minded, technical (never before a technical title), analytical.
  - Tier 3 (never in the Profile): detail-oriented, results-driven, results-focused, strategic, innovative, visionary, versatile, adaptable, proactive, driven, dedicated, accomplished, highly skilled, collaborative, creative (as a trait), dynamic, motivated, seasoned, fast learner, quick problem solver.
  Swap a Tier 3 word for a Tier 1 word, or a Tier 2 word the page proves.
- **Stock Profile phrases** that appear on thousands of resumes: "bringing ideas to reality" (or "to life"), "building impactful software", "take on projects with little guidance", "the software development lifecycle from development to delivery" used as the field in sentence 2, "a passion for technology". Replace each with what this candidate actually did or cares about.
- **Stacked hyphenated traits** ("calm-under-pressure leader") and capability clauses that could describe anyone ("keep schedules on track when constraints conflict").

**Fix:** Keep the four sentences, and say each one the way the candidate would in an interview. Sentence 2 names real domains or platforms from the page, not a generic process. Sentence 3 names a plain interest after the fixed "Passionate about". Sentence 4 states a concrete capability with a plain verb. Do not invent anything the experience does not support.

**Before:**
> Passionate about technology portfolios that put every dollar behind the highest-value work. Former engineer with an MBA who can turn cross-team trade-offs into clear, data-backed executive decisions.

**After:**
> Passionate about how companies decide where their technology money goes. Former engineer with an MBA who is comfortable taking cost and schedule trade-offs to leadership.

**Before:**
> Detail-oriented software engineer with 7+ years of experience in full-stack web application development. Highly experienced in the software development lifecycle from development to delivery. Passionate about building impactful software and bringing ideas to reality. Fast learner and a quick problem solver who can take on projects with little guidance.

**After** (for a candidate whose page shows mobile apps, ride-booking and training platforms, and remote team leads):
> Pragmatic software engineer with 7 years of experience in full-stack web and mobile development. Highly experienced in ride-booking, workforce training and chatbot products. Passionate about shipping small products that real users pick up quickly. Structured communicator who can lead a small remote team from first commit to release.

### G5. Scope and verb inflation

**Watch for:** verbs that oversell the title or tenure ("Directed" a platform as a TPM two years in), and verb choices that read like a thesaurus rotation or a resume guide's power-word list.
- **Never use:** Spearheaded, Pinpointed, Revolutionized, Masterminded, Synergized, Catalyzed, Utilized, Leveraged, Empowered.
- **At most one or two on the page, and only when the material supports that scope:** Orchestrated, Championed, Pioneered, Architected, Streamlined, Directed, Headed, Steered.

Because the house rule forbids repeated opening verbs, the page will always have many distinct verbs; plain ones keep that from looking rotated.
**Fix:** Prefer plain verbs that still don't repeat (ran, built, shipped, led, set up, moved, cut, took, worked with, wrote, fixed, found, tracked down). "Pinpointed bugs" becomes "Tracked down bugs" or "Fixed bugs". Flag inflation for the user rather than downgrading on your own if the source supports the stronger verb.

### G6. Phrase echo

**Watch for:** the same distinctive phrase of two or more words in two bullets ("one view of risks...", "one view of program health"; "across 3 platforms" twice). Models reach for the same crafted phrase; people vary it without thinking. Check your own rewrites hardest, since an edit often introduces the echo.
**Fix:** Keep the phrase where it is strongest and reword the other ("a single tracker", "a shared dashboard"). JD terms may repeat when both bullets need them for ATS. Plain everyday words ("the existing", "current", "from scratch", "the product team") may repeat once; people reuse them all the time, and scrubbing every repeat makes the page read edited.

### G7. Keywords inserted rather than used

**Watch for:** method acronyms and JD terms that sit in a bullet as objects rather than as work ("owning milestones and the RACI/RAID", "leveraging TCO"), and JD terms threaded one per bullet in perfectly placed spots (RACI/RAID, TCO, benefits tracking, business case, go/no-go each exactly once).
**Fix:** Either show the method doing work ("kept the risk log current across 6 teams") or move the term to the Skills or Methods line, where a keyword list reads naturally. Keep the terms themselves for ATS; vary how one or two appear so they read like the candidate's words.

### G7b. Tools named in the bullets

**Watch for:** a tool from the Skills section named in most bullets ("wrote the PRD in Notion", "posted updates in Slack", "one plan in Linear, starting from a charter in Notion", "dashboards in Jira and Grafana"). It reads as if every skill was proven by a bullet, which is what keyword matching looks like. Also watch for several overlapping tools at one employer (Jira, Linear and Notion all at one company), and for a tool placed where it is unlikely (Notion at a large company that has its own standard tooling).
**Fix:** Keep a tool in a bullet only when the tool is the work itself: a migration, a rollout, a cutover or a build (Terraform rollout, Splunk to OEM migration, Grafana dashboards the bullet is about). General collaboration and tracking tools (Jira, Confluence, Notion, Slack, Linear, Excel) belong in Skills; a Skills listing is enough evidence for them. Aim for a tool name in no more than about half the bullets and no more than one per bullet, except in a migration from one tool to another. When a tool placement looks unlikely for the employer, drop it from the bullet and flag it under "For you to decide".

### G7c. JD coverage too complete

A person tailoring by hand hits the big keywords and misses the long tail. A page that reproduces every item of every list in the JD reads as generated, even when each sentence sounds human. Run this whenever the job description is in the conversation.

**Sort the JD terms into two tiers.**
- **Core:** named tools and platforms, the must-have practices in the requirements section, the domain, and anything the JD repeats. These stay, in the JD's wording.
- **Long tail:** the items inside a single list-shaped JD sentence: document types ("program charters, decision logs, rollout plans, runbooks, and post-launch retrospectives"), meeting names ("planning reviews, technical deep dives, status updates, and executive readouts"), stakeholder nouns ("engineering leads, architects, security partners, and external vendors"), and example tools after "such as".

**Watch for:** most items of a long-tail list appearing verbatim, one per bullet, each in a tidy spot. Also watch for every responsibility and every bonus item having exactly one matching line.

**Fix:** For each long-tail list, keep the one or two items that matter most for the role verbatim, and no more than about half of the list. For the rest, do one of three things:
- say them the way the candidate would ("a retro after each launch", "wrote up what we decided", "the vendor", "the architects");
- fold them into the Methods line;
- drop them where a kept item already shows the practice.

Leave at least one bonus item unclaimed unless the candidate's real work covers it strongly. Never drop a core term. When a cut could cost ATS matching on a term the user may care about, list it under "For you to decide" with the verbatim version ready to paste back.

### G8. Unclear names and categories

- Flag capitalized internal names the reader can't parse ("Built Product Support & Enhancements": team, function or process?) and add a plain descriptor.
- Flag Skills entries in the wrong group ("LLMs" listed as a tool next to Claude Code and n8n).

### G10. Evenness: bullet counts and bullet length

A human-written resume is lumpy. The role the person is proudest of gets four bullets, an old contract gets one, some bullets run two lines and some are six words. A generated page is even: every role gets three bullets, every bullet runs about the same length, every line has the same finish. The reference human resume went 3, 4, 2, 1, 1 bullets per role, with bullets from 40 to about 200 characters.

**Watch for:**
- **The same bullet count on every role** (3, 3, 3). Depth should follow relevance and recency: the most relevant role deepest, older and less relevant roles thinner, down to a single bullet.
- **Uniform length:** most bullets within about 25 characters of each other, and no short bullet on the page. Aim for a mix: a few one-liners of under about 70 characters, some full two-liners, the rest in between.
- **Uniform specificity:** every bullet pitched at the same level of abstraction. Real resumes mix a big-picture bullet with a concrete one that names the actual bugs, screens, devices or systems in plain words ("fixed window overlays after the page went idle, screen-resolution fitting on older devices, and a panel that stopped updating from the server").

**Fix:** Shorten one or two low-priority bullets to a plain one-liner, let one strong bullet run to two lines with its real detail, and let the less relevant roles carry fewer bullets. Never pad a bullet or invent detail to change its length. When the only way to vary depth is to cut, suggest the cut under "For you to decide".

### G11. Self-praise and resume-guide phrasing

**Watch for:**
- **Clauses that grade the candidate** instead of describing the work: "displaying remarkable teamwork skills", "demonstrating strong leadership", "showcasing excellent communication", "highlighting my problem-solving ability". A reader discounts them and they mark the page as coached.
- **Power words from resume guides** (G5) and inflated outcome verbs with no measure ("increased customer experience and satisfaction").

**Fix:** Delete the grading clause and let the work carry the claim; if the trait matters for the JD, show it with a fact ("worked with the product team on scope and gave engineering feedback on each feature request"). Replace power words with plain verbs.

### G12. Plausibility and consistency

These are the first things a careful recruiter or hiring manager checks, and they hurt the candidate whoever wrote the page. Treat each as a fact question for the candidate, not something to fix silently, except tense, which is grammar.

- **Tools that did not exist yet.** A tool or version listed on a role that ended before its first release (Angular 2+ on a role ending in 2015; Angular 2 shipped in 2016). Also check tools that existed only in the last months of a long role (Tailwind, first released late 2017, on a 2015 to 2018 role): plausible, but ask. Flag both under "For you to decide" with the suggested fix (drop the tool from that role, or name the version actually used, such as AngularJS).
- **Stacks copied across roles.** Near-identical tech stack lines on several roles read as copy-paste and invite the anachronism question. Suggest trimming each role's stack to what that role actually used.
- **Tense drift.** Ended roles take past tense throughout; a current role takes one tense consistently. Fix these silently ("Improve the existing unit tests" becomes "Improved the unit test suite") and list them under What changed. Tense drift is never kept as a planned imperfection.
- **Overlaps and gaps.** A full-time role overlapping full-time study, or a gap of several months between roles, gets a question under "For you to decide" (was the role part-time, or was the degree part-time? what happened in the gap?). Never reword dates to hide one.
- **Most recent role weakest.** A latest role with the fewest, vaguest or unquantified bullets reads as coasting. Flag it and ask for one concrete result or detail from that role.

### G13. Planned imperfections

A page that is perfect in every line is itself a tell. Real resumes carry a few small rough edges, and the reference human resume had several ("in cooperating with the product team", "end-2-end", "Front-End" capitalized mid-sentence, a date range with a hyphen where the others use an en dash). Leave 2 or 3 on the page, each of a different type, at most 1 per role.

**Keep before you add.** When the source already has a low-risk slip from the list below, keep it (outside the protected zones) and count it toward the 2 or 3, instead of fixing it and inventing another. Fix every high-risk error in the source: spelling typos, tense drift, subject-verb disagreement, wrong facts, anachronisms.

**Allowed types (low risk):**
1. Resume shorthand that drops an article once ("Built new onboarding flow for the field team").
2. A slightly clumsy but clear phrase in the candidate's own voice. Prefer one from the source ("in cooperating with the product team", "million-level tables"). When writing one, match how the candidate writes in the source, and never imitate a non-native pattern the candidate does not show.
3. Inconsistent naming of a non-JD tool between a bullet and Skills ("Node" in a bullet, "Node.js" in Skills), or mixed conventions ("React.js" next to "ExpressJS").
4. A mid-sentence capital on a common term ("Front-End", "Web Services").
5. One shorthand: "&", "w/" or "e2e".
6. One run-on bullet that joins two actions with "and" and no comma.
7. Punctuation drift: one bullet without the closing period the others have, or one list without the Oxford comma the page otherwise uses.
8. One date range written with a hyphen instead of the en dash.

**Protected zones (never an imperfection here):** name, subtitle, contact lines, section headers, job titles, company names, date values, every number, every JD core term and every Skills entry that is a JD tool, Profile sentence 1, Education.

**Never, anywhere:** spelling typos, tense drift, subject-verb disagreement, wrong facts, anachronisms, or an imperfection that changes what a bullet means.

List each one under "Intentional imperfections" in the output, quoted, with its clean version, so the user can remove any of them. If the user asks for a clean version, return the resume without them.

### G14. Human sentence habits

People write a few bullets the way they talk about the job. Keep or create these from the candidate's own material:
- **At least 1 long bullet** (about 150 to 200 characters) that chains two actions with "and" and carries people context: how big the team was, where it sat, who the candidate worked with ("with a remote team of 15, including people in Vietnam, India and New Zealand").
- **One double-verb opener** is fine on the page ("Analyzed and optimized the database structure..."); the first verb counts for the no-repeat rule.
- **Plain business outcomes** without a metric are fine ("helped the business land its first enterprise customers").
- **Everyday words** ("the existing", "current", "new", "from scratch") are fine, including one repeat (G6).

### G15. Uncurated edges

A page where every item was chosen for the JD reads as built for the JD.
- **Skills tail.** After the JD tools and the candidate's supporting tools, the Skills section ends with 2 or 3 tools from the candidate's material that the JD did not ask for (older or adjacent ones such as jQuery or Objective-C). Suggest them under "For you to decide" if cutting to make room.
- **Locations as written.** Keep role locations the way the candidate wrote them, even when formats differ across roles ("Auckland", "United States, Remote", "Nanning (Remote)").

### G9. Checks before returning

- **Arithmetic.** Recompute every before/after figure. 45 to 14 days is (45-14)/45 = 69%, not 68%. When a bullet gives both the pair and a derived percentage, drop the percentage and keep the pair: "(69%)" after "45 to 14 days" reads like someone doing the math for the reader, and it is one of the most AI-looking details on a page. Where only the percentage is given and it is wrong, correct it and list the fix. Never add a parenthetical percentage.
- **Truncated bullets.** Flag and drop dangling fragments ("; earned"). Ask the user for the missing detail.
- **Echo re-scan.** Re-read the final text for G6 echoes of distinctive phrases and new lists of three that your own edits introduced.
- **Number recount.** Count bullets with numbers after your edits (about 40%, at most half) and percentages (at most 2), and state both in the output.
- **Shape recount.** Recount semicolon splices (at most 2), trailing result sentences (at most 1), "from X to Y" spans (at most 2), "result by doing X" bullets (about a quarter), bullets with more than one metric (only allowed pairs), and bullets naming a tool (about half or fewer).
- **Core-term recount.** No core JD term in more than 2 bullets, and every keyword cut from a bullet is present in Skills.
- **Coverage recount.** For each long-tail JD list, count the items that appear verbatim (about half or fewer).
- **Texture recount.** Bullet counts differ across roles, bullet lengths are mixed with at least one short and one long bullet, no self-praise clause or banned power word remains, no tense drift, and every tool on a role existed during that role or is flagged.
- **Imperfection recount.** 2 or 3 planned imperfections, each a different allowed type, at most 1 per role, none in a protected zone, no spelling typos anywhere, and every one on the "Intentional imperfections" list.
- **Profile read-aloud.** Read the Profile as the candidate saying it to a recruiter. Any sentence that sounds like a tagline, and any Tier 3 word or stock Profile phrase, gets reworded under G4.

A quick shape scan when the resume is in a text file (for a PDF, run `pdftotext -layout resume.pdf resume.txt` first):

```
python3 - resume.txt <<'EOF'
import re,collections,sys
t=open(sys.argv[1] if len(sys.argv)>1 else 'resume.txt').read()
bs=[l.strip('*•- ').strip() for l in t.splitlines() if l.strip().startswith(('*','•','- '))]
num=sum(bool(re.search(r'\d',b)) for b in bs)
pct=sum(len(re.findall(r'\d\s*%',b)) for b in bs)
print(f"bullets {len(bs)}  with numbers {num} ({num/len(bs):.0%}; about 40%, max 50%)  percentages {pct} (max 2)")
fig=re.compile(r'~?\$\d[\d,.]*[KMB]?|~?\d[\d,.]*\s*(?:%|x\b)')  # money, percentages, multiples
for b in bs:
    n=len(fig.findall(b))
    if n>1: print(f'CHECK STACK ({n} result figures; fine only as a before/after, base or time-frame pair)',b[:70])
spl=[b for b in bs if re.search(r';[^;]*\d',b)]
trail=[b for b in bs if re.search(r'\.\s+[^.]{0,80}\d[^.]*\.?$',b)]
print(f"trailing result sentences {len(trail)} (max 1)")
for b in trail: print('  TRAIL',b[:80])
span=[b for b in bs if re.search(r'\b(?:from|on)\s+(?![~$]?\d)(?:[a-z/&-]+,?\s+){1,6}?(?:to|through)\s+(?![~$]?\d)',b)]
print(f"from X to Y spans {len(span)} (max 2)")
for b in span: print('  SPAN',b[:80])
byx=[b for b in bs if re.search(r'\b(?:by|through)\s+(?:\w+\s+){0,2}?\w+ing\b',b)]
print(f"result-by-doing bullets {len(byx)}/{len(bs)} (about a quarter)")
for b in bs:
    if re.search(r'\(\s*~?\d[\d.,]*\s*%\s*\)',b): print('  DERIVED % (drop it)',b[:80])
print(f"semicolon splices {len(spl)} (max 2)")
for b in spl: print('  SPLICE',b[:80])
skills=re.search(r'SKILLS(.*?)(?:EXPERIENCE|EMPLOYMENT)',t,re.S)
tools=[x.strip() for x in re.split(r'[,:\n]',skills.group(1)) if 1<len(x.strip())<25] if skills else []
tb=[b for b in bs if any(re.search(r'\b'+re.escape(x)+r'\b',b) for x in tools)]
print(f"bullets naming a Skills tool {len(tb)}/{len(bs)} (aim for about half or fewer)")
grams=collections.Counter()
for b in bs:
    w=re.findall(r"[a-z]+",b.lower())
    grams.update({' '.join(w[i:i+2]) for i in range(len(w)-1)})
stop={'of the','in the','to the','and the','with the','for the','on the','across the','the existing','the product','product team','from scratch'}
print('echoes (distinctive phrases only matter):',[g for g,c in grams.items() if c>1 and g not in stop])
EOF
```

A texture and plausibility scan on the same text file (heuristic; read what it flags). It groups bullets under each date line, so it works for most one-column layouts. The release years cover common tools only; look up any tool it does not know when the dates are close.

```
python3 - resume.txt <<'EOF'
import re,sys,statistics as st
t=open(sys.argv[1] if len(sys.argv)>1 else 'resume.txt').read()
# first public release year; version-specific keys are checked before the bare name
REL={'angular 2':2016,'angular 4':2017,'angular 5':2017,'angular 10':2020,'angular 13':2021,'angular 17':2023,
     'react native':2015,'react':2013,'redux toolkit':2019,'redux':2015,'next.js':2016,'nuxt':2016,'tailwind':2017,'vue':2014,'svelte':2016,
     'typescript':2012,'docker':2013,'kubernetes':2014,'terraform':2014,'graphql':2015,'flutter':2017,'fastapi':2018,'vite':2020,
     'deno':2020,'bun':2022,'jest':2014,'ionic':2013,'supabase':2020,'remix':2021,'prisma':2019,'github actions':2019,'kotlin':2016,
     'airflow':2015,'dbt':2016,'snowflake':2014,'n8n':2019,'langchain':2022,'chatgpt':2022,'claude code':2025,'claude':2023,
     'cursor':2023,'copilot':2021,'figma':2016,'notion':2016,'pytorch':2016,'tensorflow':2015}
dr=re.compile(r'([A-Z][a-z]{2})\w*\.? (\d{4})\s*[–—-]\s*(?:([A-Z][a-z]{2})\w*\.? (\d{4})|Present)')
lines=t.splitlines(); roles=[]; cur=None
for i,l in enumerate(lines):
    m=dr.search(l)
    if m and not re.search(r'EDUCATION',''.join(lines[max(0,i-3):i])):
        end=int(m.group(4)) if m.group(4) else 9999
        cur={'head':lines[i-1].strip()[:40] if i else '','label':l.split('  ')[0].strip()[:30],'start':int(m.group(2)),'end':end,'bul':[]}
        roles.append(cur); continue
    if 'EDUCATION' in l: cur=None
    s=l.strip()
    if cur is not None and re.match(r'(tech stack|skills)\s*:',s,re.I) and not cur['bul']: cur['bul'].append(s); continue
    if cur is not None and s.startswith(('•','*','- ')): cur['bul'].append(s.strip('•*- ').strip())
    elif cur is not None and cur['bul'] and s and not dr.search(s) and l.startswith('        '): cur['bul'][-1]+=' '+s
for r in roles:
    r['stack']=[b for b in r['bul'] if re.match(r'(tech stack|skills)\s*:',b,re.I)]
    r['work']=[b for b in r['bul'] if b not in r['stack']]
work=[b for r in roles for b in r['work']]
if not work: sys.exit('no bullets found')
L=[len(b) for b in work]
print('bullets per role:',[len(r['work']) for r in roles],'(EVEN: vary depth by relevance)' if len({len(r['work']) for r in roles if len(r['work'])>1})==1 and len(roles)>2 else '')
near=sum(abs(x-st.mean(L))<25 for x in L)/len(L)
print(f'bullet length min {min(L)} max {max(L)} mean {st.mean(L):.0f}; {near:.0%} within 25 chars of the mean','(UNIFORM)' if near>0.7 else '','(no short bullet under 70 chars)' if min(L)>=70 else '','(no long bullet of 150+ chars)' if max(L)<150 else '')
praise=re.compile(r'\b(displaying|demonstrating|showcasing|exhibiting|highlighting)\b|\b(remarkable|exceptional|outstanding|excellent|strong)\s+(teamwork|leadership|communication|problem[- ]solving|skills)',re.I)
power=re.compile(r'^(Spearheaded|Pinpointed|Orchestrated|Championed|Revolutionized|Masterminded|Catalyzed|Pioneered|Utilized|Leveraged|Synergized|Architected|Streamlined|Empowered)\b')
irreg={'oversaw','undertook','drew','rebuilt','rewrote','taught','bought','understood','built','led','ran','set','cut','wrote','took','kept','made','drove','grew','won','brought','sold','fought','found','held','met','put','read','sent','spent','began','chose','gave','got','saw','shut','split','spun','stood','told','thought','co-led'}
for r in roles:
    for b in r['work']:
        if praise.search(b): print('SELF-PRAISE',b[:80])
        if power.search(b): print('POWER WORD',b.split()[0],'|',b[:60])
    past=[b.split()[0].lower().endswith('ed') or b.split()[0].lower() in irreg for b in r['work']]
    for b,p in zip(r['work'],past):
        if (r['end']!=9999 and not p) or (r['end']==9999 and len(past)>1 and p!=(sum(past)*2>len(past))):
            print('TENSE DRIFT',b[:70])
    txt=' '.join(r['bul']).lower(); seen=set()
    for k in sorted(REL,key=len,reverse=True):
        if re.search(r'(?<![\w.])'+re.escape(k)+r'(?![\w])',txt) and not any(k in s for s in seen):
            seen.add(k)
            if REL[k]>r['end']: print(f"ANACHRONISM {k} ({REL[k]}) listed on a role ending {r['end']}: {r['label']}")
            elif r['end']!=9999 and REL[k]>=r['end']-1 and r['end']-r['start']>=2: print(f"CHECK {k} ({REL[k]}) only existed in the last part of a {r['start']}-{r['end']} role")
stacks=[set(x.strip().lower() for x in re.split(r'[,:]',' '.join(r['stack']))[1:]) for r in roles]
for i in range(len(stacks)):
    for j in range(i+1,len(stacks)):
        a,b=stacks[i],stacks[j]
        if a and b and min(len(a),len(b))>=5 and len(a&b)/min(len(a),len(b))>=0.9: print(f'NEAR-IDENTICAL STACKS roles {i+1} and {j+1} share {len(a&b)}/{min(len(a),len(b))} tools')
edu=re.search(r'EDUCATION(.*)',t,re.S)
if edu:
    for m in dr.finditer(edu.group(1)):
        es,ee=int(m.group(2)),int(m.group(4)) if m.group(4) else 9999
        for r in roles:
            if r['start']<ee and r['end']>es and not re.search(r'intern|part[- ]time|contract|assistant',r['label']+r['head'],re.I):
                print(f"STUDY OVERLAP: role {r['start']}-{r['end']} overlaps study {es}-{ee}: {r['head'] or r['label']}")
dates=sorted((r['start'],r['end']) for r in roles)
for (s1,e1),(s2,e2) in zip(dates,dates[1:]):
    if s2-e1>=1: print(f'GAP? {e1} to {s2} (check months)')
EOF
```

## What to return

1. The full final resume in a code block, ready to paste.
2. "What changed": short bullets, with section F (US English) changes and tense fixes listed separately. Include the number density and percentage count before and after, and the bullet counts per role.
3. "Intentional imperfections": each planned G13 imperfection, quoted, with its clean version and whether it was kept from the source or added.
4. "For you to decide": G3, G5, G7, G7b, G7c, G10, G12, G15 and G9 flags that need the candidate's input, each one line, with suggested wording ready to paste (plain or rounded figures, plainer verb, where a moved keyword goes, which tool to drop from which role, the question to ask about an overlap or gap).

No draft section and no pattern-by-pattern commentary. The user wants the resume and the decisions.