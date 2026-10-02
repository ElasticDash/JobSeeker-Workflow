# JD Evaluation: Software Engineer (Backend) — Cardless

Location: San Francisco, CA. Work mode: onsite. Salary: $160k - $295k/year (wide range, level calibrated during process, mid-level through staff).

## 1. Hard gates

| Item | What the JD says | Verdict |
|---|---|---|
| Location / timezone | San Francisco, CA, onsite | Real gate unless candidate is local or willing to relocate/commute |
| Work visa | Not mentioned | Not a gate (no statement either way) |
| Minimum years | Not stated; role spans mid-level through staff | Not a gate, but level will be calibrated in interview |
| Certificates / degree | Not mentioned | Not a gate |
| Employment type | Not stated, implied full-time | Not a gate |

## 2. Must-haves

| # | Requirement | Evidence to look for in the CV | Weight |
|---|---|---|---|
| M1 | Proficiency in a modern backend language and ecosystem (primarily Java, Python for data work; prior Java/Python not required) | Production backend code in a modern language (Java, Python, Go, Node, etc.), not just scripting | Highest |
| M2 | Solid fundamentals in distributed systems, APIs, databases, infrastructure | Designed/built APIs, worked with relational or distributed data stores, deployed on cloud infra | Highest |
| M3 | Experience building and operating production backend services, shipped end to end | Project narrative that goes from design through deployment and operations (not just prototype) | Highest |
| M4 | Strong systems thinking / problem solving on unfamiliar systems with incomplete information | Specific examples of debugging, scoping ambiguous problems, making calls under uncertainty | Mainly verified in interview |
| M5 | Clear communication and genuine care about correctness | Evidence of cross-functional work, quality/testing discipline | Mainly verified in interview |

JD explicitly softens the domain requirement ("we would rather hire someone sharp who will learn this domain"), so fintech/payments background should be scored as a strong plus, not an elimination gate.

## 3. Hidden requirements

| # | Hidden requirement | Source in the JD | Evidence to look for in the CV |
|---|---|---|---|
| H1 | Ability to work across multiple domains/services rather than staying in one lane | "Work across domains rather than inside a single service, going where the highest-value problem is" | History of moving between different systems/features within a company, not single-service ownership only |
| H2 | Comfort operating in a regulated environment, working with compliance/risk/ops stakeholders | "Partner with product, risk, compliance, operations, and our partner and vendor counterparts to ship things that hold up in a regulated environment" | Experience in healthcare, fintech, or other regulated industries; cross-functional delivery with non-engineering stakeholders |
| H3 | Ownership of the full project lifecycle including post-launch operations | "Take projects from ambiguity to production: scoping, design, implementation, testing, rollout, and the operational life that follows" | Evidence of owning monitoring/on-call/iteration after shipping, not just shipping |
| H4 | Reliability and observability mindset | "Improve reliability, observability, and developer experience as you go" | Mentions of monitoring, logging, alerting, latency/uptime metrics |

## 4. Nice-to-haves

| # | Plus | Evidence to look for in the CV |
|---|---|---|
| N1 | Fintech, payments, lending, or card issuing experience (authorization, ledgers, settlement, reconciliation, disputes, regulatory work) | Direct work in these subdomains — this is close to the company's core business, so weight is close to a must-have |
| N2 | Workflow orchestration (Temporal, Step Functions) or event streaming experience | Named tools/patterns in a project context |
| N3 | Built and maintained external, partner-facing APIs | API design work explicitly consumed by external partners/customers, not just internal services |

## 5. Seniority

- Years: open range, mid-level through staff; level calibrated during interviews rather than by resume alone.
- People management: individual contributor role; no management signal in the JD.
- Scope: cross-domain backend ownership (applications/underwriting, accounts/ledgers, transactions/payments, rewards, risk, partner APIs).
- Decision rights: expected to scope and drive projects largely independently ("ambiguity to production"), and to reason about unfamiliar systems without full guidance.

## 6. Domain experience

| Tier | Background | Examples |
|---|---|---|
| Direct match | Payments, card issuing, lending, fintech infrastructure | Authorization, ledgers, settlement, reconciliation, disputes, regulatory/compliance-adjacent systems |
| Adjacent | Other regulated, high-stakes backend domains with real-money or real-consequence correctness bar | Healthcare systems (clinical data, PHI), insurance, other heavily regulated SaaS |
| Distant | General backend/product engineering with no regulated or money-moving component | Generic CRUD SaaS, internal tooling, consumer apps with no compliance surface |

## 7. Recency

- This is a backend infrastructure role; recency matters most for production backend engineering (API design, databases, cloud deployment), not for any specific language.
- Most recent role should show hands-on backend service design, deployment, and operations, ideally with some proximity to a regulated or high-correctness domain.
- Down-weight experience that is purely prototype/research-stage with no production deployment or operational ownership.

### Suggested scoring order

1. Gates: location (SF onsite) — confirm willingness/fit.
2. Must-have coverage: M1-M3 need explicit production backend evidence; M4-M5 lean on interview but should still show through project narrative quality.
3. Ranking: N1 (fintech/payments) weighted heavily, then N2/N3, then domain tier and recency.

### What this JD is really worried about

Cardless is worried about hiring someone who can't operate safely in a system where bugs cause real financial harm (declined cards, wrong credit reports) and who can't independently navigate ambiguous, cross-domain problems in a regulated environment. M3, M4, H2 and H3 best test for this: production ownership, systems thinking under uncertainty, and comfort working through compliance/risk/ops in a high-stakes operational system.

