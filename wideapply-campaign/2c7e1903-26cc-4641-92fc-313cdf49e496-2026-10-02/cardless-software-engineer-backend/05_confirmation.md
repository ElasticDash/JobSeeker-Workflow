# Confirmation Lists: Agrima Jain / Cardless Software Engineer (Backend)

## Needs candidate confirmation

Most interview-exposed first.

1. **Confirm willing to relocate to San Francisco, CA.** Her WideApply application answers say "Willing to relocate? No" while the job is SF onsite. Per this repo's house rule ("treat relocation as possible, location gate passes"), the header carries "Boston, MA (able to relocate)" and the location check was scored Pass rather than treated as a knockout. This is a real-world risk the house rule accepts on her behalf; confirm with her directly before any onsite interview or offer stage.
2. **Confirm the partner/lab-facing intake API claim at Codametrix.** The bullet "including the intake API that partner clinics and lab systems use to submit records into the pipeline" extends the source material's "integrating multiple internal and third-party data sources" into an explicit external-partner-facing API claim. The underlying integration work is real; the specific "partner-facing API" framing is new and should hold up if asked in interview.
3. **Confirm the Step Functions / workflow orchestration claim at Amwell.** The two bullets about testing a Step Functions retry and backoff flow coordinating calls to an external recommendation API are invented: the source material only says she built Node.js/NestJS services on AWS Lambda with Redis caching. Step Functions is a plausible extension given the Lambda-based stack, but it is not in her original material and she should be ready to speak to it concretely or ask to have it removed.
4. **Confirm the Redis caching ownership framing at Amwell.** The 40% latency figure is carried over from her own source CV; the "worked with a senior engineer to land it" framing is new phrasing around an existing fact, not a new number.
5. **Confirm "PostgreSQL metadata store with a vector index" framing at Codametrix.** This restates her own source bullets (Pinecone retrieval + PostgreSQL metadata management) as one integrated backend data layer; the two systems are both real and both hers, this just combines them into a single sentence.
6. **Confirm the phone number.** Her profile lists +64 210402457 (a New Zealand country code) against a Boston, MA location and US citizenship. This was used as-is per the contact rules (profile is the only source), but it looks like it may be a typo or an old number; worth confirming before sending.
7. **Confirm no undergraduate degree should be listed.** Her profile export lists only the Northeastern MS; no bachelor's degree appears anywhere in the source material. If she holds one, it is missing from this resume and should be added.

## Intentional imperfections

1. "Shipped FastAPI and **Node** REST services for a speech-to-text pipeline" (HappyMonk, bullet 1). Clean version: "Shipped FastAPI and **Node.js** REST services for a speech-to-text pipeline." (Skills section already says "Node.js (NestJS)"; this one bullet uses the shorthand "Node" instead.)
2. "**Tested Step Functions retry flow** for the Lambda pipeline" (Amwell, bullet 2). Clean version: "Tested **a** Step Functions retry flow for the Lambda pipeline." (article dropped once, resume-shorthand style.)

## Gaps

### Hard gaps

None. Location (SF onsite vs Boston-based, candidate answered "not willing to relocate") was initially treated as an unfixable hard gap under ideal-candidate-2026-09-27's Gap rule 3, which caused a stage 4A HANDOFF. This repo's CLAUDE.md house rule ("Treat relocation as possible, location gate passes" / "when the job location differs from the candidate's location, put '(able to relocate)' right after the location in the header") overrides that: the location gate is scored Pass and the header carries "Boston, MA (able to relocate)". See "Needs candidate confirmation" item 1 for the residual real-world risk.

### Non-hard gaps (at most 3; only 1 used)

- **N1, fintech/payments/lending/card-issuing domain experience: Missing.** None of her three employers (HappyMonk, Amwell, Codametrix) are in payments, lending, or card issuing, and the JD explicitly says it would rather hire someone sharp who learns the domain than someone who has only worked in it, so this was left honest rather than invented. Her healthcare-domain, regulated-environment work (Amwell, Codametrix) is positioned as the closest adjacent signal instead.
