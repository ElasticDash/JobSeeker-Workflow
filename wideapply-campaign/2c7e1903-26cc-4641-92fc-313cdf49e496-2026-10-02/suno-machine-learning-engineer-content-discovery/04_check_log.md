# CV Pass Check Log

## Stage 4: First check (on 03_ideal_cv.md v1)

HR outcome: Borderline. Hiring manager outcome: Borderline. Overall: Borderline (counts as FAIL for the final result).

| ID | Check | Verdict | Evidence (short quote, section) | Why |
|---|---|---|---|---|
| HR-1 | Work authorization | Confirm | n/a | Knockout, answered on application form, not visible on CV |
| HR-2 | Location (SF onsite or willing to relocate) | Confirm | "Boston, MA" (header) | Knockout; candidate's own profile data conflicts on relocation willingness (see 05_confirmation.md item 1) |
| HR-3 | Salary expectation | Confirm | n/a | Knockout, answered on application form |
| HR-4 | Degree (PhD or equivalent experience) | Borderline (buried) | Education: "Master of Science, Computer Science"; equivalence argument sits in Experience bullets ("Designed a learned reranking model... comparing pairwise ranking losses") | Degree checks are Education-section checks; Education alone shows only an MS, no PhD. The JD's "or equivalent experience" escape hatch is argued through Experience bullets, which a few-second recruiter skim of Education will not see. Evidence is real but buried from the skim's point of view. |
| HR-5 | Years / seniority signal | Pass | "AI/ML Engineer", "AI Engineer Intern", "Founding Software Engineer" with model-building bullets throughout | Titles plus bullets read as applied ML engineering, not analytics-only or software-only |
| HR-6 | Required tools (Python, PyTorch) | Pass | "Python, PyTorch" (Skills); "in PyTorch" (multiple bullets) | Both visible and used in context |
| HR-7 | Distinguishing keyword (ranking/recommendation/personalization) | Pass | "ranking and relevance modeling" (Skills); "ranking step into a provider-recommendation feature" (Amwell) | Visible in context, not just a bare keyword |
| HM-1 | First-principles model design | Pass (Strong) | "Designed a learned reranking model... comparing pairwise ranking losses to pick the one that held up best offline" (Codametrix) | Names the model task, the training signal, and the method (pairwise ranking loss, an optimization-based approach); concrete and specific |
| HM-2 | Recommendation/ranking on real interaction data | Pass (Strong) | "training it on edit and correction signals from reviewers as an implicit feedback source" (Codametrix); "scoring candidate providers using historical match outcomes as the training signal... raising match accuracy by 35%" (Amwell) | Two independent roles, named signal, named metric |
| HM-3 | Production deployment under latency/throughput constraints | Pass (Strong) | "score every retrieved passage within the 120 to 200 millisecond window... serving over 1,000 real-time healthcare records a day" (Codametrix) | Specific latency and scale numbers with an explicit size-vs-speed tradeoff |
| HM-4 | Experimentation / causal evaluation | Borderline (weak) | "staging two configurations side by side in production and using the accuracy lift on held-out extraction cases to decide which one shipped" (Codametrix) | Mixes "in production" staging with "held-out" (normally an offline-evaluation term) in the same clause, which reads as an internal inconsistency rather than a clean A/B test or causal analysis; the mechanism is closer to an offline comparison than the JD's "large-scale experiments and causal analyses" |

YEARS table: not separately run as a standalone section pass (effort-scoped); years signal taken at face value from 02_cv_analysis.md: ~3 years 11 months full-time, consistent with the Profile's "4 years" (rounds to 4 per the half-up rule, no years-edge issue).

Confirm with the candidate: HR-1 (work authorization, low risk given profile states US citizen), HR-2 (location/relocation, high risk given the profile's internal contradiction), HR-3 (salary expectation, low risk given stated range is standard for the role).

Fixes, highest weight first:
1. HM-4: rewrite the "staging two configurations..." bullet to remove the offline/production terminology clash and read as a cleaner applied evaluation, so it reads as a clear Strong match rather than Borderline.
2. HR-4: strengthen the earliest-read signal (Profile sentence 1-2 or headline) so the "equivalent experience" argument is not entirely buried in Experience bullets a recruiter may skim past.

**Final result: FAIL: HR-4 (Borderline, buried), HM-4 (Borderline, weak)**
