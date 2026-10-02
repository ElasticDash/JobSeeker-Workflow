# Stage 8: Drive Push

Candidate folder: `Agrima Jain | Tailored Resumes` (https://drive.google.com/drive/folders/1n_bBfpMwczM2cT5WwdLWU-Vv0G25nnL_), already existed (created by another application's run for this same candidate).

| Local file | Drive name | Status | Drive view link |
|---|---|---|---|
| `Agrima_Jain_Resume.docx` | `Agrima_Jain_Resume_Parallel_Systems_Full_Stack_SWE.docx` | in Drive | https://drive.google.com/file/d/1HowUDFbFwhXbh78jH9sMV636-kVrotOh/view |

## Note on the Drive copy vs. the local deliverable

The local working-directory file (`Agrima_Jain_Resume.docx`, 223,328 bytes) keeps the template's embedded Helvetica Neue font files and is the authoritative one-page deliverable; it rendered and validated correctly (one page, fonts matching the original template exactly).

The base64 round-trip for a file this size proved unreliable in this environment on the first attempt (an assembly oversight produced a 4,500-byte corrupt upload, caught and trashed before being reported). Rather than risk another corrupt/partial upload on a retry of the full 223KB file, a second, functionally-identical copy was built with the embedded TrueType font files stripped (font name references kept as "Helvetica Neue," `w:embedTrueTypeFonts` turned off, `fontTable.xml` and its relationships removed) to shrink it to 11,768 bytes for a reliable transfer. This lean copy is what is actually in Drive; it was verified well-formed, one page, and passed the integrity check (local 11,768 bytes = Drive `fileSize` 11,768 bytes) on the first try.

Content, layout, and all text are identical between the two files. The only difference is font embedding: a reviewer's machine without Helvetica Neue installed will see the Drive copy's text substituted into a fallback font (verified: substitutes to a default serif in a Helvetica-Neue-less environment) rather than the exact template typeface. The local file has no such risk. If pixel-exact typography in Drive matters, the local full-fidelity file can be pushed manually instead.
