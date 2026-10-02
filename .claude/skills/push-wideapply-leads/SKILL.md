---
name: push-wideapply-leads
description: Push a researched list of hiring-side contacts (leads) into a WideApply candidate's job application campaign, via ElasticDash-BE's leads API. Use whenever the user has a lead list (name/title/LinkedIn/email/tier/source/confidence) from a research workflow and asks to push it, upload it, insert it, or save it to a campaign.
---

# Push WideApply Leads

Sends a researched lead list to ElasticDash-BE's `POST /admin/campaigns/:campaignId/leads` endpoint by running `push-leads.mjs` in this skill's own folder. The script — not you — holds the auth key and makes the HTTP call; you only ever build the JSON payload and invoke it.

## Where this can actually execute

**Confirmed by testing**: a Desktop app Chat or Cowork session — even with this repo explicitly connected and computer use enabled — gets file transfer to the user's Mac, not a real shell on it. `push-leads.mjs` cannot run from either of those session types. This is expected, not a bug to keep re-diagnosing.

If you find yourself in a session without real shell access to the user's machine: build the exact command (see "Calling the script" below) and give it to the user verbatim, telling them to run it themselves in a terminal, or paste it to a Claude Code session running on their machine. **Do not** attempt to work around this by asking the user to copy `.env.dev`/`.env.prod` into your session, or by fetching/reading the env file some other way — that moves the key off their machine, which is the one thing this whole setup exists to prevent. Declining that, and handing back the command instead, is the correct behavior, not a failure to route around.

## When this triggers

The user has a table or list of hiring-side contacts (a hiring manager, TPM, recruiter, peer — the kind of research a lead-finder workflow produces) and wants it saved against a specific candidate's campaign, so it can later be turned into a "connect on LinkedIn" to-do from the admin panel. Trigger on: "push these leads", "upload this lead list", "insert these into campaign X", "save these contacts to the campaign".

## What you need before calling the script

1. **`campaignId`** — the user gives you this directly. If they haven't given it, ask for it — don't guess or search for it yourself.
2. **`company`** — required. A lead belongs to a company, not to one specific application record — the campaign needs at least one live (not withdrawn/removed) application to this company already existing in the dashboard, or the push will 400. You don't need to know *which* application, just the company name.
3. **Environment** — default to `dev`. Only use `prod` if the user explicitly says "prod" or "production". Before the *first* prod write in a session, confirm explicitly with the user ("this will write to production — confirm?") even if they already said prod once.

## Mapping each lead

For each lead in the source list, build an object with these fields (only `name` is required):

| Field | Notes |
|---|---|
| `name` | required |
| `title` | the lead's current job title |
| `linkedinUrl` | full profile URL |
| `email` | **`null` if not found — never a placeholder string like `"not found"`** |
| `emailStatus` | one of `verified`, `unavailable`, `guessed` |
| `tier` | one of `c_level`, `manager`, `peer` — map the source data's own labels (e.g. "C-level", "Manager", "Peer") to these exact lowercase values |
| `source` | free text, e.g. `"Exa + TinyFish"` |
| `confidence` | one of `verified`, `likely` |
| `notes` | free text |

The backend rejects any other value for `tier`/`emailStatus`/`confidence` — if the source data uses a different label, map it to the closest of these three sets rather than passing it through as-is.

## Calling the script

Build the leads as a JSON array and pipe it in via stdin — do not try to pass it as a shell argument (lead names/notes can contain quotes that break shell escaping):

Run from the repo root:

```
echo '<leads JSON array>' | node .claude/skills/push-wideapply-leads/push-leads.mjs --env dev --campaign <campaignId> --company "<company name>"
```

Quote `--company` since it can contain spaces.

The script prints exactly one JSON line to stdout on success — `{"ok":true,"env":...,"campaign":...,"count":N,"ids":[...]}` — and a JSON error line to stderr with a non-zero exit code on failure. Relay the count/ids (or the error) back to the user in plain language; don't just paste the raw JSON.

## If it fails

- **`No application found for this company under this campaign — create it in the dashboard first.`** — the candidate isn't applying to this company yet (or the application was withdrawn/removed); tell the user this rather than retrying. Double-check the company name matches what's in the dashboard — matching is case/whitespace-insensitive but still has to be the same company.
- **`Env file not found: .secrets/wideapply-leads-skill/.env.<env>`** — that environment hasn't been set up yet. Tell the user to create it (see this skill's README-equivalent below) — you cannot create or fill in the key yourself.
- **Any other network/connection error** — the backend for that environment may be down or unreachable from this machine; tell the user, don't retry silently in a loop.

Note: this skill only ever *inserts* leads. Converting a lead into a to-do, and resolving which specific application to attach it to when a company has more than one, happens later from the admin panel — not something this skill does.

## What you must never do

- Never read, cat, or print the contents of `.secrets/wideapply-leads-skill/.env.dev` or `.env.prod`. Only `push-leads.mjs` touches them.
- Never ask the user to paste the service key into chat, and never type a key into a command yourself.
- Never add a generic "call any URL" capability to this skill or the script — it only ever calls the one leads-insert endpoint.
- Never retry a prod write automatically after a failure without the user re-confirming.

## One-time setup (tell the user this if `.env.dev`/`.env.prod` don't exist yet)

Create `.secrets/wideapply-leads-skill/.env.dev` (and `.env.prod` if needed), relative to the repo root, with:

```
ELASTICDASH_BE_BASE_URL=<the backend's base URL for that environment>
WIDEAPPLY_LEADS_SERVICE_KEY=<the scoped key issued for this integration>
```

`.secrets/` is gitignored wholesale (see the repo's `.gitignore`) — everything this pipeline needs lives inside the repo, but this one directory never gets committed. The key itself is a scoped entry in ElasticDash-BE's `WIDEAPPLY_SERVICE_KEYS_JSON`, restricted to only this one insert route — see `middleware/wideapplyServiceAuth.js` in that repo. Generating and setting that key is the user's own step; do not attempt to generate or guess a value for it.
