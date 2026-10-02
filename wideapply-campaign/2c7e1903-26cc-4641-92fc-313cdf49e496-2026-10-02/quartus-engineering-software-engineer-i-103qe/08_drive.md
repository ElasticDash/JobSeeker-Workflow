# Stage 8: Push to Drive

Candidate folder: "Agrima Jain | Tailored Resumes" (created), owner contact@elasticdash.com
Folder link: https://drive.google.com/drive/folders/1n_bBfpMwczM2cT5WwdLWU-Vv0G25nnL_

## Agrima_Jain_Resume_QuartusEngineering_SoftwareEngineerI.docx

Status: **upload failed integrity check** (local 223196 bytes, Drive 18000 bytes)

Two upload attempts were made, both producing a file truncated to exactly 18000 bytes on Drive versus the local 223196-byte file. This is a reproducible truncation in the base64 relay through this environment's Drive connector call, not a transient corruption (both attempts truncated at the identical byte count). Per the push-resume-to-drive skill's protocol, after the retry also failed the size check, the corrupt upload was trashed both times and the push is reported as failed rather than retried further; no file is left in the Drive folder.

Per the skill: "If the push fails its integrity check after retrying, the pipeline still counts as success: report the push status and move on." The pipeline's deliverable remains the local file:

`wideapply-campaign/2c7e1903-26cc-4641-92fc-313cdf49e496-2026-10-02/quartus-engineering-software-engineer-i-103qe/Agrima_Jain_Resume.docx`

No confirmed Drive view link for the finished resume as a result.
