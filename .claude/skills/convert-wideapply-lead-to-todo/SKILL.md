---
name: convert-wideapply-lead-to-todo
description: Convert an already-inserted WideApply lead (hiring-side contact) into a "connect on LinkedIn" to-do on a job application, via ElasticDash-BE's lead-convert API. Use whenever the user wants leads turned into connect-todos, not just saved as research.
---

# Convert WideApply Lead to Todo

Turns one `wideapply.Leads` row (already inserted by `push-wideapply-leads`) into a `linkedin_connection` to-do by running `convert-lead.mjs` in this skill's own folder, then triggers the backend's own AI-drafted private-message generation for that to-do's follow-up chain by running `generate-message.mjs` (also in this folder). The scripts — not you — hold the auth key and make the HTTP calls; you only ever build the arguments and invoke them.

**This skill never writes LinkedIn message content itself (changed 2026-10-05).** `leadMessageGenerator.js`'s `generateWideapplyLeadMessage` on ElasticDash-BE already drafts the chain's "Send private message to `<name>`" step — tuned to the lead's own `tier` (c_level/manager/peer/hr_recruiting, see `push-wideapply-leads`) — and already fires automatically once the candidate confirms the connection was accepted (`publishGeneratedLeadMessage` in `campaignsController.js`). `generate-message.mjs` just calls that same generator early, right after conversion, via the admin `regenerate-message` route, so the draft exists immediately instead of only appearing once the candidate's own lifecycle reaches that step. Never draft this message content yourself and pass it through a flag — there is no flag for it anymore (see below).

## Where this can actually execute

Same constraint as `push-wideapply-leads`, `push-wideapply-applications` and `push-resume-to-application`: this needs a real shell on the user's machine. A Desktop app Chat/Cowork session gets file transfer, not shell access, even with the repo connected. If you're in a session without real shell access, build the exact command (see "Calling the script" below) and hand it to the user to run themselves, or paste into a Claude Code session on their machine.

## When this triggers

The user has one or more leads already saved to a campaign (via `push-wideapply-leads`, or already visible in the admin panel) and wants them turned into "connect on LinkedIn" action items, not just left as research. Trigger on: "create connect todos for these leads", "turn these leads into to-dos", "convert lead X", "make a connection task for each lead we just found".

**One lead per call.** To convert a batch, loop this skill once per `leadId` — e.g. every id `push-wideapply-leads` just returned in its `{"ids":[...]}"` output.

## What you need before calling the script

1. **`campaignId`** and **`leadId`** — the user gives you these, or they come from a prior step in this conversation (e.g. the ids `push-wideapply-leads` just inserted). Never guessed.
2. **`applicationId`** — optional. Only needed to disambiguate when the lead's company has more than one live application under this campaign; omit it when there's just one (the common case). If omitted and the backend finds more than one match, the call fails with a 400 naming the ambiguity — pass `--application` then.
3. **`message`** — optional, and rarely used. A short LinkedIn connect note sent WITH the connection request itself — there is no backend generator for this specific one (it predates the connection being accepted, which is what `generateWideapplyLeadMessage` is scoped to), so only pass this when the *user* hands you exact text to use verbatim. Never draft it yourself. Omit it to leave content empty, same as this skill's behavior before this flag existed.
4. **The lead's own `tier`** — not a parameter to this script, but confirm it was actually set correctly when the lead was pushed (`push-wideapply-leads`'s `c_level`/`manager`/`peer`/`hr_recruiting`). The backend's post-accept message generation branches its whole hook/framing on this field (see `leadMessageGenerator.js`'s `SYSTEM_PROMPT`) — a missing or wrong tier means a worse-fit draft, not a failure either script would surface.
5. **Environment** — default to `dev`. Only use `prod` if the user explicitly says "prod" or "production". Before the *first* prod write in a session, confirm explicitly with the user even if they already said prod once.

## Calling the scripts

Run from the repo root — convert first, then trigger the backend's own message generation for the chain's follow-up step:

```
node .claude/skills/convert-wideapply-lead-to-todo/convert-lead.mjs --env dev --campaign <campaignId> --lead <leadId> [--application <applicationId>] [--message "<user-supplied connect note, verbatim>"]
node .claude/skills/convert-wideapply-lead-to-todo/generate-message.mjs --env dev --campaign <campaignId> --lead <leadId>
```

Quote `--message` since it's free text that can contain spaces.

Run `generate-message.mjs` for every lead converted here, not just on request — without it, the chain's private-message step sits empty until the candidate confirms the connection was accepted, which is a worse default now that drafting it yourself is out of scope. A `generate-message.mjs` failure is non-fatal to the conversion itself (the to-do and its chain already exist either way) — report it, don't retry in a loop, and note that the backend's own accept-confirmation trigger will still get another chance at it later.

Converting a lead here never blocks also converting it to an email outreach sequence (`convert-wideapply-lead-to-email`) — the two are tracked independently (`wideapply.Leads.converted_todo_item_id` vs. `converted_email_sequence_id`, migration 066). A lead can get both a LinkedIn connect-todo and an email sequence; the email sequence's content is entirely backend-generated at conversion time already — see that skill, no separate trigger step needed there.

