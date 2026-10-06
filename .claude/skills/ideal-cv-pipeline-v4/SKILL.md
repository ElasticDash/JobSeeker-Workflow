---
name: "ideal-cv-pipeline-v4"
description: "Use instead of ideal-cv-pipeline, v2 and v3: the v3 JD plus CV to one-page ideal-candidate .docx pipeline, then an automatic push of the finished files to the team Google Drive. Triggers: 走全流程, 跑一遍 pipeline, ideal CV pipeline."
---

# Ideal CV Pipeline v4

Chains skill runs in a fixed order. This skill does no resume work itself: at each stage, load the named skill with the Skill tool and follow its instructions, except where this file overrides them. Never skip a stage, never reorder stages, never merge two stages into one pass.

v4 is v3 plus stage 8, which puts the finished .docx files into the team Google Drive for review, plus stage 9, which researches and pushes hiring-side leads for the target company.

The gates are pass/fail screens (`cv-pass-check`), not match scores. A gap found at the first check may be fixed automatically once. Anything that cannot be fixed, and any gap found at the second check, goes to a human.

This runs in Claude Code locally, not claude.ai: there is no `SendUserFile`, no cloud scratchpad and no remote-devices bridge. "Send" a deliverable by leaving it at its working-directory path and stating that path in the reply.

## Settings

- `IDEAL_CANDIDATE = ideal-candidate-2026-09-27`: the skill used in stage 3. Swap in a newer version here.
- `AUTO_FIX_ROUNDS = 1`: automatic fix rounds allowed after the first check.
- Triage settings (`TOLERANCE_MONTHS`, `PARTIAL_FIX`) live in `cv-pass-gap-triage`.
- `PUSH_TO_DRIVE = true`: run stage 8. Set false only if the user says not to push this run.
- `PUSH_LEADS = true`: run stage 9. Set false, or it auto-downgrades to research-only, whenever `campaignId` (input 6) is missing — never guess or look one up.

## Inputs

1. **Job description** (raw text, paste, or link)
2. **Candidate profile** (LinkedIn or WideApply export, bio, or other profile text)
3. **Original CV template**: the candidate's .docx resume. It is both candidate material and the layout for stage 7.
4. **Contact set 1**: a phone number and an email address (optional). This is an **application-submission identity**, not the candidate's own contact — see "Contact sets and output files" below for why those two are now kept on separate files.
5. **Contact set 2**: a phone number and an email address (optional). A second application-submission identity, same purpose as set 1.
6. **WideApply `campaignId`** (optional): the candidate's campaign in ElasticDash-BE. Needed only for stage 9's leads push. If `PUSH_LEADS` is true and this is missing, ask for it once alongside any other opening question; if the user isn't there to answer, run stage 9 as research-only (find leads, skip the push) and say why.

The JD is required, and so is at least one of the candidate profile or the original CV. If either is missing, ask before starting. Two copies of the same file do not count as two inputs.

**Template check at the start.** Stage 7 needs a .docx template.
- If the original CV template is a .docx, use it.
- If not, ask for one in the first reply, together with any other question, and start stages 1 to 3 while waiting.
- If the user is not there to answer, run through stage 6 and stop before stage 7 with the final text.

## Contact sets and output files

The resume content is written once. Stage 7 turns it into separate .docx files that differ only in phone number and email — but the two kinds of file now serve two different audiences, and must never be confused:

- **Original** (exactly one, always generated): phone and email come from the candidate's own profile (then the template as fallback) — never from a supplied contact set, even when one was given. This is the **candidate-facing** file: it gets rendered to PDF and is what the candidate sees of their own resume.
- **Application** (one per contact set supplied, zero if none were): phone and email come from that contact set. This is the **admin-only** file: it stays a .docx, is never shown to the candidate, and is the version admin actually uses to submit the application — not the Original/candidate-facing one. Its whole purpose is to carry an application-submission identity (a tracking number, an alias inbox) that is deliberately different from the candidate's real contact info.

| Contact sets supplied | .docx files |
|---|---|
| Two | Original, plus two Application files (one per set) |
| One | Original, plus one Application file |
| None | Original only — since there is no separate application identity, admin also uses this file to apply |

A lone phone number or email given with no second set is Application set 1. If a supplied set resolves to the same phone and email as the profile's, still build it as a separate Application file and say so (the point is the file's role, not whether the digits happen to differ).

**Pairing.** Values are grouped into sets as the user gave them (labelled "set 1" / "set 2", or listed as phone and email pairs). If the values do not pair clearly (e.g. two emails and one phone), ask how they pair. If the user is not there, pair them in the order given, fill the gap as below, and flag it in the reply.

