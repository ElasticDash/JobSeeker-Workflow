# Confirmation Lists: Agrima Jain / Parallel Systems

## Needs candidate confirmation

Most interview-exposed first.

1. **Relocation to Los Angeles, CA.** The candidate's application-question material states "Willing to relocate? No," while this role is onsite in Los Angeles and her current location is Boston, MA. Per this repo's house rule ("treat relocation as possible, location gate passes"), the location/relocation check is scored Pass regardless of this stated preference, so it no longer blocks the pipeline. It is still worth the candidate confirming her real relocation intent before an offer stage, independent of how the resume pipeline scores it.
2. **TypeScript/React internal dashboard at Codametrix** ("Put together a lightweight TypeScript and React dashboard for monitoring extraction accuracy and pipeline health"). This bullet is invented to cover the JD's highest-weight requirement (TypeScript + component-based UI). Confirm, adjust to match something she actually built, or be ready to discuss specifics (what it monitored, how it was deployed, who used it) in an interview.
3. **AI coding assistant pairing at Codametrix** ("using AI coding assistants to draft eval scripts faster and checking their output carefully before trusting the numbers"). Invented to cover the JD's explicit requirement for AI-coding-tool experience with honest self-correction. Confirm or replace with a real example of a mistake an AI tool made that she caught.
4. **Log Analyzer CLI personal project in Rust** ("Taught myself Rust over a few weekends and built a command-line tool that parses and summarizes service logs"). Invented to cover the JD's Rust/fast-language-pickup requirement and to literally surface the keyword "Rust" on the page. Confirm, replace with a real Rust exercise if one exists, or be ready to speak to this project's actual scope if kept.
5. **Codametrix stakeholder bullet, added specific (Stage 4A fix for HM-4)**: "...then turned what they described into concrete decisions about the extraction schema and API responses the rest of the system relied on..." The underlying collaboration (working directly with clinical stakeholders, shaping the system around their feedback) is from the source material; the added specific that this translated into "extraction schema and API responses" decisions is new detail, added to more squarely show the JD's "turn ambiguous operational needs into a working interface" check. Confirm this level of specificity matches what she actually decided, or soften back to the general framing.

## Intentional imperfections

Finalized at the stage 5 humanize pass (replaces the earlier stage-3/4A placeholders). Two planned, each a different G13 type, at most one per role, each quoted with its clean version so either can be removed.

1. (Codametrix; type 2, a slightly clumsy but clear phrase in the candidate's own voice) "Put together a lightweight TypeScript and React dashboard for monitoring extraction accuracy and pipeline health." → clean version: "Built a lightweight TypeScript and React dashboard for monitoring extraction accuracy and pipeline health."
2. (HappyMonk AI Labs; type 6, one run-on bullet joining two actions with "and" and no comma) "...scoping loosely defined problems on my own and owning delivery from design through rollout, while explaining trade-offs..." → clean version: "...scoping loosely defined problems on my own, and owning delivery from design through rollout, while explaining trade-offs..."

## For you to decide (from the stage 5 humanize pass)

- **Percentages on the page (G3 density).** The resume carries 3 percentages (35% match-accuracy lift at Amwell, about 40% latency cut at Amwell, 93.5% mAP at HappyMonk), one over the "at most 2" guideline. All three are genuine numbers carried over from the candidate's own source material in their original context, so none was changed or dropped unilaterally. If the candidate wants to come in under the guideline, the lowest-stakes one to drop to a plain statement is the Amwell latency bullet: "Added Redis caching to an LLM-backed microservice, containerized with Docker and wired into CI/CD, noticeably cutting production latency." Otherwise, leaving all three is defensible since they sit in three different roles and measure three different things.
- **Semantic Image-Text Retrieval Engine project dropped.** This personal project (improving search relevance 30%, cutting retrieval latency 25%) was cut from the Projects section during the humanize pass: it maps to no M/H/N item for this JD, and its bullet carried two percentages at once, which is its own density flag. If the candidate wants it back in (e.g. for a different application), it is preserved in `03_ideal_cv_v2.md` (the pre-humanize version).
- **Study/work overlap.** The MS CS (Northeastern, Jan 2024 to Dec 2025 as listed) overlaps both the Amwell internship (May to Aug 2025) and about the first three months of the current Codametrix role (Sep to Dec 2025). Worth confirming with the candidate whether the program was part-time, already finished early, or the listed end date is just the formal conferral date, so this does not read as an unexplained full-time-work-plus-full-time-study overlap in an interview.
- **Whisper at HappyMonk (Jan 2021 to Nov 2023).** OpenAI's Whisper API released in September 2022, so "fine-tuned Whisper" only fits the last roughly 14 months of this 35-month role; Wav2Vec2 (the bullet's other model) fits the whole window. This is in the source material as given, not something this pipeline added, and is plausible as written (most of the role on Wav2Vec2, Whisper picked up later), but is worth the candidate being ready to place in time if asked.
- **Skills-tool density in bullets.** About 11 of 13 experience bullets name a Skills-listed tool. For a hands-on engineering role this is expected and was not changed; flagged only because the humanizer's general guidance aims for about half, which does not fit a technical IC resume well here.

## Gaps

### Hard gaps

None. The location/relocation item was the only hard gap identified at stage 4, and it is resolved by this repo's house rule (relocation is always treated as possible), not by any resume edit.

### Non-hard gaps (at most 3, per the ideal-candidate rules)

- **H2, collaboration across a hardware/software boundary.** Her real cross-functional collaboration is with clinical/healthcare stakeholders (Codametrix, HappyMonk), not vehicle or systems engineers. Left as an analogous but not literal match; not reframed into a hardware/vehicle claim since nothing in her record plausibly supports it.
- **H3/N1, desktop wrappers (Electron, Tauri).** No Electron or Tauri exposure anywhere in her record; left uncovered rather than invented, since the Rust keyword/evidence already satisfies the HR skim check's "Rust or Electron" requirement.
- **N3, networks/OS/distributed systems coursework.** No coursework details exist in the source material for her MS CS; left uncovered rather than inventing a coursework list under a fixed Education entry.
