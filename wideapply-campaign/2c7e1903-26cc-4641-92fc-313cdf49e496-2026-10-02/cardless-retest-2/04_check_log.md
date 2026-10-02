# Check Log — Agrima Jain / Cardless

## Stage 4: First check

**Verdict**: HR: Pass. Hiring manager: Pass. Overall: Passes both.

**House rule override applied**: HR-2 (location) is scored PASS unconditionally per repo CLAUDE.md ("Treat relocation as possible (location gate passes)"), regardless of the candidate's stated "not willing to relocate" answer in her source profile. The resume header already carries "(able to relocate)" from the stage 3 override. No override was needed to flip a Fail to Pass here since the house rule was applied before this check ran; this line documents that the check was run with the override already in effect, not that a Fail was manually flipped.

| ID | Check | Verdict | Evidence (short quote, section) | Why |
|---|---|---|---|---|
| HR-1 | Work authorization | Confirm | Not on CV | Form knockout, answered on application, not visible on CV |
| HR-2 | Location (based in SF or willing to relocate) | Pass (house-rule override) | "Boston, MA (able to relocate)" (header) | Relocation always passes per CLAUDE.md house rule, independent of the candidate's stated relocation preference |
| HR-3 | Degree | Pass (NN, not a gate) | "Master of Science, Computer Science - Northeastern University" (Education) | Not a listed JD requirement; presence of a degree is a bonus, absence would not have failed it either |
| HR-4 | Years in backend-titled roles | Pass | "Founding Software Engineer" (HappyMonk, 2021-01 to 2023-11); "AI/ML Engineer (Backend Systems)" (Codametrix, present) (Experience) | 2+ years in Software-Engineer-equivalent titles, well past the open mid-level band |
| HR-5 | Required tool/language | Pass | "Designed FastAPI microservices..." (Codametrix); "FastAPI and Node.js" (HappyMonk) (Experience) | Modern backend language and ecosystem shown in real production roles |
| HR-6 | Regulated/high-stakes keyword | Pass | "working with clinical stakeholders to adjust the system under real operating constraints" (Codametrix) | Regulated-domain keyword present near backend project work, not just in Skills |
| HR-7 | Salary expectation | Confirm | Not on CV | Form knockout, answered on application; wide band unlikely to filter |
| HM-1 | Production backend service ownership | Pass | "Designed FastAPI microservices that processed 1,000+ records daily from internal and third-party sources into one production pipeline backed by PostgreSQL." (Codametrix) | Named, scoped backend service built and run end to end |
| HM-2 | Distributed systems / API / DB fundamentals | Pass | "Built the retrieval and extraction layer behind a document pipeline spanning 300,000+ records, holding inference latency in the 120-200ms range." (Codametrix) | API design, database, and infrastructure work shown at project level, not a Skills-list mention |
| HM-3 | Regulated / high-stakes environment judgment | Pass | "Instrumented the service with monitoring and observability... working with clinical stakeholders to adjust the system under real operating constraints." (Codametrix) | Concrete example of handling a compliance-sensitive, clinical-data constraint |
| HM-4 | Cross-system / ambiguity-to-production ownership | Pass | "Partnered with customers, as one of the first engineers on the team, to pin down problems that were not fully defined at the outset, then scoped and delivered a fix without a detailed spec to start from." (HappyMonk) | Direct evidence of taking an ambiguous problem through to a delivered fix |
| HM-ALT (likely fifth, borderline) | External partner API or reliability/observability | Pass (via observability) | "Instrumented the service with monitoring and observability so issues in live inference could be caught early." (Codametrix) | H4 (observability) is Strong; this waivable fifth check is satisfied even though it does not gate the result either way |

## YEARS table

| Role | Title | Dates | Months | Counts toward "2+ years backend-titled" |
|---|---|---|---|---|
| HappyMonk AI Labs | Founding Software Engineer | Jan 2021 - Nov 2023 | 34 | Yes |
| Codametrix | AI/ML Engineer (Backend Systems) | Sep 2025 - Present | ~13 (through Oct 2026) | Yes |

