---
name: convert-wideapply-lead-to-email
description: Convert an already-inserted WideApply lead (hiring-side contact with an email address) into a 3-email Day 0/3/6 outreach draft sequence on a job application, via ElasticDash-BE's lead-convert-email API. Drafts only - nothing sends until a human admin approves each step. Use whenever the user wants a lead's email turned into outreach drafts, not just saved as research.
---

# Convert WideApply Lead to Email

Turns one `wideapply.Leads` row (already inserted by `push-wideapply-leads`) into three chained `kind: 'approve_response'` to-do drafts - Day 0 (open immediately), Day 3, Day 6 - by running `convert-lead-email.mjs` in this skill's own folder. The backend generates all 3 emails from the application's job description and the candidate's resume in one call. **This never sends anything itself, and the admin is not who approves it either** - approval happens only through the candidate's own board (`PATCH /wideapply/todos/:todoId`, ownership-checked against that candidate's `edUserId` - there is no admin-side route for this). Day 0 sits open for the CANDIDATE to review, optionally edit the subject/body, and approve or reject before it actually transmits (these go out in the candidate's own first-person voice, so WideApply never sends on their behalf without that explicit approval - see migration 034). Day 3/6 stay drafted until the step before them is approved and sent, not on a timer. The admin's own role stops at drafting (this skill) and assigning the sender - tell the user their candidate needs to go approve each step themselves, don't imply an admin action will send it. The script - not you - holds the auth key and makes the HTTP call; you only ever build the arguments and invoke it.

This is a standalone skill, run by hand per lead right now - it is **not** wired into `wideapply-campaign-pipeline`'s own stage 2c (unlike its LinkedIn sibling, `convert-wideapply-lead-to-todo`). `PROMPTS.md` template 9 wires it in at the prompt layer instead, for that one named flow. Loop it yourself across leads otherwise.

Converting a lead here never blocks also converting it to a LinkedIn connect-todo (`convert-wideapply-lead-to-todo`) - the two are tracked independently (`wideapply.Leads.converted_todo_item_id` vs. `converted_email_sequence_id`, migration 066). A lead can get both.

## Where this can actually execute

Same constraint as every other wideapply-*-skill here (`push-wideapply-leads`, `convert-wideapply-lead-to-todo`, `push-resume-to-application`): this needs a real shell on the user's machine. A Desktop app Chat/Cowork session gets file transfer, not shell access, even with the repo connected. If you're in a session without real shell access, build the exact command (see "Calling the script" below) and hand it to the user to run themselves, or paste into a Claude Code session on their machine.

## When this triggers

The user has a lead with an email address already saved to a campaign (via `push-wideapply-leads`, or already visible in the admin panel) and wants it turned into an outreach email draft sequence, not just left as research. Trigger on: "draft outreach emails for this lead", "convert this lead to an email sequence", "create email drafts for lead X".

**One lead per call.** To convert a batch, loop this skill once per `leadId`.

## Before calling this - things that are NOT automated