`convert-lead.mjs` prints exactly one JSON line to stdout on success — `{"ok":true,"env":...,"campaign":...,"lead":...,"todoId":...,"target":...}` (`target` is the lead's LinkedIn URL, carried onto the to-do). `generate-message.mjs` prints `{"ok":true,"env":...,"campaign":...,"lead":...,"todoId":...,"status":...}` on success. Both print a JSON error line to stderr with a non-zero exit code on failure. Relay results back to the user in plain language; don't just paste the raw JSON.

## If it fails

- **`Lead not found on this campaign.`** — wrong `leadId`/`campaignId` pair, or the lead was deleted; tell the user, don't retry with a guessed id.
- **`This lead has already been converted to a to-do.`** — specifically the LinkedIn connect-todo path; not an error to retry around; tell the user it's already done (the original to-do still exists, this call doesn't create a second one). Doesn't mean the lead can't still be converted to an email sequence separately (`convert-wideapply-lead-to-email`) — that's a different, independent check.
- **`Multiple applications exist for this company — pass applicationId to specify which one.`** — pass `--application` with the specific one the user means.
- **`No live application found for this company — has it been removed?`** — the company has no live application on this campaign at all; tell the user, don't retry.
- **`Env file not found: .secrets/wideapply-lead-convert-skill/.env.<env>`** — that environment hasn't been set up yet. Tell the user to create it (see "One-time setup" below) — you cannot create or fill in the key yourself.
- **401/403 from the backend** — the scoped key either isn't configured or isn't allowed on this route yet; see "One-time setup". Don't retry with a different key you make up.
- **Any other network/connection error** — the backend for that environment may be down or unreachable from this machine; tell the user, don't retry silently in a loop.

`generate-message.mjs`-specific failures:

- **`No LinkedIn message draft found for this lead.`** — `convert-lead.mjs` wasn't actually run first (or the chain this lead belongs to was never given a message step); run the convert call before this one, don't retry this script in a loop expecting it to appear.
- **`This message has already been resolved - nothing left to regenerate.`** — the candidate already marked this step sent (or it was dismissed); not an error to retry around, tell the user it's done.
- **`Could not regenerate the message. Try again, or write it by hand.`** (502) — the model call failed or returned something unreadable server-side; safe to tell the user to retry once, not to loop automatically, and not a reason to fall back to drafting it yourself.

## What you must never do

- Never draft the chain's follow-up/private-message content yourself, in any form — that's `generateWideapplyLeadMessage` on the backend now; `generate-message.mjs` is how this skill asks for it.
- Never read, cat, or print the contents of `.secrets/wideapply-lead-convert-skill/.env.dev` or `.env.prod`. Only `convert-lead.mjs`/`generate-message.mjs` touch them.
- Never ask the user to paste the service key into chat, and never type a key into a command yourself.
- Never add a generic "call any URL" capability to this skill or its scripts — they only ever call the convert and regenerate-message endpoints.
- Never retry a prod write automatically after a failure without the user re-confirming.

## One-time setup (tell the user this if `.env.dev`/`.env.prod` don't exist yet)

**Current state (as of 2026-10-02): this runs on the unrestricted `WIDEAPPLY_SERVICE_KEY`, not a scoped key.** The intended design is a scoped entry in ElasticDash-BE's `WIDEAPPLY_SERVICE_KEYS_JSON`, restricted to exactly the two routes this skill's scripts call (convert, and — added 2026-10-05 for `generate-message.mjs` — regenerate-message):

```json
{
  "id": "convert-wideapply-lead-to-todo",
  "key": "<a newly generated, sufficiently random secret>",
  "allowedRoutes": [
    { "method": "POST", "pathPattern": "^/admin/campaigns/[^/]+/leads/[^/]+/convert$" },
    { "method": "POST", "pathPattern": "^/admin/campaigns/[^/]+/leads/[^/]+/regenerate-message$" }
  ]
}
```

But the live `devserver.elasticdash.com` doesn't read its `WIDEAPPLY_SERVICE_KEYS_JSON` from anywhere this local repo checkout could identify (confirmed: identical scoped-key entries added to both `ElasticDash-BE/.env` and `.env.test.local` locally, server restarted, still 401 — the live server's actual env source wasn't found). As a stopgap, `WIDEAPPLY_LEAD_CONVERT_SERVICE_KEY` below is currently set to the same value as the live server's single unrestricted `WIDEAPPLY_SERVICE_KEY` (confirmed working: a convert call against a fake leadId returned `404 Lead not found on this campaign`, not `401`). That key passes `requireWideapplyServiceAuth`'s *first* check, before the scoped-array logic ever runs, so it grants full access to every `/api/wideapply/admin/*` route, not just this one. Treat this as a known gap, not the intended end state — revisit once the real scoped-key source is found, and flag to the user that this key has already been typed into a chat conversation at least twice and should be rotated when convenient.

Then create `.secrets/wideapply-lead-convert-skill/.env.dev` (and `.env.prod` if needed), relative to the repo root, with:

```
ELASTICDASH_BE_BASE_URL=<the backend's base URL for that environment>
WIDEAPPLY_LEAD_CONVERT_SERVICE_KEY=<the key currently in use — see "Current state" above>
WIDEAPPLY_ADMIN_ED_USER_ID=<optional: an admin user id to attribute these writes to>
```

`.secrets/` is gitignored wholesale, and this skill's subfolder is separate from every other wideapply skill's — a leaked or revoked key here has no effect on those flows, and vice versa.