Total full-time years ~3.9, computed from the fixed dates; exceeds the 2+ year HR-4 threshold comfortably.

## Confirm with the candidate

- HR-1 (work authorization): answered on the application form, not visible on the CV. Profile material states US citizen, no sponsorship needed.
- HR-7 (salary expectation): answered on the application form; band is wide ($160k-$295k) and unlikely to be a real filter.

## Fixes

None required. All HR and hiring manager checks pass; no Borderline or Fail items.

## Ranking among passes

Both screens pass. Per `01_pass_list.md` Step 5 ranking: this candidate has no fintech/payments/lending experience (N1, ranks first among preferred items) and no named workflow-orchestration/event-streaming tool (N2); she ranks on the strength of the regulated-environment (healthcare) pattern and strong production-backend fundamentals rather than on N1/N2.

**Final result: PASS**

## Stage 6: Second check

No content changed in `03_ideal_cv.md` between stage 4 and stage 6 (stage 5's humanize pass was already folded into the stage 3 draft; the final recheck found nothing left to fix). Re-running the same check register against the same CV reproduces the stage 4 result.

**Verdict**: HR: Pass. Hiring manager: Pass. Overall: Passes both.

| ID | Check | Verdict | Evidence (short quote, section) | Why |
|---|---|---|---|---|
| HR-1 | Work authorization | Confirm | Not on CV | Form knockout, answered on application |
| HR-2 | Location (based in SF or willing to relocate) | Pass (house-rule override) | "Boston, MA (able to relocate)" (header) | Relocation always passes per CLAUDE.md house rule |
| HR-3 | Degree | Pass (NN, not a gate) | "Master of Science, Computer Science - Northeastern University" (Education) | Not a listed JD requirement |
| HR-4 | Years in backend-titled roles | Pass | "Founding Software Engineer" (HappyMonk); "AI/ML Engineer (Backend Systems)" (Codametrix) (Experience) | ~3.9 computed full-time years in Software-Engineer-equivalent titles |
| HR-5 | Required tool/language | Pass | "Designed FastAPI microservices..." (Codametrix) | Modern backend language and ecosystem in production roles |
| HR-6 | Regulated/high-stakes keyword | Pass | "working with clinical stakeholders..." (Codametrix) | Regulated-domain keyword near backend project work |
| HR-7 | Salary expectation | Confirm | Not on CV | Form knockout |
| HM-1 | Production backend service ownership | Pass | "Designed FastAPI microservices that processed 1,000+ records daily..." (Codametrix) | Named, scoped service built and run end to end |
| HM-2 | Distributed systems / API / DB fundamentals | Pass | "Built the retrieval and extraction layer behind a document pipeline..." (Codametrix) | API, database and infra work at project level |
| HM-3 | Regulated / high-stakes environment judgment | Pass | "...working with clinical stakeholders to adjust the system under real operating constraints." (Codametrix) | Concrete handling of a clinical-data constraint |
| HM-4 | Cross-system / ambiguity-to-production ownership | Pass | "Partnered with customers... to pin down problems that were not fully defined at the outset, then scoped and delivered a fix..." (HappyMonk) | Direct evidence of ambiguity-to-delivery ownership |
| HM-ALT (likely fifth) | External partner API or reliability/observability | Pass (via observability) | "Instrumented the service with monitoring and observability..." (Codametrix) | Satisfied; non-gating either way |

## YEARS table

Unchanged from stage 4: ~3.9 full-time years (HappyMonk 34 months + Codametrix ~13 months), exceeding the 2+ year HR-4 threshold.

## Confirm with the candidate

Same as stage 4: HR-1 (work authorization) and HR-7 (salary expectation), both form-level, not visible on the CV.

## Fixes

None required.

## Ranking among passes

Both screens pass. No fintech/payments/lending experience (N1) or named workflow-orchestration/event-streaming tool (N2); ranks on the strength of the regulated-environment (healthcare) pattern and production-backend fundamentals.

**Final result: PASS**