1. **The target application must already have an `email_sender_id` assigned.** This is a separate, deliberately manual admin action (`PUT /admin/campaigns/:campaignId/applications/:applicationId/email-sender`, picking from that candidate's own assigned sender pool) - this skill does not perform it and will not guess or auto-pick a sender. If it's missing, the call 400s with `This application has no email sender assigned yet`.
2. **The application needs a non-empty `jobDescription`** and **the candidate needs an already-parsed resume** (`wideapply.Resumes.raw_text`) - both required inputs to the generator. Missing either 400s with a specific message naming which one. The resume one is candidate-scoped, not application-scoped, and is unrelated to whether `push-resume-to-application` already attached a file to this application - see `push-wideapply-resume`, which exists specifically to populate it.
3. **The lead needs an `email`** - a lead with only a LinkedIn URL and no email should go through `convert-wideapply-lead-to-todo` instead, not this skill.

None of the above are things to retry around or work past - surface the exact message to the user.

## What you need before calling the script

1. **`campaignId`** and **`leadId`** - the user gives you these, or they come from a prior step in this conversation (e.g. an id `push-wideapply-leads` just inserted). Never guessed.
2. **`applicationId`** - optional. Only needed to disambiguate when the lead's company has more than one live application under this campaign; omit it when there's just one (the common case).
3. **Environment** - default to `dev`. Only use `prod` if the user explicitly says "prod" or "production". Before the *first* prod write in a session, confirm explicitly with the user even if they already said prod once.

## Calling the script

Run from the repo root:

```
node .claude/skills/convert-wideapply-lead-to-email/convert-lead-email.mjs --env dev --campaign <campaignId> --lead <leadId> [--application <applicationId>]
```

The script prints exactly one JSON line to stdout on success - `{"ok":true,"env":...,"campaign":...,"lead":...,"todoId":...,"emailStep":1,"status":"open","draftSubject":...,"target":...}` (`todoId` is Day 0's own to-do id; `target` is the lead's email address) - and a JSON error line to stderr with a non-zero exit code on failure. Relay the result back to the user in plain language; don't just paste the raw JSON. Tell the user Day 0 is now sitting open for review/approval in the admin panel - this call alone sends nothing.

## If it fails

- **`Lead not found on this campaign.`** - wrong `leadId`/`campaignId` pair, or the lead was deleted; tell the user, don't retry with a guessed id.
- **`This lead has no email address to send an outreach sequence to.`** - use `convert-wideapply-lead-to-todo` instead for this lead.
- **`This lead has already been converted to an email outreach sequence.`** - specifically this conversion path (`converted_email_sequence_id`, independent of the LinkedIn path's `converted_todo_item_id`); not an error to retry around - tell the user it's already done.
- **`This application has no email sender assigned yet - assign one before converting a lead to an email sequence.`** - a human admin needs to assign a sender from the candidate's pool first; tell the user, don't guess one.
- **`This application has no job description yet - add one before converting this lead.`** - tell the user; don't fetch the job posting URL yourself to work around it.
- **`This candidate has no parsed resume yet - a resume is required to draft the email sequence.`** - run `push-wideapply-resume` once for this candidate's campaign (see that skill - it populates `wideapply.Resumes.raw_text`, a candidate-scoped store this skill's resume upload never touches), then retry this conversion. Don't confuse this with `resumeParseController.js`/`POST /wideapply/resume/parse` - that's a stateless onboarding-side LLM extraction and does not write to the table this check reads.
- **`Could not generate the email sequence. Try again, or write it by hand.`** (502) - the model call failed or returned something unreadable; safe to tell the user to retry once, not to loop automatically.
- **`Multiple applications exist for this company — pass applicationId to specify which one.`** - pass `--application` with the specific one the user means.
- **`Env file not found: .secrets/wideapply-lead-convert-email-skill/.env.<env>`** - that environment hasn't been set up yet. Tell the user to create it (see "One-time setup" below) - you cannot create or fill in the key yourself.
- **401/403 from the backend** - the scoped key either isn't configured or isn't allowed on this route yet; see "One-time setup". Don't retry with a different key you make up.
- **Any other network/connection error** - the backend for that environment may be down or unreachable from this machine; tell the user, don't retry silently in a loop.

## What you must never do

- Never read, cat, or print the contents of `.secrets/wideapply-lead-convert-email-skill/.env.dev` or `.env.prod`. Only `convert-lead-email.mjs` touches them.
- Never ask the user to paste the service key into chat, and never type a key into a command yourself.
- Never add a generic "call any URL" capability to this skill or the script - it only ever calls the one convert-email endpoint.
- Never retry a prod write automatically after a failure without the user re-confirming.
- Never offer to approve, edit, or send the resulting Day 0/3/6 drafts yourself - that approval step belongs to a human admin (or the candidate) in the dashboard, not this skill. This skill's only job is creating the drafts.

## One-time setup (tell the user this if `.env.dev`/`.env.prod` don't exist yet)

Same scoped-key situation as `convert-wideapply-lead-to-todo` today: the intended design is a scoped `WIDEAPPLY_SERVICE_KEYS_JSON` entry restricted to exactly this route (`^/admin/campaigns/[^/]+/leads/[^/]+/convert-email$`), but as of this skill's creation the live backend's scoped-key source hasn't been confirmed working - see `convert-wideapply-lead-to-todo/SKILL.md`'s own "Current state" note for the full story. Until that's resolved, this can reuse the same stopgap unrestricted `WIDEAPPLY_SERVICE_KEY` value already in use for that skill.

Create `.secrets/wideapply-lead-convert-email-skill/.env.dev` (and `.env.prod` if needed), relative to the repo root, with:

```
ELASTICDASH_BE_BASE_URL=<the backend's base URL for that environment>
WIDEAPPLY_LEAD_CONVERT_EMAIL_SERVICE_KEY=<the key currently in use - see convert-wideapply-lead-to-todo's "Current state" note>
WIDEAPPLY_ADMIN_ED_USER_ID=<optional: an admin user id to attribute these writes to>
```

`.secrets/` is gitignored wholesale, and this skill's subfolder is separate from every other wideapply skill's - a leaked or revoked key here has no effect on those flows, and vice versa.
