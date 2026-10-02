# CV Analysis — Agrima Jain

## Snapshot

An LLM/RAG applications engineer with a founding-engineer speech/vision background, now about 3 years 11 months of full-time experience (close to her own "4+ years" claim) plus a 3-month internship, holding an MS in CS (2025). The single biggest caveat: her hands-on ML work is almost entirely LLM-API integration, RAG, and fine-tuning pretrained models (Whisper, Wav2Vec2, YOLOv5, LoRA), not first-principles model design or recommendation/ranking work on user interaction data.

## Timeline

| Period | Role | Type | Duration |
|---|---|---|---|
| 2021-01 - 2023-11 | Founding Software Engineer, HappyMonk AI Labs (Bengaluru) | Full-time | 34 months |
| 2023-12 | (gap, likely relocation/prep before MS) | Gap | ~1 month |
| 2024-01 - 2025-12 | MS, Computer Science, Northeastern University | Education | 24 months |
| 2025-05 - 2025-08 | AI Engineer Intern, Amwell (Boston) | Internship (overlaps MS) | 3 months |
| 2025-09 - Present (2026-10) | AI/ML Engineer, Codametrix (Boston) | Full-time | ~13 months |

- Computed full-time total: 34 + 13 = 47 months = 3 years 11 months. Candidate's stated "4+ years" rounds this up; it is close but not yet 4 full-time years unless the 3-month internship is folded in (then ~4 years 2 months).
- The Amwell internship (2025-05 to 2025-08) overlaps the MS program (2024-01 to 2025-12): working while still studying, consistent with a part-time/co-op style internship during a master's.
- No gap since the current role started (2025-09); candidate is currently employed.

## Education

| Degree and field | Institution | Location | Dates | Status | Relevance |
|---|---|---|---|---|---|
| MS, Computer Science | Northeastern University | Boston, MA | 2024-01 - 2025-12 | Completed (end date has passed) | Directly supports ML/software engineering credibility; GPA 3.9 |

