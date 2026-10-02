# Confirmation lists (running, updated through Stage 3)

## Needs candidate confirmation (most interview-exposed first)

1. **Location/relocation conflict.** Candidate's own profile has two contradictory answers: "No location preference (open to anywhere in the US)" versus "Willing to relocate? No". The job is onsite in San Francisco; candidate's current location is Boston, MA. Per the Header location rule, "not willing to relocate" means no "(able to relocate)" note was added and this was instead logged as a hard gap. Confirm with the candidate which answer is correct before this application proceeds, since an onsite SF role with a "not willing to relocate" answer on file is very likely a hard screen-out regardless of resume content.
2. **The entire Codametrix reranking-model narrative (first-principles ranking model, implicit feedback from reviewer corrections, pairwise ranking loss comparison, latency-budget tradeoff, staged-configuration evaluation) is new framing, not in the source material.** The source only said Codametrix built RAG pipelines with Pinecone retrieval and FastAPI/AWS deployment at 120-200ms latency; it never described a learned reranking/ranking-loss model, implicit-feedback training signal, or a staged in-production comparison. This is the single most interview-exposed claim on the page (it is now the headline evidence for the JD's hardest requirements) and the candidate must be able to speak to it in detail or it should be cut.
3. **The Amwell "ranking step" / ranking-model framing of the recommendation feature is new.** Source said "Built a RAG solution using LangChain and LLM-based reasoning to retrieve domain knowledge and power recommendations, improving match accuracy by 35%." The rewrite recasts this as a ranking step trained on historical match outcomes. The 35% figure is preserved from the source, but the "ranking step scored on historical match outcomes as a training signal" mechanism is invented and needs the candidate's confirmation or correction.
4. **LinkedIn URL mismatch.** The profile lists linkedin.com/in/coryrowens, which does not match the candidate's name (Agrima Jain). Confirm this is actually her profile before it goes out on a resume; if it is a data error, get the correct URL.
5. **No bachelor's degree appears anywhere in the source material**, only the MS. A master's normally requires a bachelor's. Confirm whether to add an undergraduate degree line (with real institution/dates) or leave education as MS-only; nothing has been invented here.
6. **HappyMonk "exposing the results through FastAPI and Node endpoints"**: the bullet merges in backend/infra content that was originally its own separate source bullet; confirm this combination reads accurately (no new facts added beyond merging what was already stated).
7. **mAP figure softened.** Source states "93.5% mAP" for the YOLOv5 model; the resume rounds this to "a high-90s mAP" to manage on-page percentage density. Confirm 93.5% is accurate (it is preserved faithfully in substance, just not stated as an exact figure); restore the exact number if preferred.
8. **Codametrix voice-transcription bullet** ("Added a voice transcription pipeline on the Whisper API as a new input modality") is a trimmed version of the source bullet; no new facts added, but the clinical-reviewer-feedback detail that was in an earlier draft of this bullet was moved into the "Iterated on the reranker..." bullet instead. Confirm reviewer feedback shaping ranking/extraction logic is something the candidate can speak to.
9. **"Trading model size against response speed"** framing in the Profile and the "Kept the reranker small enough..." Codametrix bullet imply a deliberate model-size-vs-latency design tradeoff was made and reasoned about explicitly; confirm the candidate can explain this tradeoff in interview terms (what alternative was rejected and why).

## Intentional imperfections

1. "FastAPI and Node endpoints" (HappyMonk, bullet 1) vs "Node.js" in the Skills list: inconsistent naming of a non-JD tool between a bullet and Skills. Clean version: "FastAPI and Node.js endpoints".
2. "Docker, Git & CI/CD on AWS" (HappyMonk, bullet 3): one ampersand shorthand. Clean version: "Docker, Git, and CI/CD on AWS".

## Gaps

### Hard gaps (permitted kinds only)

- **Location/relocation (Gap rule 3, fixed fact outside experience).** The candidate's profile states she is not willing to relocate, while the role is onsite in San Francisco and she is based in Boston, MA. No resume content can resolve this; it is an application-question/logistics fact, not an experience gap. See Needs candidate confirmation item 1: this may simply be a data-entry contradiction in the profile that needs clearing up before the application proceeds.

### Non-hard gaps (H/N items left Weak or Missing, at most 3)

1. **H2 (translate abstract objectives such as relevance, novelty, diversity into measurable metrics)** — left implied rather than given a standalone bullet; covered only loosely through the accuracy-lift and match-accuracy bullets.
2. **N1 (love of music)** — left Missing. No evidence anywhere in the source material that the candidate has any connection to music; nothing invented.
3. **N2 (consumer-scale / consumer entertainment product experience)** — left Missing. All of the candidate's real experience is healthcare/telehealth (B2B/B2B2C), not consumer entertainment; no fixed employer could plausibly carry this without an implausible transplant.

## Note on M1 (PhD or equivalent experience)

This is the JD's highest-weight, hardest-to-satisfy requirement and is explicitly "PhD or equivalent experience." The candidate holds an MS (no PhD) and has no professional first-principles-modeling or recommendation/ranking experience in the source material; everything covering M1/M2/M4 in this draft is new framing built on top of real underlying work (Codametrix's RAG/extraction system, Amwell's recommendation feature), not independently verifiable prior claims. This is flagged again here because it is the single biggest risk to this resume surviving a hiring-manager-level check, not just an HR skim, and is highly likely to be scrutinized or to require the invented-claim items above (2 and 3) to be either confirmed in detail by the candidate or walked back.