## Step 3: Hard skills and soft skills

### Hard skills

| Skill | Level | What the JD says |
|---|---|---|
| Modern backend language/ecosystem (Java emphasized, Python for data) | Must-have | "Proficiency in a modern backend language and ecosystem... primarily Java with Python for data work" |
| Distributed systems, APIs, databases, infrastructure fundamentals | Must-have | "Solid fundamentals in distributed systems, APIs, databases, and infrastructure" |
| Production backend service build and operation | Must-have | "Experience building and operating production backend services, with a track record of shipping projects end to end" |
| Partner-facing / external API design | Nice-to-have | "You've built and maintained external, partner-facing APIs" |
| Payments/fintech domain mechanics (authorization, ledgers, settlement, reconciliation, disputes) | Nice-to-have (weighted heavily) | "Fintech, payments, lending, or card issuing experience..." |
| Workflow orchestration / event streaming (Temporal, Step Functions, Kafka-like) | Nice-to-have | "Experience with workflow orchestration (Temporal, Step Functions) or event streaming" |
| Reliability/observability tooling | Hidden | "Improve reliability, observability, and developer experience" |

### Soft skills

| Skill | Level | What the JD says |
|---|---|---|
| Systems thinking on unfamiliar systems with incomplete information | Must-have | "You can reason about an unfamiliar system, find where it breaks, and make a sound call with incomplete information" |
| Clear communication, correctness-mindedness | Must-have | "Clear communication and genuine care about correctness" |
| Cross-functional collaboration with product, risk, compliance, ops, partners/vendors | Hidden | "Partner with product, risk, compliance, operations, and our partner and vendor counterparts" |
| Comfort moving across domains/services rather than staying in a lane | Hidden | "Work across domains rather than inside a single service" |
| End-to-end ownership from ambiguity through operations | Must-have | "Take projects from ambiguity to production: scoping, design, implementation, testing, rollout, and the operational life that follows" |

### Items that are not skills

- Gates: SF onsite location.
- Domain experience tiering: payments/fintech direct match vs. regulated adjacent vs. distant.
- Seniority: mid-level through staff, IC track, calibrated during interviews.
- Recency: most recent role should show production backend ownership.

## Step 4: Ideal candidate profile

### Ideal candidate in one sentence

A backend engineer who has shipped and operated production services end to end in a regulated or high-correctness domain, with strong distributed-systems/API/database fundamentals and the independence to scope ambiguous problems across different parts of a system.

### Project types they have ideally done

| Project type | What they actually did | Maps to |
|---|---|---|
| Building/operating a money-moving or high-stakes transactional system | Designed data models and APIs, handled correctness/consistency concerns, monitored and iterated post-launch | M2, M3, H3, N1 |
| Partner-facing or external API development | Designed and maintained an API contract consumed by an external partner/customer, handled versioning and reliability | M2, N3 |
| Cross-domain backend work within one company | Moved between different services/subsystems to work the highest-value problem rather than owning one narrow service | H1 |
| Regulated-environment delivery with non-engineering stakeholders | Worked directly with compliance, risk, clinical, or similar stakeholders to ship something that had to hold up under scrutiny | H2, M5 |

### Companies or teams they have ideally worked in

- Payments/card issuing/fintech infrastructure companies (e.g. Stripe, Marqeta, Affirm, Brex-style card programs)
- Lending or credit platforms
- Other regulated, high-stakes backend environments (health tech, insurtech) where correctness has real-world consequences
- Backend/platform teams at general product companies with strong systems fundamentals, even without direct fintech exposure, given the JD's explicit willingness to hire for aptitude

### Best-fit role backgrounds

1. Backend/platform engineer with direct payments, lending, or card issuing experience — strongest fit, maps directly to N1 and the domain tier.
2. Backend engineer in another regulated, high-stakes domain (health tech, insurance) with strong production ownership — maps to H2 and the "sharp but domain-new" path the JD explicitly welcomes.
3. General backend/full-stack engineer with strong distributed systems and API fundamentals but no regulated-domain exposure — viable per the JD's stated hiring philosophy, but weaker on N1 and the domain-tier ranking factor.

Trade-off: candidates strong on systems fundamentals but with only prototype-stage or research-stage project history (no real operational/production ownership) are weak on M3 and H3 even if their technical skills look strong on paper.

### The ideal skill combination

- Production backend ownership (design through operations) combined with comfort working in a regulated, cross-functional environment is the rare combination; either alone is common.
- Strong distributed-systems/API fundamentals paired with the independence to scope ambiguous, cross-domain problems without a fully specified requirement.

### Strong and weak signals on a CV

**Strong signals:**
- "Designed and operated a production API consumed by external partners, handling versioning and uptime SLAs."
- "Worked directly with compliance/risk teams to ship a feature in a regulated environment, balancing correctness against delivery speed."
- "Owned a service from initial scoping through production rollout and post-launch monitoring."
- "Moved across multiple backend subsystems to resolve the highest-priority issue rather than staying within a single service."

**Weak signals:**
- Fintech/payments keywords listed in a Skills section with no corresponding project narrative.
- Only prototype or research-stage AI/ML work with no production backend deployment or operational ownership.
- Certifications in distributed systems or cloud without a demonstrated production project.
- Process-only or integration-only work (wiring together managed services) with no evidence of designing the underlying system.