**Filling the Original file.** Phone and email come from the candidate profile; if the profile is missing a field, fall back to the original CV template. Never pull from a supplied contact set here — a contact set is an application identity, not a candidate-contact override, and letting one leak into the Original file is exactly the mistake this section exists to prevent.

**Filling each Application set.** Within each set, each field is resolved on its own, and the first source that has it wins:

1. The value supplied in that set.
2. The candidate profile.
3. The original CV template.

So a set with only an email gets its phone from the profile, then the template. A phone number or email that appears inside the pasted profile or CV text belongs to that source, not to a supplied set. If it is unclear whether a value was supplied or is part of the pasted material, ask.

Rules:
- Use each value exactly as given, with surrounding whitespace trimmed. Do not reformat the phone number or change the email.
- The winning value replaces the others completely. Never show two phone numbers or two emails in one file, and never prefer a lower source because it looks more complete or more recent.
- A supplied email with no "@" or no domain, or a phone number with fewer than 7 digits, is probably a typo: ask before starting. If the user is not there, fall back to the next source for that field and flag it in the reply.
- If no source has a field, leave it off that file's contact line and add "Confirm phone number" or "Confirm email address" to Needs candidate confirmation. Never invent one.
- This section governs phone and email only. Name, links (LinkedIn, portfolio) and location follow `IDEAL_CANDIDATE`'s header rules, including its Header location rule, and are the same in every file.

Save to `00_contact.md`: a block for Original (profile/template-sourced, with each field's source) first, then one block per Application set (Set 1, Set 2) with its phone, email and the source of each (supplied, profile, template, or none), then every other phone number and email seen in the material that no file uses. This file is the only source of phone and email for every later stage.

## Working files

Save every stage's output to the working directory with Write. Later stages read from these files, never from memory of earlier output.

- `00_contact.md`: contact sets, their sources, and the unused values
- `01_jd_eval.md`: jd-evaluator output (M, H, N items)
- `01_pass_list.md`: requirement-finder output (HR and hiring manager pass lists)
- `02_cv_analysis.md`
- `03_ideal_cv.md`: always the current version. Keep earlier versions as `03_ideal_cv_v1.md`, `_v2`, ...
- `04_check_log.md`: every cv-pass-check run appended, with stage, final result and the failed checks
- `04a_triage.md`, `06a_triage.md`: triage outputs
- `05_confirmation.md`: running lists (Needs candidate confirmation, Intentional imperfections, Gaps)
- `08_drive.md`: per-file Drive name, status and view link from stage 8
- `09_leads.md`: hiring-contact-finder output and the push result
- `handoff.md`: only when the run stops for a human

Set up a task list with the stages and tick each one off as it finishes.

## Stage 1: JD analysis

1. Run `jd-evaluator-2026-09-27` on the JD. Save to `01_jd_eval.md`. Its item IDs (M, H, N) stay fixed for every later stage.
2. Run `requirement-finder` on the same JD. Save to `01_pass_list.md`. This is the pass list for every cv-pass-check run.

## Stage 2: Candidate analysis

Run `cv-analyzer-2026-09-27` on the candidate material (the profile and the original CV).
- If both were given, reconcile them first.
- Do not add the JD fit section; checking is stage 4's job.
- Save to `02_cv_analysis.md`.

## Stage 3: Ideal candidate

Run `IDEAL_CANDIDATE`, all of its steps 1 to 8, including its humanize pass and final recheck.

Inputs:
- `01_jd_eval.md` as the analyzed JD
- `02_cv_analysis.md`
- the raw candidate material, which is needed for exact employer names, dates, titles and education
- `00_contact.md`

**Override:** in the header, the phone number and email are the **Original** file's, from `00_contact.md` (profile, then template) — never a supplied contact set's, even if one was given. Every Application set's contact is swapped in only in stage 7, on its own separate file. The rest of the header follows `IDEAL_CANDIDATE`'s rules.

Save the resume to `03_ideal_cv.md` and its closing lists to `05_confirmation.md`. Add any "Confirm phone number" or "Confirm email address" item from `00_contact.md` to Needs candidate confirmation, naming which file (Original or which Application set) it applies to.

## Stage 4: First check

Run `cv-pass-check`:
- Pass list: `01_pass_list.md`
- CV: `03_ideal_cv.md`

Log the result in `04_check_log.md`.

- **Final result PASS:** go to stage 5.
- **Final result FAIL:** go to stage 4A.

### Stage 4A: Triage and fix

1. Run `cv-pass-gap-triage` in mode `first`.
   - Inputs: the stage 4 output, `01_pass_list.md`, `03_ideal_cv.md`, and the fixed frame from `02_cv_analysis.md` plus the raw material.
   - Save to `04a_triage.md`.
2. **Triage result HANDOFF:** stop the pipeline and hand off (see Handoff).
3. **Triage result FIXABLE:**
   1. Run `cv-pass-gap-fix` with the triage output. It saves the new `03_ideal_cv.md` and updates `05_confirmation.md`.
   2. Run `cv-pass-check` again, with the same pass list, and log it.
   3. **PASS:** go to stage 5.
   4. **FAIL:** stop and hand off. Do not triage again: `AUTO_FIX_ROUNDS` is 1. Run `cv-pass-gap-triage` in mode `second` only to build the handoff package, save it to `04a_triage.md`, then hand off.

No stage after stage 3 changes the phone number or email. If any edit touches the contact line, restore the **Original** file's values from `00_contact.md` (never an Application set's).

