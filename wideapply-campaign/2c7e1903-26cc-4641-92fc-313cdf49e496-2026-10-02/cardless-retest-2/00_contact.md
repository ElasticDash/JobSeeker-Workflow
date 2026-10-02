# Contact Sets — Agrima Jain / Cardless

No explicit contact set was supplied by the user. Per pipeline rules, this resolves to a single "Default" set, with phone and email filled from the candidate profile.

## Default

- **Phone**: +64 210402457 (source: profile)
- **Email**: jainagrima8@gmail.com (source: profile)
- **LinkedIn**: linkedin.com/in/coryrowens (source: profile; header rules in IDEAL_CANDIDATE govern whether/how this is shown)
- **Location** (header, not part of this contact-set logic): Boston, MA (source: profile). Target role is onsite San Francisco, CA, a different location, so the IDEAL_CANDIDATE header rule for "(able to relocate)" applies in stage 3.

One file will be produced: `Agrima_Jain_Resume.docx`.

## Unused values seen in the material (belong to neither set)

From the original CV template (Kartikeya Ram Krishna's layout, content not used):
- Phone: +1 (435) 324-4113 (template, unused)
- Email: lotr747969@gmail.com (template, unused)
- Location: San Francisco, CA (template, unused — coincidentally matches the job's location but is not the candidate's and is not used)
- LinkedIn: linkedin.com/in/kartikeya-k (template, unused)

These must not appear anywhere in the final .docx (stage 7 contact check).
