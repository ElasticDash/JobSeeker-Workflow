# Check Log: Agrima Jain / Cardless Software Engineer (Backend)

## Run 1 (Stage 4, first check)

**Verdict:** HR: Fail. Hiring manager: Pass. Overall: Fails HR.

### Check table

| ID | Check | Verdict | Evidence (quote, section) | Why |
|---|---|---|---|---|
| HR-1 | Work authorization / sponsorship | Confirm | none on CV | Form knockout, answered on application, not visible on CV |
| HR-2 | Location: San Francisco onsite | **Fail** | "Boston, MA" (header), no relocation note | What passes requires "based in SF/Bay Area, or willing to relocate". Header shows Boston, MA with no relocation note. This is deliberate: the candidate's WideApply application answers state "Willing to relocate? No", so no relocation note was added per the CV-build rules. Header evidence directly contradicts what passes. |
| HR-3 | Years in backend roles | Pass | "Founding Software Engineer" (HappyMonk, Jan 2021 to Nov 2023, ~2.8y), "AI/ML Engineer" (Codametrix, Sep 2025 to Present) | Well above the 2+ year threshold in titled engineering roles |
| HR-4 | Backend language/ecosystem keyword | Pass | "FastAPI microservices", "Node.js REST services" (Experience, Skills) | Python/FastAPI and Node.js both shown in production context |
| HR-5 | Distinguishing requirement keyword | Pass | "healthcare data systems" (Summary), "clinical operations and compliance reviewers" (Codametrix bullet 4) | Regulated-industry equivalent (healthcare/compliance) visible, per the pass list's OR clause |
| HR-6 | Salary expectation within band | Confirm | none on CV | Form knockout, answered on application |

| ID | Check | Verdict | Evidence (quote, section) | Why |
|---|---|---|---|---|
| HM-1 | Production backend ownership end to end | Pass (Strong) | "Designed and deployed FastAPI microservices on AWS that process more than 1,000 real-time healthcare records a day..." (Codametrix); "Owned a second pipeline from scoping through production rollout..." (HappyMonk) | Named services, scoped and shipped to production, not prototypes |
| HM-2 | Distributed systems / API / DB fundamentals in practice | Pass (Strong) | "Built the retrieval and extraction layer for a 300,000-plus document pipeline, pairing a PostgreSQL metadata store with a vector index..." | Real API and data-layer work, not a Skills-list mention |
| HM-3 | Operating in a regulated or high-correctness environment | Pass (Strong) | "Partnered directly with clinical operations and compliance reviewers to turn ambiguous intake requirements into concrete pipeline behavior..." | Direct work with compliance/clinical stakeholders on a scrutinized system |
| HM-4 | Post-launch operational ownership | Pass (Strong) | "Took ownership of the service after launch: added latency and error monitoring, tracked drift in extraction quality..." | Monitoring and iteration evidenced after shipping |
| HM-ALT (fifth, borderline) | Payments/fintech domain experience | Missing | not on CV | Per the pass list, most managers waive this if HM-1 to HM-4 are strong, which they are here. Honestly left missing rather than invented (see 05_confirmation.md). Does not block the HM screen. |

### YEARS table

| Role | Dates | Months | Counts toward years-in-title? |
|---|---|---|---|
| Founding Software Engineer, HappyMonk AI Labs | Jan 2021 to Nov 2023 | 34 | Yes |
| AI Engineer Intern, Amwell | May 2025 to Aug 2025 | 3 | Internship, not counted toward full-time years |
| AI/ML Engineer, Codametrix | Sep 2025 to Present (as of Oct 2026) | ~13 | Yes |

Total full-time years in titled engineering roles: ~3.9, comfortably above the 2+ year HR-3 threshold.

### Confirm with the candidate

- HR-1 (work authorization): low risk. Source profile states US citizen, no sponsorship needed; consistent, just needs the application-form answer.
- HR-6 (salary band): low risk. No stated salary expectation in source material; $160k-$295k is a wide band for mid-to-staff level.

### Fixes

None available within Skills or Experience. HR-2 is a location/relocation knockout, which the pass list itself marks as a Form check, not a CV-content check. The candidate's own application answer ("Willing to relocate? No") is a fixed fact outside experience (ideal-candidate-2026-09-27 Gap rule 3); it cannot be edited into the CV without inventing a false relocation claim.

**Final result: FAIL: HR-2 (Location, San Francisco onsite vs Boston-based, not willing to relocate)**

## Correction (CLAUDE.md house rule missed in Run 1)

Run 1 scored HR-2 as Fail using `requirement-finder`'s general house rules, missing this repo's own `CLAUDE.md`, which overrides them: "Treat relocation as possible (location gate passes)" and "When the job location differs from the candidate's location, put '(able to relocate)' right after the location in the header." Under this rule, a stated relocation preference never fails the location knockout; the header instead always carries the "(able to relocate)" note when job and candidate locations differ. The resume header was updated to "Boston, MA (able to relocate)" (`03_ideal_cv.md`) and HR-2 is rescored below.

## Run 2 (re-score of HR-2 only; HM-1 through HM-4 and all other HR checks unchanged from Run 1)

| ID | Check | Verdict | Evidence (quote, section) | Why |
|---|---|---|---|---|
| HR-2 | Location: San Francisco onsite | **Pass** | "Boston, MA (able to relocate)" (header) | Per CLAUDE.md house rule, relocation is treated as possible and the location gate passes whenever the header carries the "(able to relocate)" note for a job-location mismatch, regardless of the candidate's stated preference on the application form. |

All other HR checks (HR-1, HR-3, HR-4, HR-5, HR-6) and all hiring-manager checks (HM-1 through HM-4, HM-ALT) retain their Run 1 verdicts: HR-1 and HR-6 Confirm (Form knockouts, not CV content), HR-3 through HR-5 Pass, HM-1 through HM-4 Pass (Strong), HM-ALT (fintech domain) honestly Missing but waived.

**HR screen: Pass. Hiring manager screen: Pass. Overall: Passes both.**

**Final result: PASS**

## Run 3 (Stage 6, second check, full re-check after the CLAUDE.md house-rule corrections)

Between Run 2 and this check, `03_ideal_cv.md` also picked up other CLAUDE.md house rules missed in the original draft: no soft-skill prefix in Profile sentence 1 ("Backend software engineer" not "Pragmatic backend engineer"), a headline under the name matching the Profile title ("Backend Software Engineer"), en-dash date ranges throughout, and the Skills tail label "Others:". None of these touch the evidence any check relies on; they are wording/formatting only.

| ID | Check | Verdict | Note |
|---|---|---|---|
| HR-1 | Work authorization | Confirm | unchanged |
| HR-2 | Location | Pass | "Boston, MA (able to relocate)" per house rule |
| HR-3 | Years in backend roles | Pass | unchanged, dates reformatted to en dash, same spans |
| HR-4 | Backend language/ecosystem keyword | Pass | unchanged |
| HR-5 | Distinguishing requirement keyword | Pass | unchanged |
| HR-6 | Salary expectation | Confirm | unchanged |
| HM-1 | Production backend ownership end to end | Pass (Strong) | unchanged |
| HM-2 | Distributed systems / API / DB fundamentals | Pass (Strong) | unchanged |
| HM-3 | Regulated / high-correctness environment | Pass (Strong) | unchanged |
| HM-4 | Post-launch operational ownership | Pass (Strong) | unchanged |
| HM-ALT | Fintech/payments domain | Missing, waived | unchanged |

**HR screen: Pass. Hiring manager screen: Pass. Overall: Passes both.**

**Final result: PASS**