## Stage 5: Humanize

Run `humanizer-us-resume` on the whole of `03_ideal_cv.md`, including both scan scripts on a text copy, and fix what they flag.

The ideal-candidate rules win over any humanizer suggestion:
- 13-bullet cap, no repeated opening verbs
- fixed fields untouched
- no 3-word run from the JD anywhere on the page, except proper names
- numbers from the source CV are never changed silently
- 2 planned imperfections, not 3
- never remove the only evidence for a check that passed at stage 4. If a humanizer edit would weaken that evidence, keep the substance and change only the wording.

Then:
1. Run the ideal-candidate "reader tells to kill" checks and its reader test.
2. Put the humanizer's "For you to decide" items into `05_confirmation.md`. Its "What changed" section is not kept.
3. Rerun the role check on every role that changed, then run the ideal-candidate step 8 final recheck in full.
4. Save as the new `03_ideal_cv.md`.

## Stage 6: Second check

Run `cv-pass-check` with the same inputs as stage 4, and log it.

- **Final result PASS:** go to stage 7.
- **Final result FAIL:** go to stage 6A.

### Stage 6A: Handoff

Run `cv-pass-gap-triage` in mode `second`. It always returns HANDOFF, with every route filled and fix specs labelled "suggested, not applied". Save to `06a_triage.md`, then stop and hand off.

No automatic fix happens after the second check, even when triage marks a gap as fixable.

## Stage 7: Generate the files

Run `cv-file-generator-2026-09-27` once for the Original file and once per Application set in `00_contact.md`:
- Template: the original CV .docx.
- Content: the final `03_ideal_cv.md`, converted to the generator's `content.json`. The `contact` field uses that file's own phone number and email (the Original file's own profile-sourced contact, or that Application set's); every other field is the same for every file.

**Contact line.** Where the template's contact line holds an old phone or email, replace only that text and keep the template's separators, other items and formatting. If the old email is a hyperlink, change its `mailto:` target in `word/_rels/document.xml.rels` too.

**Order.** Build the **Original** file first (its contact is the profile's, never a supplied set's) and fit it to one page with the generator's trim rules, within these limits:
- Trimming must not remove the only evidence for any check that passed at stage 6. Trim other words instead.
- Trimming never removes the phone number or email.
- Long-tail terms may move to Skills. Note any such move.

Then build each **Application** file from the same trimmed content, changing only the contact line to that set's values. If an Application file runs past one page (a longer contact line can wrap), trim the shared content under the same limits and rebuild every file, so all files stay identical apart from phone and email.

**No PDF delivered.** Render each .docx to PDF in the scratchpad only, to check page count and line counts. Never send a PDF or save one as a deliverable, even when the generator produces one. (A real candidate-facing PDF of the Original file is generated downstream, by whichever caller attaches this resume to an application — not by this stage.)

After the content is in the template, rerun the role check using the real rendered line counts.

**File names.** Original: `First_Last_Resume.docx` (always this name, candidate-facing, regardless of how many Application sets exist). One Application set: `First_Last_Resume_Apply.docx`. Two Application sets: `First_Last_Resume_Apply1.docx` and `First_Last_Resume_Apply2.docx`.

**Contact check.** Before sending, search each .docx (`word/document.xml`, every `word/header*.xml` and `word/footer*.xml`, and `word/_rels/*.rels`):
- that file's own phone number and email each appear on the contact line
- for the Original file: no Application set's phone or email appears anywhere, including links — the candidate must never see an application-tracking number or alias inbox on their own copy
- for each Application file: the profile's real phone and email, and every other Application set's values, appear nowhere, including links — admin's application copy must never leak back the candidate's real contact either
- every unused value listed in `00_contact.md` appears nowhere

Fix any failure and rebuild before delivering.

## Stage 8: Push to Drive

