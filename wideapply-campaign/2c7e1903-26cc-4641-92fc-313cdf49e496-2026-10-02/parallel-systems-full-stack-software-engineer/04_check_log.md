# Check Log

## Run 1 (Stage 4, first check) - 2026-10-02

HR outcome: Fail (HR-2 Fail). Hiring manager outcome: Borderline (HM-4 Borderline). Overall: Fails HR.

### Check register and results

| ID | Check | Verdict (Borderline cause) | Evidence (short quote, section) | Why |
|---|---|---|---|---|
| HR-1 | Work authorization (Form) | Confirm | Not shown on CV (not expected to be) | Form-only knockout; profile material states US citizen, no sponsorship needed, so risk is low, but it is not visible on the CV itself |
| HR-2 | Location: based in/around LA or willing to relocate (Form) | **Fail** | Header: "Boston, MA" with no relocation note (Experience/header section) | Candidate's own application material states "Willing to relocate? No," and she is not based in or near Los Angeles. Per the ideal-candidate skill's header location rule this was correctly left unclaimed rather than fabricated. This is a real, known Fail, not merely an unknown Confirm item |
| HR-3 | Degree: Bachelor's CS/CE/related or equivalent (Skim) | Pass | "Master of Science, Computer Science, Northeastern University... GPA 3.9" (Education) | MS in CS exceeds the stated bachelor's-or-equivalent requirement |
| HR-4 | Years in titled roles (Skim) | Pass | Not a gate per the pass list | JD explicitly does not require production years |
| HR-5 | Required stack keywords: 2+ of TypeScript/React/Rust (Skim) | Pass | Skills: "Python, TypeScript, Rust, SQL, FastAPI, Node.js, NestJS, React" (Skills) | All three named keywords present, plus reinforced in Experience/Projects bullets |
| HR-6 | Distinguishing requirement keyword: Rust or Electron (Skim) | Pass | Skills line and "Log Analyzer CLI... Taught myself Rust" (Skills, Projects) | "Rust" is visible in both Skills and a named project |
| HR-7 | Overqualification (Skim) | Borderline (years-edge) | ~4 computed years, MS CS, current title "AI/ML Engineer" (Experience, Education) | Sits at the upper edge of a role explicitly pegged to 0-2 years and a narrow junior salary band; a Master's degree plus ~4 years can read as likely to expect pay above the $122k-$141k band |

| ID | Check | Verdict (Borderline cause) | Evidence (short quote, section) | Why |
|---|---|---|---|---|
| HM-1 | Shipped TypeScript/React (or equivalent) work | Pass | "Put together a lightweight TypeScript and React dashboard for monitoring extraction accuracy and pipeline health" (Experience, Codametrix) | Named artifact and purpose in an Experience bullet, not just a Skills mention; MedFlow project (Projects section) reinforces |
| HM-2 | Fast pickup of an unfamiliar language or tool | Pass | "Adapted Whisper and Wav2Vec2... then switched to a different computer vision stack to train a YOLOv5 detector..." (Experience, HappyMonk) | Experience-section evidence of picking up a new ML domain and shipping it to production; "Log Analyzer CLI" Rust project (Projects) reinforces |
| HM-3 | End-to-end feature ownership | Pass | "...scoping loosely defined problems on my own and owning delivery from design through rollout..." (Experience, HappyMonk) | Full-cycle ownership narrative in Experience, reinforced by Codametrix stakeholder-feedback bullet |
| HM-4 | Collaboration with non-software stakeholders to define interfaces | Borderline (weak) | "Worked directly with clinical stakeholders to pin down requirements and shaped the system design around their feedback" (Experience, Codametrix); "Partnered directly with customers... to understand their workflows" (Experience, HappyMonk) | Evidence is genuine and Experience-level, satisfying "another non-engineering counterpart," but it is domain-adjacent (clinical/customer, not product/vehicle/systems engineers), which is a weaker match to what this check is really testing |
| HM-ALT (likely fifth, borderline) | Backend/API/data-model exposure | Pass | "Built and deployed FastAPI microservices on AWS, backed by PostgreSQL for metadata..." (Experience, Codametrix) | Strong, reinforces the hiring manager's likely-waived fifth check |

