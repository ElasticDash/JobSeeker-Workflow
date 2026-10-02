---
name: "push-resume-to-drive"
description: "Put finished candidate resume .docx files into the ElasticDash Google Drive via the claude.ai Google Drive connector. Use at the end of resume pipelines or when asked to push a resume to Drive."
---

# Push resume to Drive

Gets finished resume .docx files into the contact@elasticdash.com Google Drive, byte for byte, so the team reviews them there. Run it:
- automatically as the last stage of `ideal-cv-pipeline-v4`, and
- on demand, whenever the user says "push to Drive", "upload the resume", "put it in Drive", "推到 Drive", "上传到 Google Drive", including for files made earlier in the conversation.

## How it works, and the one rule

This runs locally in Claude Code, not claude.ai, so there is no Mac-to-cloud bridge and no Drive for Desktop step. The skill reads the finished .docx off disk, base64-encodes it, and uploads it with `mcp__claude_ai_Google_Drive__create_file` straight to the candidate's folder in contact@elasticdash.com's Drive.

**Base64 upload can silently corrupt a file.** This was tested and hit directly: a 22 KB resume arrived 63 bytes short and a 37 KB one failed outright. There is no local-filesystem path to this Drive account available here (no Drive for Desktop mount, no `gws` CLI), so `create_file` is the only route in — but every upload MUST be followed by the integrity check in Step 4 before it is reported as done. Never report a file as pushed without that check passing.

If `mcp__claude_ai_Google_Drive__*` tools are not yet loaded, `ToolSearch("select:mcp__claude_ai_Google_Drive__search_files,mcp__claude_ai_Google_Drive__create_file,mcp__claude_ai_Google_Drive__get_file_metadata,mcp__claude_ai_Google_Drive__trash_file")` once, up front.

## Settings

- `DRIVE_ACCOUNT = contact@elasticdash.com` — confirmed as the account behind the `mcp__claude_ai_Google_Drive__*` tools in this environment (its files show `owner: contact@elasticdash.com`). If a search ever shows a different owner, stop and tell the user before writing anything.
- `CANDIDATE_FOLDER = "<First Last> | Tailored Resumes"`, directly under My Drive (`parentId = 'root'`). Matches the existing "Kartikeya Ram Krishna | Tailored Resumes" folder.

## Inputs

1. One or more finished .docx files in the workspace (local paths).
2. Candidate full name.
3. Target company and a short role label (e.g. "Vast", "TPM"). Take them from the JD in the conversation. If there is no JD and the user is present, ask; if not, use the part of the file name after "Resume_", or "General".

If the user asks to push "the resume" and several .docx files exist in the conversation, push the ones from the latest pipeline or generator run. Ask only when two different candidates or JDs are equally recent.

## Step 1: Name each file

Drive name: `<First>_<Last>_Resume_<Company>_<RoleShort>[_<n>].docx`
- Underscores for spaces, letters, digits and underscores only in each part.
- `_<n>` only when a run made several contact-set files (`_1`, `_2`).
- Example: `Kartikeya_Ram_Krishna_Resume_Vast_TPM_1.docx`

A file with the same Drive name in the candidate folder is the same candidate, company and role. Re-uploading it is intended for reruns — see Step 4 for how a same-name collision is handled.

Record each local file's exact byte size (`stat -f%z <file>` on macOS) before uploading. This is the number the integrity check in Step 3 verifies against.

## Step 2: Find or create the candidate folder

1. `mcp__claude_ai_Google_Drive__search_files` with `query: "title = '<CANDIDATE_FOLDER>' and mimeType = 'application/vnd.google-apps.folder'"`, `excludeContentSnippets: true`.
2. Match case-insensitively on the name before " | ". If an existing folder matches with slightly different spelling, use its exact name and `id`.
3. If none exists, create it: `mcp__claude_ai_Google_Drive__create_file` with `title: CANDIDATE_FOLDER`, `mimeType: application/vnd.google-apps.folder`, `parentId: 'root'`. Record the returned `id`.
4. If more than one folder matches, use the one owned by `DRIVE_ACCOUNT`; if still ambiguous, ask.

## Step 3: Same-name collisions, checked before upload

`mcp__claude_ai_Google_Drive__search_files` with `query: "title = '<Drive name>' and parentId = '<candidate folder id>'"`, `excludeContentSnippets: true`. `update_file` cannot touch a file's content (title/parent only), and there is no upsert on `create_file`, so a rerun means trash-then-recreate, not an in-place update:

- No match: proceed to Step 4 as a new file.
- Match: `mcp__claude_ai_Google_Drive__trash_file` on the existing file's `id` (this keeps it recoverable from the account's trash, unlike an overwrite), then proceed to Step 4. Say "updated (previous version in Drive trash)" in the reply rather than "in Drive".

## Step 4: Upload and verify

For each file:

1. Read the local .docx and base64-encode its bytes.
2. `mcp__claude_ai_Google_Drive__create_file`:
   - `title`: the Drive name from Step 1
   - `parentId`: the candidate folder's `id`
   - `base64Content`: the encoded bytes
   - `contentMimeType`: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - `disableConversionToGoogleType`: `true` (never let this become a Google Doc)
3. **Integrity check (mandatory):** take the `id` from the create response and call `mcp__claude_ai_Google_Drive__get_file_metadata` (`excludeContentSnippets: true`) on it. Compare its `fileSize` to the byte size recorded in Step 1.
   - Match: this file is done, use this reply line.
   - Mismatch, or `fileSize` missing/not yet set: wait a few seconds and re-check, up to 3 tries.
   - Still wrong after 3 tries: `trash_file` the corrupt upload, retry the whole upload once from scratch. If the retry also fails the size check, stop and report "upload failed integrity check" for that file with both byte sizes — do not keep retrying silently, and do not leave two copies in the folder.

## Reply

One line per file: Drive name, "in Drive" / "updated" / "upload failed integrity check (local X bytes, Drive Y bytes)", and the file's Drive view link (construct from its `id`: `https://drive.google.com/file/d/<id>/view`, or read `viewUrl` if the create/search response includes one). Then the candidate folder link. No em dashes. No recap of steps.
