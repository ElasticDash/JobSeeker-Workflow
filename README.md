# JobSeeker Workflow

A local Claude Code rebuild of the `ideal-cv-pipeline-v4` kit plus
`wideapply-campaign-pipeline`, which chains resume generation with job
sourcing and lead-to-todo conversion into a full campaign run. See
`CLAUDE.md` for the house rules every skill here follows, and
`PROMPTS.md` for the full dictionary of ready-to-send templates.

This file covers one specific flow: sourcing jobs for a candidate across
four providers at once (Hirebase, direct-ATS APIs, Apify/Wellfound, and
GrokBot's board-tier sources) and getting them all logged to a campaign.

## How to start a sourcing run

### Step 1 — paste the candidate's profile into `.temp/`

Drop the candidate's WideApply profile export (a `.md` file) into `.temp/`
in this repo, e.g. `.temp/<candidate-name>-wideapply-export.md`. `.temp/`
is gitignored — this is a scratch/working directory, not something that
gets committed.

**Check the file before using it.** The `## Contact` section's `Name`
field is the authoritative identity, not the filename or the H1 header —
several real exports in this repo have had a stale header left over from
a different candidate. If the two don't match, flag it rather than
silently picking one.

### Step 2 — ask one agent to fill in the four sourcing prompts

Open a Claude Code chat in this repo and send PROMPTS.md's
[template 14](PROMPTS.md#14-generate-the-four-sourcing-and-log-prompts-for-a-candidate)
with the profile path from Step 1, the target title, the campaign ID, a
target job count, and the environment:

```
Read .temp/test_prompt.md's template and this candidate's profile, derive every profile-specific field it calls for, and produce the four fully filled-in, ready-to-run sourcing prompts — Prompt 1 (Hirebase), Prompt 2 (ATS-direct), Prompt 3 (Apify/Wellfound), Prompt 4 (GrokBot board-tier, parts 4a and 4b). Hand back the four filled prompts for review — do not run any of them yet.

Campaign ID: <campaign_id>
Candidate profile: .temp/<candidate-name>-wideapply-export.md
Target title(s): <target_title>
Target job count (N): <n>
Environment: dev
```

This agent ("agent 1") is a drafting step only — it does not source or
push anything itself. It reads the candidate's profile, derives the
shared fields every prompt needs (Skills-list keywords, real core
languages, the relocation-aware location gate, the national-security
gate, the title-family exclusion sets, full-time-only YOE), and hands
back four filled-in prompts:

1. **Prompt 1 — Hirebase**
2. **Prompt 2 — ATS APIs direct**
3. **Prompt 3 — Apify / Wellfound**
4. **Prompt 4 — GrokBot, board-tier sources** (split into **4a**, pasted
   into GrokBot itself, and **4b**, run afterward once GrokBot's results
   exist — see Step 3)

Review all four before moving on — this is the point to catch a wrong
title, a missed location constraint, or a misread profile before any of
them touch a real campaign.

### Step 3 — run the four prompts, in parallel

Open four separate sessions (tabs/chats) and send one prompt to each:

| Prompt | Where it runs | What happens |
|---|---|---|
| 1 — Hirebase | A new Claude Code agent | Sources, screens, shows the mapped table, then logs straight to the campaign. |
| 2 — ATS-direct | A new Claude Code agent | Pulls every covered company's own ATS API, screens, shows the mapped table, then logs straight to the campaign. |
| 3 — Apify / Wellfound | A new Claude Code agent | Runs `candidate-job-matcher-apify`'s board search + filter cascade, shows the mapped table, then logs straight to the campaign. |
| 4a — GrokBot condition | GrokBot itself, not a Claude Code agent | Produces the raw board-tier results for the 6 non-Wellfound boards. |

**Prompts 1, 2, and 3 are fully automatic** once you say go: each one
sources, screens against the candidate's profile, shows you the mapped
job table, and — after you approve it — logs the accepted jobs straight
into the given campaign ID itself. Nothing further to do for these three
beyond approving the mapped table.

**Prompt 4 (GrokBot) is the one manual exception.** GrokBot isn't wired
into this repo as a skill, so there's no way for an agent to run it and
read the results back in the same turn:

1. Send **4a** into GrokBot directly (not a Claude Code chat) and let it
   run.
2. Save GrokBot's raw output somewhere under `.temp/`.
3. Open a **new** agent turn (it can be a fresh session, or the same one
   that ran 4a if GrokBot's output is already in its context) and send it
   **4b**, pointing at the saved output. That agent screens the raw
   results against the candidate's profile, shows the mapped table, and
   — once approved — logs them to the campaign the same way Prompts 1-3
   do.

Only this last hop is "manual" — everything else, including the actual
campaign writes for all four sources, happens inside the agent turns
themselves.

## Why four sources instead of one

Each pulls from a different part of the job market and none of them
overlap in what they can cover on their own — see `.temp/test_prompt.md`'s
"On duplication across the four prompts" section for why running all four
for the same candidate is safe (duplicate company+role pairs are rejected
at insert time regardless of which source found them first).

## Further reading

- `CLAUDE.md` — house rules for resumes, screening, and this repo's
  skills, kept up to date as changes land.
- `PROMPTS.md` — the full prompt dictionary, including the "Full pipeline
  addendum" to append to any of the four prompts above if resume
  generation and lead outreach should run too, not just sourcing.
- `.temp/test_prompt.md` — the actual template agent 1 fills in; read it
  directly if you want to see exactly what each of the four prompts
  contains before generating them.
