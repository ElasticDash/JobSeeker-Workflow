---
name: convert-wideapply-lead-to-todo
description: Convert an already-inserted WideApply lead (hiring-side contact) into a "connect on LinkedIn" to-do on a job application, via ElasticDash-BE's lead-convert API. Use whenever the user wants leads turned into connect-todos, not just saved as research.
---

# Convert WideApply Lead to Todo

Turns one `wideapply.Leads` row (already inserted by `push-wideapply-leads`) into a `linkedin_connection` to-do by running `convert-lead.mjs` in this skill's own folder. The backend also builds that to-do's 3-step accept-check/message follow-up chain automatically — nothing else to do once the convert call succeeds. The script — not you — holds the auth key and makes the HTTP call; you only ever build the arguments and invoke it.

## Where this can actually execute

Same constraint as `push-wideapply-leads`, `push-wideapply-applications` and `push-resume-to-application`: this needs a real shell on the user's machine. A Desktop app Chat/Cowork session gets file transfer, not shell access, even with the repo connected. If you're in a session without real shell access, build the exact command (see "Calling the script" below) and hand it to the user to run themselves, or paste into a Claude Code session on their machine.

## When this triggers

The user has one or more leads already saved to a campaign (via `push-wideapply-leads`, or already visible in the admin panel) and wants them turned into "connect on LinkedIn" action items, not just left as research. Trigger on: "create connect todos for these leads", "turn these leads into to-dos", "convert lead X", "make a connection task for each lead we just found".

**One lead per call.** To convert a batch, loop this skill once per `leadId` — e.g. every id `push-wideapply-leads` just returned in its `{"ids":[...]}"` output.

## What you need before calling the script

1. **`campaignId`** and **`leadId`** — the user gives you these, or they come from a prior step in this conversation (e.g. the ids `push-wideapply-leads` just inserted). Never guessed.
2. **`applicationId`** — optional. Only needed to disambiguate when the lead's company has more than one live application under this campaign; omit it when there's just one (the common case). If omitted and the backend finds more than one match, the call fails with a 400 naming the ambiguity — pass `--application` then.
3. **Environment** — default to `dev`. Only use `prod` if the user explicitly says "prod" or "production". Before the *first* prod write in a session, confirm explicitly with the user even if they already said prod once.

## Calling the script

Run from the repo root:

```
node .claude/skills/convert-wideapply-lead-to-todo/convert-lead.mjs --env dev --campaign <campaignId> --lead <leadId> [--application <applicationId>]
```

The script prints exactly one JSON line to stdout on success — `{"ok":true,"env":...,"campaign":...,"lead":...,"todoId":...,"target":...}` (`target` is the lead's LinkedIn URL, carried onto the to-do) — and a JSON error line to stderr with a non-zero exit code on failure. Relay the result back to the user in plain language; don't just paste the raw JSON.

## If it fails

- **`Lead not found on this campaign.`** — wrong `leadId`/`campaignId` pair, or the lead was deleted; tell the user, don't retry with a guessed id.
- **`This lead has already been converted to a to-do.`** — not an error to retry around; tell the user it's already done (the original to-do still exists, this call doesn't create a second one).
- **`Multiple applications exist for this company — pass applicationId to specify which one.`** — pass `--application` with the specific one the user means.
- **`No live application found for this company — has it been removed?`** — the company has no live application on this campaign at all; tell the user, don't retry.
- **`Env file not found: .secrets/wideapply-lead-convert-skill/.env.<env>`** — that environment hasn't been set up yet. Tell the user to create it (see "One-time setup" below) — you cannot create or fill in the key yourself.
- **401/403 from the backend** — the scoped key either isn't configured or isn't allowed on this route yet; see "One-time setup". Don't retry with a different key you make up.
- **Any other network/connection error** — the backend for that environment may be down or unreachable from this machine; tell the user, don't retry silently in a loop.

## What you must never do

- Never read, cat, or print the contents of `.secrets/wideapply-lead-convert-skill/.env.dev` or `.env.prod`. Only `convert-lead.mjs` touches them.
- Never ask the user to paste the service key into chat, and never type a key into a command yourself.
- Never add a generic "call any URL" capability to this skill or the script — it only ever calls the one convert endpoint.
- Never retry a prod write automatically after a failure without the user re-confirming.

## One-time setup (tell the user this if `.env.dev`/`.env.prod` don't exist yet)

**Current state (as of 2026-10-02): this runs on the unrestricted `WIDEAPPLY_SERVICE_KEY`, not a scoped key.** The intended design is a scoped entry in ElasticDash-BE's `WIDEAPPLY_SERVICE_KEYS_JSON`, restricted to exactly the convert route:

```json
{
  "id": "convert-wideapply-lead-to-todo",
  "key": "<a newly generated, sufficiently random secret>",
  "allowedRoutes": [
    { "method": "POST", "pathPattern": "^/admin/campaigns/[^/]+/leads/[^/]+/convert$" }
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