### YEARS table

| Role | Dates | Months | Counted as |
|---|---|---|---|
| HappyMonk AI Labs, Founding Software Engineer | Jan 2021 to Nov 2023 | 34 | Full-time |
| Amwell, AI Engineer Intern | May 2025 to Aug 2025 | 3 | Internship (not counted toward full-time years) |
| Codametrix, AI/ML Engineer | Sep 2025 to Present (as of 2026-10-02) | ~13 | Full-time |
| **Total full-time** | | | **~3.9 years, rounds to 4** |

### Confirm with the candidate

- HR-1, work authorization: not visible on the CV by design; low risk given the candidate's own material states US citizen, no sponsorship needed, but the hiring company must still confirm this on the application form.
- HR-2, location/relocation: this is not a "confirm," it is a known Fail given her stated unwillingness to relocate. Flagged here for visibility alongside the other Confirm items.

### Fixes

No resume-content fix exists for HR-2 (relocation is a fixed fact about the candidate's stated preference, not something Skills or Experience wording can change). HR-7 and HM-4 are addressable in principle by sharpening the overqualification framing and strengthening the stakeholder-collaboration bullet toward a more literal hardware/product match, but per the pipeline's rules a 4A triage must first assess whether any of this is fixable before any further editing happens.

**Final result: FAIL: HR-2 (Fail, location/relocation mismatch), HR-7 (Borderline, years-edge), HM-4 (Borderline, weak)**

## Run 2 (Stage 4A, rerun after HM-4 fix) - 2026-10-02

HR outcome: Fail (HR-2 Fail, unchanged). Hiring manager outcome: Pass (HM-4 now Pass). Overall: Fails HR.

### Check register and results (only checks whose evidence changed are re-detailed; unchanged checks carry their Run 1 verdict)

| ID | Check | Verdict (Borderline cause) | Evidence (short quote, section) | Why |
|---|---|---|---|---|
| HR-1 | Work authorization (Form) | Confirm | Unchanged from Run 1 | No change |
| HR-2 | Location: based in/around LA or willing to relocate (Form) | **Fail** (unchanged) | Header: "Boston, MA", no relocation note | The CV edit did not and could not touch this; the candidate's stated unwillingness to relocate is a fixed fact outside resume content, as established in the stage 4A triage (routed "not a gap," listed under Confirm) |
| HR-3 | Degree | Pass | Unchanged from Run 1 | No change |
| HR-4 | Years (not a gate) | Pass | Unchanged from Run 1 | No change |
| HR-5 | Required stack keywords | Pass | Unchanged from Run 1 | No change |
| HR-6 | Distinguishing keyword (Rust/Electron) | Pass | Unchanged from Run 1 | No change |
| HR-7 | Overqualification | Borderline (years-edge), unchanged | Unchanged from Run 1 | Per the stage 4A triage, this was routed Ignore as an accepted residual risk tied to fixed dates/degree, not something this bullet-level fix touched. Re-scored here from the CV alone: still Borderline for the same reasons as Run 1 |
| HM-1 | Shipped TypeScript/React work | Pass | Unchanged from Run 1 | No change |
| HM-2 | Fast pickup of unfamiliar language/tool | Pass | Unchanged from Run 1 | No change |
| HM-3 | End-to-end feature ownership | Pass | Unchanged from Run 1 | No change |
| HM-4 | Collaboration with non-software stakeholders to define interfaces | **Pass** (was Borderline/weak) | "Worked directly with clinical stakeholders to pin down ambiguous requirements, then turned what they described into concrete decisions about the extraction schema and API responses the rest of the system relied on..." (Experience, Codametrix) | The rewritten bullet now shows a concrete translation from ambiguous stakeholder input to specific system/interface decisions (extraction schema, API responses), satisfying "turn ambiguous operational needs into a working interface" at Strong level. Domain remains clinical/healthcare rather than literally hardware/vehicle, but the check's own wording allows "another non-engineering counterpart" |
| HM-ALT | Backend/API/data-model exposure | Pass | Unchanged from Run 1 | No change |

### YEARS table

Unchanged from Run 1: ~3.9 years full-time, rounds to 4 (HappyMonk 34 months + Codametrix ~13 months to date; Amwell internship not counted).

### Confirm with the candidate

- HR-1, work authorization: unchanged, low risk per profile material.
- HR-2, location/relocation: unchanged, known Fail. This is the check that keeps the overall result at Fail. The candidate's application material says she will not relocate to Los Angeles for an onsite-only role; no CV edit resolves this.

### Fixes

HM-4 is resolved. HR-7 remains an accepted residual risk per the stage 4A triage (Ignore route, not further addressed). HR-2 has no available CV fix: it is a fixed fact about the candidate's stated relocation preference, not resume wording, confirmed again in this rerun.

**Final result: FAIL: HR-2 (Fail, location/relocation mismatch)**

## Correction to Run 2 - 2026-10-02

The repo's `CLAUDE.md` (Screening and checks) carries a permanent house rule that was missed in Runs 1-2: "Treat relocation as possible (location gate passes)." This means HR-2 (location/relocation) must always be scored Pass, regardless of the candidate's stated relocation preference. Runs 1 and 2 incorrectly scored HR-2 as Fail based on the candidate's "Willing to relocate? No" answer; that was a scoring error, not a correct application of this repo's rules.

Re-scoring Run 2 with the house rule applied, all else unchanged:

| ID | Check | Verdict (cause) | Note |
|---|---|---|---|
| HR-2 | Location: based in/around LA or willing to relocate | **Pass** (corrected) | Per house rule, relocation is always treated as possible; this check passes regardless of the candidate's stated preference |
| HR-7 | Overqualification | Borderline (years-edge), unchanged | Already routed "Ignore" at stage 4A triage (accepted residual risk: fixed dates/degree, JD explicitly de-emphasizes years, editing would risk breaking HM-3's passing evidence). Carried forward as non-blocking, consistent with that triage decision |
| HM-4 and all other checks | Unchanged from Run 2 | All remain as scored in Run 2 (all Pass except the HR-1/HR-2 Confirm/knockout handling, which no longer blocks) |

HR screen outcome: Pass (HR-2 now Pass; HR-7's Borderline was already triaged and routed Ignore, non-blocking, consistent with the stage 4A FIXABLE decision). Hiring manager outcome: Pass (unchanged from Run 2). Overall: Passes both.

**Final result: PASS**

This corrects the record: the Stage 4A "rerun" (previously reported as FAIL, leading to a mistaken Stage 6A handoff) is in fact a PASS once the house rule is applied. Per the pipeline, this routes to Stage 5 (Humanize), not a handoff. The Stage 6A triage output (`04a_triage.md`) and `handoff.md` from the prior run are superseded and no longer apply; they are left in place for the audit trail but the pipeline is resuming forward.

## Stage 5 (Humanize) note - 2026-10-02

Ran the humanize pass on `03_ideal_cv.md`: Profile sentence 1 reworded to the house-rule title-first opener, dropped a phrase echo ("directly with" -> "closely with" at HappyMonk), dropped the Semantic Image-Text Retrieval Engine project (serves no M/H/N item for this JD and carried two percentages in one bullet), relabeled the Skills tail line "Others:" per house rule, applied en-dash date ranges throughout per house rule, and finalized 2 planned imperfections (one per role, different G13 types). Copy scan re-verified manually against the JD (sandbox intermittently blocked python3 execution; verified by direct token-by-token inspection instead) with no 3-word overlaps found. Role check re-run on all three roles: all pass (more than 3 lines, each carries at least one M/H/N item). Pre-humanize version preserved at `03_ideal_cv_v2.md`. Full "For you to decide" and finalized "Intentional imperfections" lists are in `05_confirmation.md`.

## Run 3 (Stage 6, second check, post-humanize) - 2026-10-02

HR outcome: Pass (HR-2 corrected to Pass per house rule; HR-7's Borderline carried forward from the stage 4A triage's Ignore routing, treated as accepted residual risk, non-blocking, consistent with Run 2's correction). Hiring manager outcome: Pass. Overall: Passes both.

### Check register and results

| ID | Check | Verdict (cause) | Evidence (short quote, section) | Why |
|---|---|---|---|---|
| HR-1 | Work authorization (Form) | Confirm | Not shown on CV by design | Low risk per candidate's own profile material (US citizen, no sponsorship needed) |
| HR-2 | Location: based in/around LA or willing to relocate (Form) | **Pass** (house rule) | Header: "Boston, MA" | Per this repo's CLAUDE.md house rule, "Treat relocation as possible (location gate passes)," this check is always scored Pass regardless of the candidate's stated relocation preference |
| HR-3 | Degree | Pass | "Master of Science, Computer Science, Northeastern University... GPA 3.9" (Education) | MS in CS exceeds the stated bachelor's-or-equivalent requirement |
| HR-4 | Years (not a gate) | Pass | n/a | JD explicitly does not require production years |
| HR-5 | Required stack keywords | Pass | Skills line 1: "Python, TypeScript, Rust, SQL, FastAPI, Node.js, NestJS, React" | TypeScript, Rust, React all present |
| HR-6 | Distinguishing keyword (Rust/Electron) | Pass | Skills line 1 and "Log Analyzer CLI... Taught myself Rust" (Projects) | "Rust" visible in both Skills and a named project |
| HR-7 | Overqualification | Borderline (years-edge), carried forward | ~4 computed years, MS CS (Experience, Education) | Unchanged from Runs 1-2; already triaged at stage 4A and routed Ignore (accepted residual risk: fixed dates/degree, JD explicitly de-emphasizes years). Treated as non-blocking, consistent with that decision, not re-opened |
| HM-1 | Shipped TypeScript/React work | Pass | "Put together a lightweight TypeScript and React dashboard for monitoring extraction accuracy and pipeline health" (Experience, Codametrix) | Named artifact and purpose in an Experience bullet |
| HM-2 | Fast pickup of an unfamiliar language or tool | Pass | "Adapted Whisper and Wav2Vec2... then switched to a different computer vision stack to train a YOLOv5 detector..." (Experience, HappyMonk); reinforced by "Log Analyzer CLI... Taught myself Rust" (Projects) | Experience-section evidence of picking up a new ML domain, reinforced by the Rust project |
| HM-3 | End-to-end feature ownership | Pass | "...scoping loosely defined problems on my own. Owning delivery from design through rollout..." (Experience, HappyMonk) | Full-cycle ownership narrative |
| HM-4 | Collaboration with non-software stakeholders to define interfaces | Pass | "Worked directly with clinical stakeholders to pin down ambiguous requirements, then turned what they described into concrete decisions about the extraction schema and API responses..." (Experience, Codametrix) | Resolved at stage 4A; concrete translation from ambiguous input to system/interface decisions |
| HM-ALT | Backend/API/data-model exposure | Pass | "Built and deployed FastAPI microservices on AWS, backed by PostgreSQL for metadata..." (Experience, Codametrix) | Strong, reinforces the likely-waived fifth check |

### YEARS table

Unchanged: ~3.9 years full-time (HappyMonk 34 months + Codametrix ~13 months to date), rounds to 4. Amwell internship (3 months) not counted toward full-time years.

### Confirm with the candidate

- HR-1, work authorization: low risk, not on the CV by design.
- HR-7, overqualification: noted as an accepted residual risk, not a blocking Confirm item; see `05_confirmation.md` "For you to decide" for related notes (none specific to HR-7 beyond what stage 4A already covered).

### Fixes

None needed; all checks Pass or accepted-residual Borderline.

### Ranking among passes

Per `01_pass_list.md`'s ranking section: first by Electron/desktop-wrapper experience (N1, not present, left as a documented non-hard gap), second by backend/API/database depth (N2, Strong via Codametrix FastAPI/PostgreSQL work and Amwell NestJS/Lambda work), third by systems coursework (N3, not present, documented non-hard gap). This CV ranks on the strength of its backend/API depth (N2) among passing candidates, with desktop-wrapper and systems-coursework exposure as the two open ranking gaps.

**Final result: PASS**
