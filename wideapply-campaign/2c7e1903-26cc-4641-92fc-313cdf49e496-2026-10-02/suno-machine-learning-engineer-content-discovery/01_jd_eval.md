# JD Evaluation — Machine Learning Engineer, Content Discovery — Suno

## Step 1 signals

- "PhD or equivalent experience" softens the degree requirement to equivalent demonstrated experience; this is still a strong signal the company wants deep first-principles ML background, not applied-only tooling experience.
- No explicit minimum years stated; seniority is implied by "PhD or equivalent", by salary band, and by "work closely with product and research leadership to define technical direction" (strategic scope, not purely executional).
- "Applicants must be eligible to work in the US" plus no mention of visa sponsorship: this reads as a real gate, not just a preference.
- Onsite in San Francisco, 5 days/week in-office lunch perk confirms full onsite, not hybrid.
- Salary range ($198.7k-$260.8k) is wide: level decided at interview, but floor is senior IC.
- Responsibilities are heavily first-principles / applied-math flavored ("formulate and develop mathematical models," "design learning systems," "from first principles") rather than tooling-integration flavored. This is a hidden requirement: strong modeling/statistics chops, not just framework usage.
- "A love of music... is a strong plus" is an explicit nice-to-have, low weight, cultural/domain-passion signal.
- No explicit interview process described in the posting.

## 1. Hard gates

| Item | What the JD says | Verdict |
|---|---|---|
| Location / timezone | San Francisco, onsite | Real gate (onsite presence required) |
| Work visa | "Applicants must be eligible to work in the US"; no sponsorship mentioned | Real gate |
| Minimum years | Not stated explicitly | Not a gate, but implied by PhD/seniority language |
| Certificate / degree | "PhD or equivalent experience" | Softened gate: PhD or clearly equivalent quantitative depth required |
| Employment type | Full-time (perks listed are for "Full-Time Employees") | Real gate if candidate wants part-time/contract, not otherwise relevant |

## 2. Must-haves

| # | Requirement | Evidence to look for in the CV | Weight |
|---|---|---|---|
| M1 | Strong applied math / stats / ML background, PhD-level or equivalent | Advanced degree, or project-level evidence of designing models from first principles (not just calling library functions) | Highest |
| M2 | Designing models from first principles (probabilistic models, optimization, representation learning, graph methods) | A specific project describing model formulation, not just "used PyTorch" | Highest |
| M3 | Python + modern ML frameworks (PyTorch) used to implement and iterate on research ideas | Project description showing PyTorch used for model development/training, not just inference calls to hosted APIs | High |
| M4 | Experience learning from user interaction data: implicit feedback, ranking losses, bandits, or RL-adjacent methods | A recommendation/ranking/search project using real interaction signals, not just classification/generation tasks | Highest (role-defining) |
| M5 | Reasoning about tradeoffs between model quality, scalability, and system constraints (real-time latency/throughput) | Project with stated latency/throughput numbers and a design tradeoff discussion | High |
| M6 | Curiosity/rigor, understanding systems deeply rather than black-box usage | Mainly verified in interview; CV signal is depth of explanation in bullets (why, not just what) | Medium-high, mainly verified in interview |

## 3. Hidden requirements

| # | Hidden requirement | Source in the JD | Evidence to look for in the CV |
|---|---|---|---|
| H1 | Running large-scale experiments (A/B tests) and causal inference | "Run large-scale experiments and causal analyses to evaluate model behavior and product impact" | Experimentation/evaluation work with named methodology (A/B testing, causal analysis, offline/online eval) |
| H2 | Translating abstract product objectives into measurable metrics | "Translate abstract objectives (relevance, novelty, diversity, long-term satisfaction) into measurable metrics" | Evidence of defining or choosing evaluation metrics for a system, not just hitting a given accuracy number |
| H3 | Cross-functional work with product and research leadership on technical direction | "Work closely with product and research leadership to define the technical direction" | Evidence of influencing technical direction/roadmap, not just executing tickets |
| H4 | Working under real production latency/throughput constraints at scale | "scalable recommendation and ranking models that operate under real-time latency and throughput constraints" | Deployed system with stated scale and latency numbers |

