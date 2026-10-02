# Gap triage — mode: first

Input: Stage 4 cv-pass-check FAIL (see 04_check_log.md), pass list (01_pass_list.md), ideal CV (03_ideal_cv.md), candidate analysis (02_cv_analysis.md) and raw material.

## Open gaps

### HM-2: Internal developer-platform/tooling ownership (Fail)

- **What passes:** "Built an internal API, SDK, tool, or platform feature that other engineers or non-technical internal users adopted."
- **Why it cannot be fixed by editing Skills/Experience:** tested against all three fixed employers.
  - Codametrix (AI/ML Engineer, healthcare SaaS vendor): real work is clinical-data RAG/extraction for the vendor's external healthcare customers, not internal tooling for Codametrix's own engineers.
  - Amwell (AI Engineer Intern, telehealth): real work is product feature integration (RAG recommendations, backend APIs), not internal platform work.
  - HappyMonk AI Labs (Founding Software Engineer, 2-4 person AI startup): the closest candidate is the CI/CD/deployment pipeline she set up, but a founding-team-scale internal pipeline used by 1-3 other engineers does not plausibly rise to "a platform other engineers adopted" at the scope a hiring manager would credit, and stretching it that far would misstate scope rather than describe real work.
  - None of the three employers' actual businesses contain an internal-developer-platform product line this role's responsibilities describe.
- **Route:** era/employer-plausibility gap, not a wording problem. Outside `cv-pass-gap-fix`'s mandate (that skill edits wording/emphasis inside Skills and Experience; it does not invent new scope that no fixed role can credibly carry).

### HR-7: Seniority/title match (Borderline, weak)

- **What passes:** a prior "Senior" or equivalent lead title, or at minimum 4-5+ years of continuous relevant experience substituting for it.
- **Why it cannot be fixed:** titles and dates are fixed facts. No role held is "Senior" or lead-level. Full-time experience totals ~3.9 years, and the only continuous run up to today is the current Codametrix stretch (~13 months); the larger HappyMonk stretch (~2.8 years) is separated from it by the Northeastern Master's program (Dec 2023 to Aug 2025 has no full-time work, only a 3-month internship). No editing of Skills or Experience content changes any of this.
- **Route:** fixed-facts gap (dates, titles, education timing). Outside `cv-pass-gap-fix`'s mandate.

## Triage result: HANDOFF

Both open gaps are rule-2/rule-3 style gaps under the ideal-candidate Gap rules (employer-plausibility ceiling and fixed facts), not fixable by editing wording inside Skills and Experience. `AUTO_FIX_ROUNDS = 1` is not consumed because there is no fixable spec to hand to `cv-pass-gap-fix`.

## Questions for the candidate

- Has she ever built or maintained an internal tool, API, or deployment pipeline that other engineers on a larger team (beyond a 2-4 person founding group) actually adopted and used day to day? If so, which employer and roughly how many users.
- Is she open to this role despite the "Senior" framing, understanding her real full-time experience (~3.9 years, no prior Senior title) is light against it, in case the team is willing to interview below the title level given the JD's own low stated floor (2+ years)?
- Is she in fact willing to relocate to the Renton, WA / greater Seattle area, given her WideApply profile has conflicting signals ("no location preference, open to anywhere in the US" vs. "Willing to relocate: No")? This did not independently decide the handoff (HR-2 was left as Confirm, not Fail) but would need resolving before submission regardless.
