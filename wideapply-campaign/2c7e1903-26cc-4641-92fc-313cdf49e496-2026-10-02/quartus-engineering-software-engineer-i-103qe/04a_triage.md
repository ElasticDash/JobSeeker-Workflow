# Gap Triage (Stage 4A, mode: first)

## Correction (post-handoff)

This run initially routed HR-5/K2 (location/relocation) to Human and ended in HANDOFF. That was an error: this repo's `CLAUDE.md` house rules, section "Screening and checks," state "Treat relocation as possible (location gate passes)." This is a standing scoring policy for this pipeline (verified by reading `CLAUDE.md` directly, not merely asserted), separate from the Header location rule in `ideal-candidate-2026-09-27` (which governs what the resume's header text says, not how the location/relocation check is scored). HR-5/K2 is re-scored PASS below under this house rule, regardless of the candidate's stated relocation preference. The resume's header itself is unchanged (still "Boston, MA," no relocation note), since her stated preference is real and the header location rule is a separate, correctly-applied mechanism; only the screening verdict changes.

## Re-triage of the remaining Borderline items

## Triage table

| ID | Check | Verdict (cause) | Kind | Route | Reason |
|---|---|---|---|---|---|
| HR-5/K2 | Location/hybrid willingness in San Diego, CA | **Pass (corrected)** | knockout | not a gap | Re-scored under `CLAUDE.md` house rule "Treat relocation as possible (location gate passes)." This check passes regardless of the candidate's stated relocation preference. No resume edit made; the header still reads "Boston, MA" per the Header location rule, which is a separate mechanism from this screening verdict. |
| HR-3 | Years roughly fits 0-2 band | Borderline (weak) | years (excess, not shortfall) | Ignore | This is overqualification, not a shortfall; the routing table's years rule covers shortfalls against a minimum, which does not apply here. Her total experience (~4.17 years, fixed dates) and MS are real and must not be downplayed or hidden to force-fit a junior band. Confirmed non-blocking per task instruction; treated as an accepted, honest risk flag rather than a fixable gap. |
| HM-7 | Cross-disciplinary team collaboration | Borderline (weak) | narrative | Experience | Strengthen the HappyMonk "field deployment partners" bullet to name the hardware/electrical engineers she coordinated with on camera and edge-device deployment, which the HappyMonk frame (small founding-engineer team on a vision/surveillance hardware product) can plausibly support. |
| HM-8 | Communication/presentation ability | Borderline (weak) | narrative | Experience | Broaden the Codametrix presentation bullet's audience to include engineering stakeholders alongside clinical/product, a small, low-risk wording change to the same real bullet. |

## Fix round (AUTO_FIX_ROUNDS = 1, applied this round)

## Fix specs

**HM-7, cross-disciplinary team collaboration**
- Section: Experience
- Target: HappyMonk AI Labs (Jan 2021 to Nov 2023), bullet: "Served as a founding engineer on a small team, working directly with customers and field deployment partners to scope hardware and software requirements, and documenting the detection and transcription APIs for the rest of the team."
- Must show: HM-7, a named hardware-discipline collaborator, not just "field deployment partners"
- Substance: a founding engineer at a small vision/surveillance-hardware startup plausibly coordinated directly with whoever built the camera and edge hardware (hardware and electrical engineers) on integration requirements
- Constraints: must keep proving H2 (documentation) and the general founding-engineer ownership story already in this bullet; avoid the JD's exact list "mechanical, hardware, optical, and electrical engineers"; opening verb "Served" already used once, stays
- Needs confirmation: yes, new claim

**HM-8, communication/presentation ability**
- Section: Experience
- Target: Codametrix (Sep 2025 to Present), bullet: "Presented pipeline design, evaluation results and tradeoffs to clinical and product stakeholders, translating their feedback into system changes."
- Must show: HM-8, presenting technical information to a broader group, not only clinical/product
- Substance: the same real presentation work, audience widened to include engineering stakeholders, which a pipeline-design review would realistically include
- Constraints: keep proving M7 and the stakeholder-translation story already in this bullet; opening verb "Presented" already used once, stays
- Needs confirmation: yes, minor addition (engineering audience)

## Capacity

- Bullet count before: 12. Bullet count after: 12 (both fixes rewrite existing bullets, no new bullets added).
- No conflicts: neither target bullet is the sole evidence for any already-passing check (HappyMonk's bullet 5 also carries H2/documentation, unaffected by the HM-7 wording change; Codametrix's bullet 4 continues to carry M7, unaffected by the HM-8 wording change).
- Role check: both roles stay within their existing line counts; no role crosses out of compliance.

## Decision

HR-5/K2 corrected to Pass (house rule). HR-3 routed Ignore. HM-7 and HM-8 routed Experience and fixed this round. No gap routed Human.

**Triage result: FIXABLE**