Only after stage 7 passes its contact check. Run `push-resume-to-drive` on every .docx from stage 7:
- candidate name from the header
- company and short role label from `01_jd_eval.md` / the JD
- the Drive name keeps the file's role: `First_Last_Resume_<Company>_<RoleShort>.docx` for the Original, `_Apply` (or `_Apply1`/`_Apply2` with two sets) appended for each Application file

The files stay at their working-directory path regardless of the push outcome; that path is the deliverable, Drive is a copy. If the push fails its integrity check after retrying, the pipeline still counts as success: report the push status and move on. Never re-run stages 1 to 7 because of a push problem.

Save the result to `08_drive.md`, one line per file: Drive name, status (`in Drive` / `updated` / `upload failed integrity check` / `not pushed`), and the Drive view link if one was confirmed. A caller chaining this pipeline (e.g. a master pipeline that attaches the resume to a specific job application afterward) reads whichever file's link it actually needs from here rather than re-deriving it from prose — the **Original** file's link for anything candidate-facing, the **Application** file's link (falling back to Original if no contact set was supplied) for anything admin uses to actually submit the application. Never substitute one for the other.

A handoff run never reaches stage 8 or 9: nothing goes to Drive and no leads are researched until the resume passes.

## Stage 9: Leads

Only after stage 8. Research hiring-side contacts for the company this resume targets, and, if a campaign was given, save them against the candidate's WideApply campaign.

1. Run `hiring-contact-finder` for the company and role resolved in stage 8 (company name, website if known from the JD/candidate material, headcount if known, target role). Save the full table (including email/source/confidence columns) to `09_leads.md`.
2. If `PUSH_LEADS` is true and `campaignId` (input 6) was given:
   1. Map the table to `push-wideapply-leads`'s lead shape (`name`, `title`, `linkedinUrl`, `email`, `emailStatus`, `tier`, `source`, `confidence`, `notes`), translating tier/emailStatus/confidence labels to its exact lowercase values.
   2. Run `push-wideapply-leads` with that `campaignId` and the company name from stage 8.
   3. **If it 400s with "No application found for this company under this campaign"**: this candidate has no live WideApply application to this company yet. Do not retry or try to create one. Record this in `09_leads.md` and report it plainly, leads stay research-only for this run.
   4. Append the push result (counts, ids, or the error) to `09_leads.md`.
3. If `campaignId` was not given, or `PUSH_LEADS` is false, skip the push and say in the reply that leads were researched but not pushed, and why.

A leads-finder shortfall (fewer than 5 contacts, or none at all) is not a pipeline failure: report what was found and move on.

## Handoff

When the pipeline stops for a human:

1. Write `handoff.md` from the latest triage output:
   - where it stopped (stage 4A, after the fix round, or 6A)
   - the check trail from `04_check_log.md`
   - each open gap, with why it cannot be fixed or why it is waiting for a human
   - suggested fixes (second mode)
   - questions for the candidate
   - Confirm items
2. State the working-directory paths of the current `03_ideal_cv.md` and `handoff.md`.
3. Do not generate any .docx or PDF. Do not run stage 8 or 9.

## Output

Reply in the user's language. No em dashes anywhere.

**On success:**
1. The .docx files (the Original plus one per Application set), each at its working-directory path, captioned with its phone and email and which role it plays (candidate-facing Original, or admin-only Application — state plainly that admin should use the Application file, not the Original, to actually submit the application when one exists). No PDF.
2. Drive: one line per file with its Drive name and status from `push-resume-to-drive` (in Drive, updated, upload failed integrity check with byte sizes, or not pushed with the one-line fix), plus the candidate folder link.
3. Leads: the count found by `hiring-contact-finder`, and whether they were pushed to the campaign, skipped (no campaignId), or hit the no-live-application case, plus `09_leads.md`'s path.
4. One line: the check trail, e.g. "Stage 4 FAIL (HM-2) → fix → PASS → Stage 6 PASS".
5. One line per file: file name, phone and email, and the source of each, e.g. "Resume (Original): phone (profile), email (profile)" / "Resume_Apply: phone (supplied), email (profile)".
6. Needs candidate confirmation, most interview-exposed first.
7. Intentional imperfections, each quoted with its clean version.
8. Gaps still present, if any, as noted in the final check (Confirm items and anything tagged in the pass list as ranking only).
9. The generator's format notes and trims, in short form.

**On handoff:**
1. One bold line: stopped at stage 4A or 6A, and the failed checks.
2. The open gaps, each with a one-line reason.
3. The files (`03_ideal_cv.md` and `handoff.md`).
4. Nothing else: no .docx, no PDF, nothing pushed to Drive.

Give the assessment and deliverables only. Do not offer to write outreach emails, LinkedIn messages or client-facing copy. Do not recap the stages.