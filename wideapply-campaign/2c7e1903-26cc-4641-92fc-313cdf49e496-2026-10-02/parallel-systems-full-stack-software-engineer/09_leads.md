# Stage 9: Leads (hiring-contact-finder)

Company pinned: **Parallel Systems** ("Parallel"), moveparallel.com, linkedin.com/company/parallelsystems, Los Angeles, CA. Railroad Equipment Manufacturing, autonomous battery-electric rail vehicles, ~68-69 employees (Apollo), founded 2020.

Target role: Full Stack Software Engineer / Software Engineer I, Interfaces team (TypeScript, React, Rust, Electron, operator application).

## Leads

| # | Tier | Name | Current title | LinkedIn | Email | Email status | Source | Confidence |
|---|---|---|---|---|---|---|---|---|
| 1 | C-level | Matt Soule | Founder and CEO | https://www.linkedin.com/in/msoule | matt@moveparallel.com | verified | Exa | Verified |
| 2 | Manager | Thomas Praderio | Director of Engineering | https://www.linkedin.com/in/thomas-praderio-90191a172 | tom@moveparallel.com | verified | Exa | Verified |
| 3 | Peer | Casey Walker | Senior Software Engineer | https://www.linkedin.com/in/caseyewalker | casey@moveparallel.com | verified | Exa | Verified |
| 4 | Peer | Kirill Kayer | Lead Software Engineer | https://www.linkedin.com/in/kayerov | kirill@moveparallel.com | verified | Exa | Verified |
| 5 | Peer | Jonathan Goh | Lead Vehicle Software Engineer | https://www.linkedin.com/in/gojongoh | not found | not found | Exa | Verified |
| 6 | Peer | Gashaw Teshome | Manager, Cybersecurity & Infrastructure | https://www.linkedin.com/in/gashaw-teshome-270a667 | not found | not found | Exa | Verified |
| 7 | Peer | Nathan Pendleton | Staff Electrical Engineer | https://www.linkedin.com/in/npendleton | npendleton@moveparallel.com | verified | Exa | Verified |

Casey Walker (JavaScript/TypeScript, React, Node.js, Go) is the closest tech-stack match to the Interfaces team's operator-application stack. Kirill Kayer has a front-end background. Jonathan Goh and Gashaw Teshome are current engineering-org peers (vehicle software / infrastructure) included for breadth, slightly further from the specific Interfaces/operator-app stack. Nathan Pendleton is hardware-side (electrical).

All 7 were confirmed via Apollo `apollo_people_bulk_match` with `organization_name: "Parallel Systems"` and `domain: "moveparallel.com"`; all returned `current: true` against Apollo's own organization record (org id matching moveparallel.com), high match confidence.

## Notable exclusions

- **John Howard**: Co-Founder, Board Member; LinkedIn shows a sequence of VP titles at Parallel ending without a "(Current)" marker (last segment appears to end around Nov 2024), unlike every other lead above which explicitly shows "(Current)." Treated as likely former and excluded; not verified via Apollo.
- **Benjamin Stabler**: Co-Founder, VP of Engineering at Parallel, explicit end date Jan 2024 shown on his LinkedIn. Confirmed former, excluded.
- **Ryan Pierce**: "Software Engineer @ Parallel (Current)" but LinkedIn company link is `linkedin.com/company/getparallel`, a different company (a fintech SaaS startup in Utah), not Parallel Systems. Excluded as a same-name-company false match.
- Several more same-name-company false matches excluded: people at "Parallel Web Systems" (Palo Alto, AI web research), "Parallel Works" (Chicago, HPC middleware), "Parallel" (Winnipeg, social app), "Parallel Platforms" (Menlo Park), "Parallel" (New York software co, "useparallel"), "Parallel" (Lehi UT fintech, "getparallel") — all different companies sharing the word "Parallel."
- Non-engineering current employees found but not included in the tiered table (recruiter, HR, government affairs, finance, sales — none fit the C-level/manager/peer tiers for this engineering hire): Eddie Salas (Technical Talent Acquisition), Jason Weikel (HR Director), David Kelly (Head of Government and Regulatory Affairs), Fraser Kinnear (Senior Director, Finance and Accounting), Neal Lofgren (Director of Sales).

## Usage

Searches: Exa 3 (company pin, C-level, manager/engineering-leadership, peers/software-engineers — effectively folded into 3 broad people searches after the company was pinned). No TinyFish top-up needed (Exa surfaced enough current, correctly-matched people). TinyFish-only people: 0. Apollo: `apollo_users_api_profile` credit check (2,556 credits available, waterfall enabled), then `apollo_people_bulk_match` for all 7 leads: 7 credits consumed, 5 emails found (verified), 2 not found (Jonathan Goh, Gashaw Teshome). ~2,549 credits remain on the shared team pool.

## Push result (push-wideapply-leads, env dev)

```json
{"ok":true,"env":"dev","campaign":"2c7e1903-26cc-4641-92fc-313cdf49e496","company":"Parallel Systems","count":7,"ids":["04582090-de9d-46c4-99fd-1032d3044fd1","982d5f40-764c-4fbe-9b86-016483dee12d","5eaea647-ac52-40ed-ae05-c50778ab1147","aefc2c0d-f8fe-45ac-800c-76fe1792cf50","303d40d8-36b8-494a-aa89-7c0745c7f565","ce6149f7-62a4-4ef3-ac60-c70eb8b86c1d","57f5fa41-1c3a-4926-9992-40c7e9dc52c0"]}
```

All 7 leads inserted. Mapping to IDs (order matches payload order, which matches the table above):

| Lead | Inserted lead id |
|---|---|
| Matt Soule | 04582090-de9d-46c4-99fd-1032d3044fd1 |
| Thomas Praderio | 982d5f40-764c-4fbe-9b86-016483dee12d |
| Casey Walker | 5eaea647-ac52-40ed-ae05-c50778ab1147 |
| Kirill Kayer | aefc2c0d-f8fe-45ac-800c-76fe1792cf50 |
| Jonathan Goh | 303d40d8-36b8-494a-aa89-7c0745c7f565 |
| Gashaw Teshome | ce6149f7-62a4-4ef3-ac60-c70eb8b86c1d |
| Nathan Pendleton | 57f5fa41-1c3a-4926-9992-40c7e9dc52c0 |
