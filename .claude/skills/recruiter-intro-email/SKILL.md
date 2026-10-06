---
name: "recruiter-intro-email"
description: "Write the email a candidate sends to a recruiter or hiring manager right after submitting an application through the company's ATS - one per candidate per company, from the resume, JD, posting URL and recipient info. Use whenever the user wants a post-application intro/outreach email, not a cover letter and not a follow-up."
---

# Recruiter Intro Email

Writes the email a candidate sends to a recruiter or hiring manager right after submitting an application through the company's ATS. One email per candidate per company.

Triggers: "write a recruiter intro email", "draft an outreach email for this application", "write the email to send after applying", "recruiter intro".

Inputs: the candidate's resume (single source of truth), the JD, the job posting URL, the recipient's name and role if known, the candidate's location and the job location.
Output: subject line, email body, and short notes.

## 1. The lens

Write for a recruiter who gives the email about 10 seconds before deciding whether to open the resume. Every sentence must help them answer one of three questions fast:
1. Which job is this about, and is this person already in my pipeline?
2. Does this person fit the role's single most important requirement?
3. What do I do next?

Sentence test: could most other applicants for this role have written this sentence? If yes, cut it or replace it with something only this candidate could say.

## 2. The template

```
Subject: [Job Title] application – [Candidate Full Name]

Hi [First Name],          (fallback if unknown: "Hi [Company] team,")

[P1, 2 sentences] I just applied for the [Job Title](posting URL) role at [Company] and
wanted to introduce myself directly. [Why this company: one specific thing this role
works on per the JD, tied to the candidate's own work.]

[P2, 2 to 3 sentences] [Strongest match to the JD's top requirement first: what the
candidate built, where, and one number from the resume.] [One supporting point for the
next most important requirement.]

[P3, 1 sentence] [Motivation for this role, echoing the P1 hook.]

[Closer] My resume is attached. [Only if the job location differs: "I'm based in [City]
and open to relocating to [Job City]."] [One ask, ideally specific, e.g. "If it looks
like a fit, I'd be glad to walk you through [named project] on a short call."]

Thanks,
[Candidate Full Name]
[Phone with country code] | [LinkedIn URL]
```

## 3. Guidelines

### Structure and length
- Body 120 to 200 words. Hard cap 200.
- The first sentence names the role and says the application is in. The job title is hyperlinked to the company's own careers or ATS posting (Greenhouse, Lever, Ashby, Workday), never LinkedIn or a job board. Never paste a raw URL.
- Exactly one call to action. No second offer tacked on after the ask.
- No filler openers ("I hope this email finds you well", "I am writing to express my interest").

### Content
- P2 is not a JD walkthrough. Pick the one or two requirements that matter most. Never label sections ("On the must-haves:") or answer requirements one by one.
- Don't echo JD phrasing beyond the job title and product names. Restate requirements in the candidate's own terms.
- The why-company hook must be something the role actually works on per the JD, not an unrelated company product. It appears in P1 and is echoed in P3.
- Every claim, number, tool and project must trace to the resume. Copy numbers and qualifiers exactly. If a slot needs a fact the resume lacks, write around it and list the gap under "To verify".
- The email must not repeat the ATS cover letter word for word. Same story, shorter, rewritten.
- No em dashes. No self-description adjectives standing in for evidence ("passionate", "detail-oriented", "results-driven").

### Logistics
- Resume attached as a PDF named FirstName_LastName_Resume.pdf.
- Intended send window: within 24 to 48 hours of applying.

### Pre-delivery checks (fix before delivering)
- Signature: the phone and LinkedIn URL are copied CHARACTER-FOR-CHARACTER from
  the candidate's resume/profile input - never retyped from memory, and never
  carried over from a different candidate's draft earlier in the same session.
  This has failed in practice: a draft once shipped with a LinkedIn slug
  ("coryrowens") that had nothing to do with the candidate it was for
  ("Agrima Jain"), plus a phone number with no country code - a data bug, not
  just a formatting one.
- No unfilled brackets or placeholders.
- Word count is within the limit.
- Exactly one ask (call to action) in the whole body, and nothing at all
  after the signature block (no trailing "happy to also..." sentence tacked
  on past "Thanks,").