No undergraduate (bachelor's) degree appears anywhere in the source profile. A master's program normally requires a bachelor's; this is very likely an omission in the WideApply export rather than evidence the candidate has no bachelor's degree. Flagged as a watch-out below.

No academic projects, theses, or honors are listed for the MS beyond the two standalone personal projects (MedFlow, Semantic Image-Text Retrieval Engine), which read as personal/portfolio projects rather than coursework tied to the degree.

GPA: 3.9, stated as fact only.

**Education takeaway:** a single, recent (2025) CS master's degree is the full education stack as given. It is relevant and current, but the missing undergraduate degree is a real data gap that should be confirmed, not invented.

## Hard skills and recency

| Skill | Evidence | Last seen | Recency |
|---|---|---|---|
| RAG pipeline design (retrieval + LLM grounding) | Strong: "Built RAG pipelines integrating OpenAI and Claude APIs with Pinecone for vector retrieval across 300,000+ documents" (Codametrix) | Codametrix, current | Current |
| LLM API integration (OpenAI, Claude, Whisper) | Strong: multiple bullets across Codametrix, Amwell, HappyMonk | Codametrix, current | Current |
| FastAPI / REST API development | Strong: "Designed and deployed FastAPI microservices and REST APIs on AWS to process 1,000+ real-time healthcare records daily" (Codametrix); also HappyMonk | Codametrix, current | Current |
| Fine-tuning pretrained models (LoRA, Whisper, Wav2Vec2, YOLOv5) | Strong: Codametrix (LoRA), HappyMonk (Whisper/Wav2Vec2, YOLOv5) | Codametrix, current | Current |
| Model evaluation loops (extraction accuracy, hallucination rate) | Medium: "built evaluation loops around prompt engineering iterations, measuring extraction accuracy and hallucination rate" (Codametrix) | Codametrix, current | Current |
| Vector search / ranking (Top-K similarity, NDCG, Recall@K) | Medium: personal project, "Semantic Image-Text Retrieval Engine... Top-K similarity, NDCG, Recall@K... improving search relevance by 30%" | Personal project, undated (likely during/after MS) | Recent, but non-professional |
| First-principles model design (probabilistic, optimization, graph-based) | Unsupported: no bullet describes building a model from a mathematical formulation rather than using/fine-tuning an existing architecture | None found | Not evidenced |
| Recommendation/ranking on real user interaction data (implicit feedback, ranking losses, bandits) | Unsupported: no bullet involves user interaction signals (clicks, plays, engagement) feeding a ranking or recommendation model | None found | Not evidenced |
| Production ML under real-time latency/throughput constraints | Medium: "Deployed production inference on AWS with PostgreSQL... achieving 120-200ms latency" (Codametrix); "reducing latency by 40% in production" (Amwell) | Codametrix, current | Current, but about inference latency for RAG/extraction, not ranking/recsys serving |
| Node.js / NestJS backend | Medium: Amwell internship | Amwell, 2025-08 | Recent |
| Docker / CI/CD / Kubernetes | Strong (Docker/CI-CD): HappyMonk, Amwell; Kubernetes appears only in Skills list, no matching bullet | HappyMonk/Amwell, through 2025 | Current for Docker/CI-CD; Kubernetes unsupported |
| Experimentation / A/B testing / causal analysis | Unsupported: no bullet mentions A/B tests or causal methods | None found | Not evidenced |

**Key takeaway:** the candidate's strongest, most current skills (RAG, LLM-API integration, fine-tuning pretrained models) are exactly the pattern this JD is trying to screen out ("not just calling an API"). The one piece of evidence closest to the JD's core ask (ranking metrics: NDCG, Recall@K) sits in a personal project, not a professional role, and first-principles modeling plus interaction-data ranking plus experimentation are all unsupported anywhere in the source material.

## Soft skills

- Customer/stakeholder translation: "Work directly with clinical stakeholders to understand requirements and workflows, translating business and clinical problems into AI/technical solutions" (Codametrix); similar language at HappyMonk ("working directly with customers to understand workflows and pain points").
- Ownership of ambiguous problems: "Regularly worked problems that weren't clearly defined at the outset, asking questions to isolate the underlying issue" (HappyMonk, founding engineer).
- Cross-functional bridging: "acting as the bridge to engineering by explaining trade-offs" (HappyMonk).
- **Gaps:** no evidence of influencing technical direction at a leadership level, no evidence of structuring experiments or defining success metrics, no people-management evidence (consistent with IC-track career so far).

## Seniority

- **Level:** Mid-level IC, roughly 3 to 4 years of full-time experience. Title progression (Founding SWE -> AI Engineer Intern -> AI/ML Engineer) reads as applied engineer, not yet senior/staff.
- **People management:** None; individual contributor throughout, including the "Founding" title (small-team ownership, not direct reports stated).
- **Scope, per role:**
  - HappyMonk: owned end-to-end delivery of speech-to-text and object-detection pipelines as a founding engineer on a small team.
  - Amwell: built specific backend services and one image-prediction pipeline as an intern.
  - Codametrix: owns the RAG/extraction pipeline and its productionization (microservices, voice modality extension, fine-tuning), a single clear technical workstream.
- **Decision rights:** Evidence of technical implementation decisions (architecture, fine-tuning approach) and iterating based on stakeholder feedback; no evidence of deciding product direction, budget, or hiring.

## Domain experience

| Company | Industry | Product type | User type |
|---|---|---|---|
| Codametrix | Healthcare (likely clinical coding/documentation) | RAG/extraction pipeline over medical documents, voice transcription | Clinical/internal healthcare staff |
| Amwell | Healthcare (telehealth) | RAG-based recommendation/matching feature, backend services | Internal/telehealth platform users |
| HappyMonk AI Labs | Applied AI / computer vision and speech (likely surveillance and industrial/consumer applications), Bengaluru | Speech-to-text pipeline, object detection (surveillance frames) | B2B customers (unspecified) |
| MedFlow (personal project) | Healthcare-adjacent | AI intake chatbot | End consumers (patients), non-professional |
| Semantic Image-Text Retrieval Engine (personal project) | General / search | Multimodal search and retrieval | N/A, academic/personal |

**Deepest domain:** healthcare AI (RAG, extraction, voice, backend) across two most recent roles. **Shallow/absent domains:** consumer entertainment, music, content discovery, or any recommendation/ranking product; all ranking-metric evidence is confined to one personal project.

## Watch-outs

1. **Recency/gap:** no gap currently; candidate is employed as of 2025-09 with the role ongoing.
2. **Geography:** HappyMonk experience is based in Bengaluru, India (2021-2023); subsequent MS and both US roles are in Boston, MA. No San Francisco or West Coast experience; current location (Boston) is cross-country from Suno's SF onsite requirement.
3. **Inflated numbers:** none obviously company-level-only; the "300,000+ documents," "1,000+ real-time healthcare records daily," and "50K+ images" figures read as system-level throughput the candidate's own pipeline handled, plausible for the role described, but not independently verifiable.
4. **Years claim vs computed:** candidate states "4+ years"; computed full-time is 3 years 11 months (close, slightly rounded up).
5. **Skills listed with no supporting experience:** Kubernetes, TypeScript (only "Node.js" bullets evidenced, no TypeScript-specific bullet), SQL (listed, no dedicated bullet), C++ (listed, no bullet), Authentication/Authorization Patterns (listed, no bullet), MongoDB (listed, no bullet), AWS SageMaker (listed; AWS Lambda/CloudWatch appear in bullets but SageMaker does not).
6. **Work authorization:** profile states "US citizen," "legally authorized to work in the US," "will not require future sponsorship" — clean and consistent, satisfies Suno's US-eligibility gate.
7. **Relocation/location conflict in the profile itself:** "Desired Job Location: No location preference (open to anywhere in the US)" but "Willing to relocate? No." These two answers conflict with each other, and neither confirms willingness to work onsite in San Francisco specifically (current base is Boston, MA). This is an application-question matter, not something resume content resolves, but it is a real risk against Suno's onsite SF requirement.
8. **Education issue:** no bachelor's degree listed anywhere in the source, despite holding an MS. Likely an export omission; needs confirmation before being stated or omitted definitively in any delivered resume.
9. **Title/verb check:** "Founding Software Engineer" and "led" are not overclaimed relative to context (small-team, no explicit false leadership claims found).

## Fit direction

- **Best fit:** applied ML/AI engineering roles centered on LLM integration, RAG, retrieval-augmented systems, and production API/backend work, ideally in a regulated or data-sensitive domain (healthcare, fintech) where her Codametrix/Amwell experience is most directly relevant.
- **Not a fit:** roles that gate hard on first-principles statistical/ML modeling, recommendation-system/ranking work on real user interaction data, or a PhD-level research background; on the current evidence this candidate would need to lean heavily on the one personal retrieval/ranking project to even partially address that gap, and has no professional experience with experimentation/causal analysis.