## 4. Nice-to-haves

| # | Plus | Evidence to look for in the CV |
|---|---|---|
| N1 | Love of music (listening, exploring, making) | Any mention of music-related projects, hobbies, or domain interest |
| N2 | Consumer-scale / consumer entertainment product experience | Prior work at a consumer-facing, high-growth product company |

## 5. Seniority

- **Years:** Not stated explicitly; PhD-or-equivalent plus the scope described implies mid-to-senior IC, likely 3+ years of applied ML/research-adjacent experience post-advanced-degree, or an equivalent track record.
- **People management:** IC role; no management responsibility implied.
- **Scope:** Owns a technical subsystem (personalization/recommendation) end to end: modeling, deployment, evaluation.
- **Decision rights:** Has input into technical direction (works "closely with product and research leadership to define the technical direction"), not just execution against a spec.

## 6. Domain experience

| Tier | Background | Examples |
|---|---|---|
| Direct match | Recommendation systems, ranking, personalization at a consumer product with real interaction data | Music/video/content streaming recommender teams, search ranking teams |
| Adjacent | Applied ML with first-principles modeling (probabilistic models, representation learning) in another domain (healthcare, search, ads) even without music/content focus | ML engineer building ranking or retrieval systems in an unrelated vertical |
| Distant | General software engineer or backend/API integration engineer whose ML exposure is calling third-party LLM APIs without model-level design work | Engineer who only does RAG/prompt engineering against hosted LLM APIs with no model-training or ranking work |

## 7. Recency

- Recommendation/ranking/ML-from-first-principles work should appear in the most recent role, not only in a thesis or an old project.
- Down-weight old, generic ML coursework-level projects (image classification, basic NLP) if they are the only ML evidence and are several years old.
- Up-weight anything touching interaction data, ranking losses, or production-scale latency work in the last 1-2 years.

### Suggested scoring order

1. Gates: US work eligibility (no sponsorship), willingness/ability to work onsite in San Francisco.
2. Must-have coverage: M1 and M4 need the most explicit, specific evidence (first-principles modeling and interaction-data/ranking experience); M2, M3, M5 next.
3. Ranking factors: H1-H4, then N1-N2, then domain tier and recency.

### What this JD is really worried about

Suno is worried about hiring someone who can only wire together existing ML frameworks/APIs (an "LLM integration engineer") rather than someone who can design and reason about recommendation/ranking models from first principles under real production constraints. M1, M2, and M4 best test for this; a CV heavy on RAG/prompt-engineering/API-integration work with no ranking, interaction-data, or from-scratch modeling evidence is the biggest red flag for this specific anxiety.

## Step 3: Hard skills and soft skills

### Hard skills

| Skill | Level | What the JD says |
|---|---|---|
| Applied math / statistics / ML theory (PhD-level or equivalent) | Must-have | "Strong background in applied mathematics, statistics, machine learning, or a related quantitative field (PhD or equivalent experience)" |
| First-principles model design (probabilistic models, optimization, representation learning, graph methods) | Must-have | "Experience designing models from first principles" |
| Python + PyTorch (or similar) | Must-have | "Proficiency in Python and modern ML frameworks (e.g., PyTorch)" |
| Learning from implicit feedback / ranking losses / bandits / RL-adjacent methods | Must-have | "Familiarity with learning from user interaction data" |
| Large-scale recommendation/ranking model deployment under latency/throughput constraints | Must-have / Hidden | "Build and deploy scalable recommendation and ranking models that operate under real-time latency and throughput constraints" |
| Experimentation and causal analysis (A/B testing, causal inference) | Hidden | "Run large-scale experiments and causal analyses" |
| Metric design (relevance, novelty, diversity, long-term satisfaction) | Hidden | "Translate abstract objectives... into measurable metrics" |

### Soft skills

| Skill | Level | What the JD says |
|---|---|---|
| Deep systems understanding over black-box usage | Must-have (mainly verified in interview) | "Curiosity, rigor, and a desire to understand systems deeply rather than treating models as black boxes" |
| Judgment on quality/scalability/system-constraint tradeoffs | Must-have | "Comfort reasoning about tradeoffs between model quality, scalability, and system constraints" |
| Cross-functional collaboration with product/research leadership | Hidden | "Work closely with product and research leadership to define the technical direction" |
| Domain passion (music) | Nice-to-have | "A love of music... is a strong plus" |