- If the posting says not to contact recruiters or to apply only through the portal, do not write the email. Say so instead.
- If another of our candidates has applied to the same company, flag it so the two emails don't read near-identical to the same recruiter.

**Run the checker, don't just eyeball it.** The lens above is prompt text, not
code - nothing stops a draft from quietly drifting past the word cap, missing
the greeting, carrying a second ask, or walking off with a prior candidate's
LinkedIn slug. Before delivering, write the draft to
`<scratchpad>/recruiter-intro-email/draft.json`:
```json
{
  "subject": "...",
  "body": "...",
  "candidateName": "...",
  "candidatePhone": "...",       // the REAL value from the resume/profile input, copied verbatim
  "candidateLinkedin": "...",    // the REAL value from the resume/profile input, copied verbatim
  "seniorRole": false            // true for a staff/principal/lead/director target role
}
```
then run `node <this skill's directory>/validate.mjs <scratchpad>/recruiter-intro-email/draft.json`.
If it reports `"pass": false`, the `violations` array names exactly what's
wrong - fix those specific things and re-run. Stop after 2 failed attempts
and deliver anyway, but list the remaining violations in the notes rather
than silently shipping a non-conforming email.

## 4. Limitations of the lens

- The 10-second scan rewards brevity, which can undersell senior candidates whose best evidence needs context. For staff, principal or leadership roles, allow P2 up to 4 sentences and the body up to 220 words rather than cutting the proof.
- Hiring managers read differently from recruiters: they care about the work more than requirement matching. When the recipient is the hiring manager, lead P2 with the problem solved and how, not with a requirement match.
- The underlying guidance comes mostly from vendor blogs (Fyxer, Mailbird, Juicebox) with no independent evidence comparing formats. Treat word counts and timing as defaults, not proven optimums.
- Some recruiters see a "just applied" email as noise, since the ATS already tells them. The email only earns its place by adding what the application can't: the specific company hook and one concrete achievement. If neither can be written honestly (thin resume, generic JD), say so in the notes rather than padding.
- Brevity can't fix a fit gap. If the resume doesn't support the JD's top requirement, lead with the strongest honest match and name the gap in the notes. Never stretch a claim.

## 5. Example

Original draft (about 320 words) failed the lens because it:
- ran well past the 200-word cap, with P2 alone around 140 words
- walked the JD's must-haves one by one under the label "On the must-haves:"
- reused JD phrases verbatim ("integrations with in-house, third-party, and open-source AI models", "debugging concurrent, networked systems", "partnering with Product")
- had two asks (a call, then a separate offer to walk through the pipeline)
- had no subject line or job link
- had a signature with a LinkedIn slug that didn't match the candidate's name and a phone number missing its country code

Rewritten version that passes (about 170 words):

```
Subject: AI Engineer application – Agrima Jain

Hi [First Name],

I just applied for the [AI Engineer](link) role through your careers page and wanted to
introduce myself directly. Deepgram's Voice Agent work is close to where my last four
years have gone, especially the infrastructure between the model and the user.

At HappyMonk AI Labs, I was the founding engineer taking speech-recognition and
object-detection models from prototype to real-time production on AWS. At Codametrix,
I now design and run FastAPI inference services processing healthcare records in real
time, with latency in the low hundreds of milliseconds, and build RAG pipelines on
OpenAI and Claude APIs, tracking extraction accuracy and hallucination rate across
iterations.

That mix of production speech work and close collaboration with product and clinical
stakeholders is why the end-to-end scope of this role appeals to me.

My resume is attached. If it looks like a fit, I'd be glad to walk you through the
Codametrix pipeline on a short call.

Thanks,
Agrima Jain
[Phone with country code] | [Correct LinkedIn URL]
```

## Output format

```
### [Company], [Role]
Subject: ...
[email]

Notes
- Hook: what the P1 hook is and where it appears in the JD
- Proof: which resume lines P2 draws on
- Left out: JD requirements the resume supports that were cut for length
- To verify: placeholders, signature issues, fit gaps
```
