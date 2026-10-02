# Pass List — Machine Learning Engineer, Content Discovery — Suno

A first-principles recommendation/ranking modeler, not a generic "ML engineer" who mainly integrates pretrained models or LLM APIs; the role is defined by designing models for user preference/ranking from scratch and running them under production latency constraints.

## HR pass list

| # | Check | Where | What passes |
|---|---|---|---|
| 1 | Work authorization | Form | Eligible to work in the US with no sponsorship needed (JD: "Applicants must be eligible to work in the US", no sponsorship mentioned) |
| 2 | Location | Form | Based in San Francisco, or willing to relocate and work onsite (5 days/week in-office lunch perk confirms full onsite) |
| 3 | Salary expectation | Form | Expectation within $198.7k - $260.8k |
| 4 | Degree | Skim | PhD (or equivalent experience) in applied math, statistics, ML, or a related quantitative field; "or equivalent experience" means a strong non-PhD CV is not auto-rejected, but a listed PhD still skims fastest |
| 5 | Years / seniority signal | Skim | No explicit years floor stated; recruiter looks for titles indicating applied ML / ML engineer / research engineer with model-building (not just data/analytics or software-only) work |
| 6 | Required tools | Skim | Python visible, plus a modern ML framework named (PyTorch or equivalent) |
| 7 | Distinguishing keyword | Skim | "recommendation" or "ranking" (or "personalization") visible in context, not just "machine learning" generically |

Notes:
- The degree line is softened ("or equivalent experience") but still a real skim filter: a CV with no advanced degree needs unmistakable first-principles modeling evidence to read as "equivalent" in a few seconds.
- "Applicants must be eligible to work in the US" with no sponsorship language is a harder knockout than it looks; confirm work authorization on the live application form.

## Hiring manager pass list

| # | Check | What passes |
|---|---|---|
| 1 | First-principles model design | Built a model from a probabilistic, optimization-based, representation-learning, or graph-based formulation, not just fine-tuned or called a pretrained model |
| 2 | Recommendation/ranking on real interaction data | Designed or trained a ranking/recommendation system using actual user interaction signals (implicit feedback, ranking losses, bandits), with a named metric and outcome |
| 3 | Production deployment under latency/throughput constraints | Deployed a model to serve real traffic with a stated latency or throughput number and a design tradeoff made because of it |
| 4 | Experimentation / causal evaluation | Ran A/B tests or causal analysis to evaluate a model's effect on a product metric |

**Likely fifth (borderline):** Translating abstract objectives (relevance, novelty, diversity) into measurable metrics; most managers will accept this as implied if check 2 and check 4 are both strong, rather than requiring separate standalone evidence.

Soft skills from the required section ("curiosity, rigor, desire to understand systems deeply") sit on neither list; a CV cannot prove them, they are tested in interview.

## Not needed to pass either list

PhD itself (only "or equivalent" matters, see HR check 4), love of music, consumer-entertainment-company pedigree, and any specific graph/bandit/RL sub-method are all preferred/ranking only, not pass/fail.

## Ranking among passes

Among candidates who pass both gates, rank first by how close their interaction-data/ranking work is to Suno's actual business (music/audio content discovery beats generic recsys beats generic search/ads ranking). Consumer-entertainment company pedigree (N2) ranks next, since it signals comfort with Suno's product context and scale. A stated love of music (N1) is a tie-breaker only. Responsibility items that did not make the hiring-manager pass list but still separate candidates: demonstrated influence on technical direction (working with product/research leadership, not just executing a spec) and explicit metric-design work (relevance/novelty/diversity tradeoffs) beyond the borderline check. A PhD helps at the HR skim (check 4) but, once "equivalent experience" is clearly shown, carries little extra weight with the hiring manager.
