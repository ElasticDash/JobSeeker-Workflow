# Check log — Senior AI Platform Engineer, Hasbro / Wizards of the Coast

## Run 1 (Stage 4, first check)

**Verdict line:** HR: Borderline. Hiring manager: Fail. Overall: Passes HR (borderline), fails HM.

| ID | Check | Verdict | Evidence (short quote, section) | Why |
|---|---|---|---|---|
| HR-1 | Work authorization | Confirm | Not stated on CV | Visible only via WideApply application questions (US citizen, no sponsorship needed), not the CV itself |
| HR-2 | Location (Renton WA / relocate) | Confirm | Header: "Boston, MA" | Candidate's own WideApply answers conflict ("no location preference, open to anywhere in the US" vs "Willing to relocate: No"); not resolvable from the CV alone |
| HR-3 | Years in titled roles | Pass | "Founding Software Engineer" 2021-2023 (~2.8y), "AI/ML Engineer" 2025-present (~1.1y) | Well above the 2+ year floor |
| HR-4 | Required tools (2+ of 7) | Pass | "AWS" (multiple bullets), "Shipped Node.js and NestJS...on AWS Lambda" | AWS and the TypeScript-family stack (NestJS) both visible in Experience, not just Skills |
| HR-5 | LLM/AI keyword | Pass | "Ran prompt engineering cycles alongside LoRA fine-tuning..." (Codametrix) | Literal "prompt engineering" visible in a real project bullet |
| HR-6 | SDLC keyword | Pass | "Set up Docker, Git, and CI/CD deployment pipelines on AWS" (HappyMonk); "moved it through Docker and CI/CD" (Amwell) | CI/CD and Git both visible |
| HR-7 | Seniority/title match | Borderline (weak) | No "Senior" or lead title anywhere; Summary states "4 years of experience" | No senior-equivalent title held; continuous relevant full-time experience is broken by a ~20 month stretch (Dec 2023 to Aug 2025) spent in the Master's program with only a 3 month internship inside it, short of "4-5+ years of continuous relevant experience" the check calls for as the title-match substitute |

| ID | Check | Verdict | Evidence (short quote, section) | Why |
|---|---|---|---|---|
| HM-1 | Production LLM/agentic delivery | Pass | "Built RAG pipelines on OpenAI and Claude APIs with Pinecone..."; "chaining retrieval and LLM reasoning steps to power recommendations" (Amwell) | Named, production-deployed LLM/RAG systems with outcomes (extraction accuracy/hallucination tracking, 35% match-accuracy gain) |
| HM-2 | Internal developer-platform/tooling ownership | Fail | No bullet describes a tool, API, SDK, or platform feature adopted by other engineers or internal non-technical users | All production AI work across all three employers is customer-facing or clinical/healthcare-facing; the closest candidate, "Set up Docker, Git, and CI/CD deployment pipelines on AWS for the team" (HappyMonk), describes internal deployment tooling but at a 2-4 person founding-team scale, not a platform other engineers adopted. No evidence meets this check |
| HM-3 | Enterprise automation / SaaS integration | Pass | "Designed and deployed FastAPI microservices on AWS that process 1,000+ real-time healthcare records daily, pulling together several internal and third-party data sources into one production pipeline" | Enterprise healthcare SaaS automation with AI, multiple systems integrated |
| HM-4 | Cloud production deployment discipline | Pass | "Deployed production inference on AWS with PostgreSQL for metadata...added monitoring to watch latency, which held at 120-200ms" | Owned production deployment with monitoring/observability |

**YEARS table** (from fixed dates, source: 02_cv_analysis.md):

| Role | Window | Months | Type |
|---|---|---|---|
| Founding Software Engineer, HappyMonk AI Labs | 2021-01 to 2023-11 | 34 | Full-time |
| AI Engineer Intern, Amwell | 2025-05 to 2025-08 | 3 | Internship |
| AI/ML Engineer, Codametrix | 2025-09 to present (2026-10) | ~13 | Full-time |

Total full-time: ~47 months (~3.9 years). Continuous relevant full-time run ending today is only the Codametrix stretch, ~13 months; the HappyMonk stretch is separated from it by the Master's program (no full-time work 2023-12 through 2025-08, aside from the 3-month internship).

**Confirm with the candidate:**
- HR-1: work authorization, not visible on the CV itself (low risk; answered elsewhere on the application).
- HR-2: location/relocation, genuinely ambiguous between her own answers; worth asking directly before submitting to an onsite-only Renton, WA role (moderate risk).

**Fixes considered:**
- HR-7 and HM-2 are not fixable by further Skills/Experience editing without either inventing a title she never held (prohibited) or overstating a 2-4 person startup's internal CI/CD setup into "a developer platform other engineers adopted" (not credible, and explicitly against this run's instruction not to fabricate internal-platform ownership).

**Final result: FAIL: HM-2 (Fail, no evidence), HR-7 (Borderline, weak)**

## Stage 4A: Triage

Ran `cv-pass-gap-triage` reasoning in mode `first` over the above FAIL.

- HM-2 (internal developer-platform/tooling ownership): tested every role (Codametrix: healthcare SaaS vendor serving clinical customers, not internal engineering platform; Amwell: telehealth product work, not internal tooling; HappyMonk: founding engineer at a 2-4 person AI startup, internal CI/CD setup for a team that size does not plausibly rise to "a platform other engineers adopted"). No role can carry this requirement without materially overstating scope beyond what is credible. This is an era/employer-plausibility gap (Gap rule 2 territory), not a wording problem, so it is not fixable by `cv-pass-gap-fix` within its mandate (edit wording/emphasis inside Skills and Experience, not invent new scope).
- HR-7 (seniority/title match): no fixed-date arrangement produces a "Senior" title or an unbroken 4-5+ year run; this is a fixed-facts gap (dates, titles, education timing), explicitly outside what `cv-pass-gap-fix` may touch.

**Triage result: HANDOFF.**

Stopping the pipeline here per `ideal-cv-pipeline-v4`. No automatic fix round was consumed since the gaps are not of a fixable kind (fixed facts / plausibility ceiling, not a wording or emphasis problem).
