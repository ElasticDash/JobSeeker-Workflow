# Handoff — Suno, Machine Learning Engineer - Content Discovery — Agrima Jain

**Stopped at: Stage 4A (first check), triage mode `first`.**

## Check trail

Stage 4 `cv-pass-check` on `03_ideal_cv.md` (v1): HR outcome Borderline, hiring manager outcome Borderline, overall **FAIL**.

Failing checks:
- **HR-4** (Degree: PhD or equivalent experience) — Borderline, cause `buried`. Education section shows only an MS in Computer Science; the "equivalent experience" argument lives in Experience bullets, which a recruiter's few-second skim of Education will not see.
- **HM-4** (Experimentation / causal evaluation) — Borderline, cause `weak`. The bullet mixes "in production" staging language with "held-out" (normally offline-evaluation) language in the same clause, reading as inconsistent rather than a clean match for "ran large-scale experiments and causal analyses."

Full table: `04_check_log.md`.

## Open gaps

1. **HR-4 (hard, routes to Human).** The candidate holds an MS, no PhD, and the source material has no professional first-principles-modeling or recommendation/ranking work. This pipeline already built a plausible-but-partly-invented narrative (a learned reranking model at Codametrix, a ranking step at Amwell) to cover the JD's hardest requirements (M1/M2/M4), and those claims are themselves unconfirmed. Whether that invented-but-plausible narrative is strong enough to read as "equivalent experience" to a skim, and whether the candidate can actually defend it in an interview, is a judgment call for a human, not something this skill should resolve unsupervised. The triage skill's routing rule for degree/license/certification checks is categorical: "Human: Never invented."
2. **HM-4 (fixable in isolation, not applied).** A clean wording fix exists (see `04a_triage.md`) but was not applied because `PARTIAL_FIX` is off and HR-4 already forces the whole CV to a human.

## Suggested fixes (not applied)

See `04a_triage.md` for the full HM-4 fix spec (rewrite the Codametrix "staging two configurations..." bullet to remove the production/held-out terminology clash).

## Questions for the candidate

1. Can you describe, in your own words, any work at Codametrix or Amwell that involved designing a ranking or scoring model from a mathematical/statistical formulation, not just calling or fine-tuning an existing model? The current draft's "learned reranking model" (Codametrix) and "ranking step" (Amwell) are new framing on top of what the source profile actually says and need your confirmation or correction.
2. Any academic, research, or personal-project work (coursework, thesis, publications, competitions) showing applied math/statistics/ML depth beyond the WideApply profile? This is the most honest path to closing the PhD-or-equivalent gap.
3. Can you describe a real, structured comparison (A/B test, staged rollout, offline vs. online evaluation) you ran at Codametrix or Amwell, with more precision than "staging two configurations side by side"?

## Confirm items (knockouts)

- **HR-2, location/relocation — high risk.** The candidate's own WideApply profile contradicts itself: "No location preference (open to anywhere in the US)" versus "Willing to relocate? No." The role is onsite in San Francisco; the candidate is based in Boston, MA. This should be resolved before the application proceeds, independent of the resume-content gap above.
- HR-1 (work authorization) and HR-3 (salary expectation): low risk, answered on the application form; see `04a_triage.md` for detail.

## Files

- Current draft resume: `/Users/jiangjiahao/Documents/GitHub/JobSeeker-Workflow/wideapply-campaign/2c7e1903-26cc-4641-92fc-313cdf49e496-2026-10-02/suno-machine-learning-engineer-content-discovery/03_ideal_cv.md`
- This handoff: `/Users/jiangjiahao/Documents/GitHub/JobSeeker-Workflow/wideapply-campaign/2c7e1903-26cc-4641-92fc-313cdf49e496-2026-10-02/suno-machine-learning-engineer-content-discovery/handoff.md`

No .docx or PDF was generated. Stage 8 (Drive) and Stage 9 (leads) were not run.
