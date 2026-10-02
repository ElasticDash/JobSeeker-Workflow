# Stage 9: Leads — Quartus Engineering

Company LinkedIn: https://www.linkedin.com/company/quartus-engineering (100-150 employees, San Diego HQ, Herndon VA office)

| # | Tier | Name | Current title | LinkedIn | Email | Email status | Source | Confidence |
|---|---|---|---|---|---|---|---|---|
| 1 | C-level | Mark Stabb | Chief Executive Officer / Founder | https://www.linkedin.com/in/mark-stabb | not found | unavailable | Exa | Verified |
| 2 | Manager | Brendan O'Shea | Director of Electrical and Software Systems | https://www.linkedin.com/in/brendan-oshea | not found | unavailable | Exa | Verified |
| 3 | Manager | Aaron Sharpe | Senior Engineering Manager (previously Software Engineering Manager) | https://www.linkedin.com/in/aaron-schnarr | not found | unavailable | Exa | Verified |
| 4 | Manager | Ilya Gavrilyuk | Director of Engineering, Aerospace / Engineering Manager, Systems Development | https://www.linkedin.com/in/ilya-gavrilyuk-82b232283 | ilya.gavrilyuk@quartus.com | verified | Exa | Verified |
| 5 | Manager | Andy Kostuch | General Manager, Aerospace (Herndon, VA) | https://www.linkedin.com/in/andy-kostuch-b180553 | andy.kostuch@quartus.com | verified | Exa | Verified |
| 6 | Peer | Brian Tom | Software Engineer | https://www.linkedin.com/in/briantom123 | brian.tom@quartus.com | verified | Exa | Verified |
| 7 | Peer | Jonathan Chesney | Software Engineer III | https://www.linkedin.com/in/jonathan-chesney-00a998177 | jonathan.chesney@quartus.com | verified | Exa | Verified |
| 8 | Peer | Omar Wardak | Senior Software Engineer | https://www.linkedin.com/in/omar-wardak-4a09b0163 | not found | unavailable | Exa | Verified |
| 9 | Peer | Stephanie Hernandez | Software Engineer | https://www.linkedin.com/in/stephanie-hernandez-01122313b | not found | unavailable | Exa | Verified |
| 10 | Peer | Maria Bolt | Senior Software Engineer | https://www.linkedin.com/in/maria-bolt | maria.bolt@quartus.com | verified | Exa | Verified |

Notable exclusions: John Williams (CEO Aug 2022 - Feb 2025, former), Jeremy Gustin (President/CEO Nov 2017 - Apr 2021, former), Bryant White (current title at Quartus is Lead Engineer, not CTO; the CTO title found belongs to an unrelated company), Sao T. (Software Engineer II at Quartus, Oct 2022 - Jul 2025, former).

Usage: Exa searches 3 (C-level, manager/engineering-leadership, peer/software-engineer). No TinyFish top-up needed (each tier returned enough current, verified people from Exa alone). Apollo: 10 credits consumed, 10/10 matched records, 6/10 returned a verified work email, 4/10 "not found" (not guessed). Apollo balance before this call: 2549 credits remaining.

## Push result (push-wideapply-leads)

`push-leads.mjs --env dev --campaign 2c7e1903-26cc-4641-92fc-313cdf49e496 --company "Quartus Engineering"`

Result: ok, 10 leads inserted.

Lead ids (in table order, rows 1-10):
1. Mark Stabb: b29e4b1b-bd3a-4425-a934-acc465dcd0c1
2. Brendan O'Shea: 18b15797-539c-4833-9bd8-73ffea9ec4ff
3. Aaron Sharpe: 3dbc9a32-066b-478f-b809-df9491bc6827
4. Ilya Gavrilyuk: 58f9fb52-ab82-4168-b4de-7ed75dd2b125
5. Andy Kostuch: 4db4b0e6-cabf-4fc1-94f5-95d0d3dfe270
6. Brian Tom: 4304b63d-f7be-448a-a274-b898bbc215a9
7. Jonathan Chesney: 0b5619f2-ccf1-43c4-b1a6-18225ff62203
8. Omar Wardak: 89c8f06e-8fea-4ee8-a0a5-d91900437ead
9. Stephanie Hernandez: d7f59015-95a7-4514-b1e4-cb45da3ee303
10. Maria Bolt: dc36591a-3717-478f-9931-d5ebe8234bea

## Lead-to-todo conversion (convert-wideapply-lead-to-todo), applicationId d36dc42f-80e1-44db-9f01-07bd44e71ed6

All 10 succeeded:
1. Mark Stabb: todoId 17440f0a-2352-4257-80eb-925f9027fe9a
2. Brendan O'Shea: todoId 1c131608-2719-4a99-bee4-33b2d95226d9
3. Aaron Sharpe: todoId 288dfb05-9ffb-4f8f-86cf-06c44a09cfda
4. Ilya Gavrilyuk: todoId 04b4fe36-3270-48dc-8243-10c78e104ce4
5. Andy Kostuch: todoId f16b4777-a5fc-44d6-ada5-f17489073c99
6. Brian Tom: todoId dbdaae4f-8e98-46ac-8740-1316845a2418
7. Jonathan Chesney: todoId ebac7709-e515-4bee-a139-76370635f1f4
8. Omar Wardak: todoId 70afa680-90c0-484e-ac90-bdada8f2217a
9. Stephanie Hernandez: todoId c3e1976e-5078-4240-a983-a707e1e76f7c
10. Maria Bolt: todoId 942cedad-143d-4f08-925d-712f18bf4a59

## push-resume-to-application result

`push-document.mjs --env dev --campaign 2c7e1903-26cc-4641-92fc-313cdf49e496 --application d36dc42f-80e1-44db-9f01-07bd44e71ed6 --file Agrima_Jain_Resume.docx` (no --drive-url, since Drive push failed integrity check and left no confirmed link)

Result: ok. driveReviewUrl: skipped (no url given). document: uploaded, id d54e45de-5dd1-412c-b079-d2ea42ccf036, fileUrl https://devserver.elasticdash.com/api/general/files/wideapply-application-document-d54e45de-5dd1-412c-b079-d2ea42ccf036.docx
