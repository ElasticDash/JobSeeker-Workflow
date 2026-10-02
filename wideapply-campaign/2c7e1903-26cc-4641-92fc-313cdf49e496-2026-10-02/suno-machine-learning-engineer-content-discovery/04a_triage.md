# Triage (mode: first)

## Triage table

| ID | Check | Verdict (cause) | Kind | Route | Reason |
|---|---|---|---|---|---|
| HR-4 | Degree (PhD or equivalent experience) | Borderline (buried) | degree | **Human** | Routing rule for kind "degree, license, certification" is "Human: Never invented," with no carve-out for the Borderline cause. The CV's Education section shows only an MS; nothing can be added there (Education is never edited), and the "equivalent experience" argument that currently lives in Experience bullets is exactly the kind of judgment call (does this body of work actually read as PhD-equivalent quantitative depth to a skeptical recruiter/hiring manager) that this skill is not set up to resolve on its own. No bullet rewrite can manufacture an advanced-degree-equivalent signal that is not already a judgment call for a human. |
| HM-4 | Experimentation / causal evaluation | Borderline (weak) | narrative | Experience (in isolation) | Cause is `weak`, routes to strengthening the existing Codametrix bullet ("staging two configurations side by side in production and using the accuracy lift on held-out extraction cases to decide which one shipped") to remove the production/held-out terminology clash. This gap is fixable on its own, but `PARTIAL_FIX` is off and HR-4 already forces a handoff, so this fix is not applied; it is listed below as suggested only. |

## Fix spec (suggested, not applied, since HR-4 forces handoff under PARTIAL_FIX = off)

**HM-4**
- Section: Experience
- Target: Codametrix (Sep 2025 to Present), bullet 3: "Iterated on the reranker and the underlying retrieval embeddings in PyTorch over several rounds, folding in feedback from clinical reviewers on which passages actually mattered, and staging two configurations side by side in production to decide which one shipped based on the accuracy lift."
- Must show: ran large-scale experiments or causal analysis to evaluate a model's effect on a product metric (hiring manager pass list, check 4)
- Substance: rewrite to remove the "held-out extraction cases" (offline-evaluation language) sitting next to "in production" (live-system language) in the same clause. State plainly that two reranker configurations were compared in production (a staged rollout / online comparison) and the accuracy lift on real traffic decided which one shipped, without borrowing offline-test vocabulary. This is a wording fix to existing claimed work, not a new claim.
- Constraints: must not reuse "Designed", "Kept", "Added", or "Fine-tuned" as the opening verb (already used elsewhere in this role); must not introduce a 3-word run from the JD; must keep the role at or under 3 lines' worth of bullets beyond what is already there (no new bullet, this is a rewrite of an existing one); bullet count stays at 12 of 13.
- Needs confirmation: no new claim is added, this only removes an internal wording inconsistency in an already-flagged, already-confirmation-listed claim (see 05_confirmation.md item 2).

## Capacity

Bullet count before: 12 of 13. No bullets would be added by the HM-4 fix (rewrite only). Not applied in this run.

## Handoff package

**Stage:** 4A (first check), mode `first`, stopped at triage because HR-4 routes to Human.

**Current resume version:** `03_ideal_cv.md` (v1, unmodified since Stage 3).

**Open gaps:**
- **HR-4 (Degree, PhD or equivalent experience):** cannot be fixed inside the fixed frame. The candidate holds an MS in Computer Science, no PhD, and no professional first-principles-modeling or recommendation/ranking work exists in the source material prior to this pipeline's own (confirmation-flagged, partly invented) reframing of the Codametrix and Amwell bullets. Whether that reframed experience is strong enough to read as "equivalent experience" to a skeptical recruiter doing a few-second skim of the Education line, and whether the candidate herself can actually substantiate the first-principles-modeling claims in an interview, are judgment calls this pipeline should not make unsupervised, especially since several of the underlying claims are already on the "Needs candidate confirmation" list as new framing not present in the source CV (05_confirmation.md, items 2 and 3).
- **HM-4 (Experimentation / causal evaluation):** fixable in isolation (see fix spec above), but not applied because PARTIAL_FIX is off and HR-4 already forces the whole CV to a human.

**What was tried:** Stage 4 cv-pass-check (04_check_log.md): HR outcome Borderline, hiring manager outcome Borderline, overall FAIL on HR-4 and HM-4. No fix has been applied yet; this is the first and only triage pass (AUTO_FIX_ROUNDS = 1, not yet used).

**Questions for the candidate:**
1. Can you describe, in your own words, any work you did at Codametrix or Amwell that involved designing a ranking or scoring model from a mathematical/statistical formulation (not just calling or fine-tuning an existing model)? The current draft describes a "learned reranking model" trained on reviewer correction signals with pairwise ranking losses at Codametrix, and a ranking step trained on historical match outcomes at Amwell; both of these are new framing built on top of what your source profile actually says (RAG pipelines with Pinecone retrieval; a RAG-based recommendation feature improving match accuracy 35%). Confirm, correct, or reject this framing before it goes out.
2. Do you have any academic, research, or personal-project work (coursework, thesis, publications, competitions) that demonstrates applied math/statistics/ML depth beyond what is in your WideApply profile? This would be the strongest, most honest way to close the PhD-or-equivalent gap without further stretching the professional-experience bullets.
3. Did you run any form of structured comparison (A/B test, staged rollout, offline vs. online evaluation) at Codametrix or Amwell that you can describe with more precision than "staging two configurations side by side"? A specific, real description here would resolve HM-4 cleanly.

**Confirm items (knockouts) and risk:**
- HR-1 (work authorization): low risk. Candidate's profile states US citizen, no sponsorship needed.
- HR-2 (location/relocation): high risk. The candidate's own profile has two contradictory answers ("no location preference, open to anywhere in the US" vs. "willing to relocate? No"), and the role is onsite in San Francisco while the candidate is based in Boston, MA. This should be resolved before the application proceeds regardless of the resume-content gap above; see 05_confirmation.md item 1.
- HR-3 (salary expectation): low risk. Posted range ($198.7k to $260.8k) is a standard senior-IC band; no specific conflicting signal in the profile.

**Triage result: HANDOFF**
