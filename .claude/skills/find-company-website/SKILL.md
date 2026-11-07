---
name: find-company-website
description: Find and verify the official website of each company on a list of WideApply applications that has no `companyWebsite`, using TinyFish search and fetch plus a deterministic verifier, so the BE can write cover letters. Run before push-wideapply-applications pushes. Triggers - applications without companyWebsite, Wellfound / direct-ATS / GrokBot / Built In rows, "find the company websites".
---

# Find Company Website

ElasticDash-BE writes a cover letter by researching the company's own site, so every application needs `companyWebsite`.
Hirebase and TheirStack supply it; Wellfound (Apify), direct-ATS pulls, GrokBot and Built In rows do not. This skill fills
that gap before the push. It never guesses: no verified site means the field stays out.

## Input and output

Input: the Step 3 application objects from `push-wideapply-applications` (each has `company`, `role`, `jobPostUrl`, maybe `companyWebsite`).
Output: the same objects, with `companyWebsite` added (`https://host`) only where a site was found AND verified.

## Steps

1. Skip every application that already has a `companyWebsite`. Group the rest by company name; look each company up once per run.
2. Search: `mcp__tinyfish__search` with the query `"<company>" official website`. Take results in order; skip job boards,
   aggregators, social and wiki pages (LinkedIn, Indeed, Glassdoor, Crunchbase, Wellfound, Built In, Wikipedia, ATS hosts).
   Try at most the first 3 usable results.
3. Fetch the result's home page with `mcp__tinyfish__fetch_content` (just the site root, not a deep page).
4. Compare the page with the job posting: does the page describe the same kind of business as the role's company? A page
   for a different company that shares the name (e.g. "Apex Roofing" vs an "Apex" software company) is a NO. When unsure, NO.
5. Run the verifier on the fetched page. It rejects wrong domains and pages that do not name the company:

   ```
   echo '{"company":"<company>","url":"<result url>","title":"<page title>","text":"<page text, first ~2000 chars>","jobPostUrl":"<jobPostUrl>"}' \
     | node .claude/skills/find-company-website/verify.mjs
   ```

   It prints `{"ok":bool,"website":...,"reason":...}`. Only on `ok:true` set `companyWebsite` to `website`. On `ok:false`, try the next
   result (max 3), then give up for that company.
6. Report in the Step 3 table: per company, the website found or "no verified website" with the reason. Companies with a
   Greenhouse `jobPostUrl` and no website are the ones the BE cannot write a cover letter for; call them out.

## Never

- Never invent a site from the company name (`<name>.com`) and never use the verifier's pass as a substitute for step 4.
- Never overwrite a `companyWebsite` the source already gave.
- Never use the job posting's own host or an ATS host as the company's site (the verifier also rejects these).
- Never block the push on a failed lookup; push without the field and report it.