### Items that are not skills

- Gates: US work eligibility, onsite San Francisco, full-time.
- Domain experience tiers: direct (recsys/ranking at consumer product), adjacent (first-principles ML elsewhere), distant (API-integration-only ML).
- Seniority: PhD-or-equivalent, IC with input into technical direction.
- Recency: ranking/interaction-data work should be in the most recent role.

## Step 4: Ideal candidate profile

### Ideal candidate in one sentence

A quantitatively strong ML engineer or applied researcher who designs recommendation/ranking models from first principles using real user interaction data, deploys them under production latency constraints, and backs model choices with experiments and causal analysis.

### Project types they have ideally done

| Project type | What they actually did | Maps to |
|---|---|---|
| Recommendation/ranking system from interaction data | Designed and trained a ranking or recommendation model on implicit feedback (clicks, plays, skips), chose a loss function appropriate to ranking, evaluated offline and online | M1, M2, M4, H1 |
| Production ML system under latency/scale constraints | Took a model to production serving real-time traffic with defined latency/throughput budgets, made explicit tradeoffs between model complexity and serving cost | M3, M5, H4 |
| Experimentation / causal analysis on product metrics | Ran A/B tests or causal analyses to evaluate a model change's effect on product metrics (engagement, retention, diversity) | H1, H2 |
| First-principles model development (research-adjacent) | Built a model from a probabilistic, optimization-based, or representation-learning formulation rather than fine-tuning an off-the-shelf model | M1, M2, M6 |

### Companies or teams they have ideally worked in

- Consumer content/streaming recommendation teams (music, video, short-form content platforms)
- Search/ranking teams at consumer tech companies
- Applied research teams at ML-focused companies working on personalization, ranking, or representation learning
- PhD research labs doing applied ML research with a path into industry (less direct, but can satisfy M1/M2 if the thesis work is ranking/recsys/representation-learning-adjacent)

### Best-fit role backgrounds

1. ML engineer on a recommendation/ranking/personalization team at a consumer product company (closest fit: covers M1-M5 directly).
2. Applied research scientist (PhD or industry-equivalent) working on representation learning, probabilistic modeling, or bandits, who has shipped something to production (strong on M1/M2/M6, may be weaker on H4 production-scale experience).
3. Search/ads ranking engineer (strong on M4/M5/H1/H4, may need to show the first-principles modeling depth explicitly since ads/search ranking can sometimes be feature-engineering-heavy rather than first-principles).
4. General ML engineer with strong theory background but mostly API-integration/LLM-application experience (weakest fit: would need to show real model-design and interaction-data work, since LLM-API integration alone does not demonstrate M1, M2, or M4).

### The ideal skill combination

- First-principles modeling depth (M1/M2) combined with hands-on production deployment under real latency constraints (M3/M5/H4): most candidates are strong on one side (academic researchers) or the other (production ML engineers), rarely both.
- Interaction-data/ranking-loss experience (M4) is uncommon outside of recsys/ads/search teams specifically; general ML experience does not substitute for it.
- Comfort with experimentation and causal analysis (H1) on top of modeling work is the third leg that is genuinely scarce in combination with the first two.

### Strong and weak signals on a CV

**Strong signals:**
- "Designed a ranking model using pairwise/listwise loss trained on click/play/skip signals, deployed to serve P99 latency under Xms at Y requests/sec."
- "Ran A/B tests to measure the effect of a new ranking objective on retention/diversity/engagement, using [causal method] to isolate the effect."
- "Built a probabilistic/optimization-based model from scratch (not a pretrained model) to represent user preference or item similarity."

**Weak signals:**
- ML keywords (PyTorch, "machine learning") in a Skills list with no matching project showing model design.
- RAG/LLM-API integration work presented as "ML engineering" with no model training, ranking, or interaction-data component.
- Old coursework-style classification/image projects as the only hands-on ML evidence.
- "Familiar with recommendation systems" with no specific project, metric, or scale attached.
