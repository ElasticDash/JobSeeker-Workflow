# JD Evaluation — Cardless, Software Engineer (Backend)

## Step 1: Signals

- "This role is open at multiple levels, from mid-level through staff. We calibrate level during the process rather than before it" softens the years/seniority bar considerably; level is decided at interview, not pre-screened.
- "We would rather hire someone sharp who will learn this domain than someone who has only ever worked in it" softens the fintech/payments must-have into a strong-plus rather than an absolute gate.
- "Proficiency in a modern backend language and ecosystem... we do not expect you to have used ours [Java]" means language is not a strict Java requirement; any strong modern backend language counts.
- Responsibilities list risk, compliance, and partner/vendor counterparts explicitly — this implies comfort working in a regulated environment is a hidden requirement beyond just technical skill.
- "A bug here means someone's card declines... or their credit report is wrong" signals correctness/testing discipline is weighted heavily, tested via how the candidate talks about reliability and testing practice.
- Salary range is wide ($160k-$295k), consistent with the stated multi-level hiring band.
- Location is onsite San Francisco. Per house rule, location/relocation is never treated as a knockout for this screening; it is noted for context only, not scored as a gate.

## Step 2: Requirements checklist

### 1. Hard gates

| Item | What the JD says | Verdict |
|---|---|---|
| Location / timezone | Onsite, San Francisco, CA | Not treated as a gate (house rule: location/relocation always passes) |
| Work visa | Not mentioned | Not a gate |
| Minimum years | Not stated as a number; "mid-level through staff" range | Not a gate |
| Certificates / degree | Not mentioned | Not a gate |
| Employment type | Full-time implied by salary/benefits structure | Not a gate |

### 2. Must-haves

| # | Requirement | Evidence to look for in the CV | Weight |
|---|---|---|---|
| M1 | Proficiency in a modern backend language and ecosystem | Production backend services built in Python, Java, Node.js, Go, etc., with real ownership of the service, not just scripting | Highest |
| M2 | Solid fundamentals in distributed systems, APIs, databases, infrastructure | Designed/operated APIs, worked with relational/NoSQL databases, deployed infrastructure (AWS, Docker, Kubernetes) | Highest |
| M3 | Experience building and operating production backend services end to end | Shipped a service from scoping through production rollout and ongoing operation, not just a prototype | High |
| M4 | Systems thinking / problem solving in unfamiliar systems | Debugging or redesigning an existing system, reasoning under incomplete information | Mainly verified in interview; look for narrative evidence of diagnosing/fixing systems beyond spec |
| M5 | Clear communication, correctness discipline | Evaluation loops, testing practice, monitoring/observability work | Mainly verified in interview; CV evidence is testing/monitoring work described |

### 3. Hidden requirements

| # | Hidden requirement | Source in the JD | Evidence to look for in the CV |
|---|---|---|---|
| H1 | Comfort operating in a regulated / compliance-sensitive environment | "Partner with product, risk, compliance, operations... ship things that hold up in a regulated environment" | Work in healthcare, fintech, or other regulated domains; mention of compliance, audit, or data-sensitivity constraints |
| H2 | Cross-domain flexibility, working across multiple services rather than one | "Work across domains rather than inside a single service, going where the highest-value problem is" | CV shows movement across several systems/services rather than one narrow area |
| H3 | External partner-facing API design | "You've built and maintained external, partner-facing APIs" (listed under qualifications but reads as a plus-weighted hidden skill) | Built/maintained APIs consumed by external parties, not just internal services |
| H4 | Reliability / observability ownership | "Improve reliability, observability, and developer experience as you go" | Added monitoring, logging, alerting, or latency/uptime improvements to a production system |

### 4. Nice-to-haves

| # | Plus | Evidence to look for in the CV |
|---|---|---|
| N1 | Fintech, payments, lending, or card issuing experience (authorization, ledgers, settlement, reconciliation, disputes, regulatory work) | Direct work on payment/ledger/transaction systems; this is close to the company's core business so weighs close to a must-have when present |
| N2 | Workflow orchestration (Temporal, Step Functions) or event streaming | Mentions of orchestration frameworks or event-driven/streaming architecture (Kafka, SNS/SQS, etc.) |

### 5. Seniority

- Years: open band, mid-level through staff; calibrated at interview rather than pre-screened on a fixed number.
- People management: individual contributor role; no management responsibility implied.
- Scope: owns projects end to end (scoping through production and operations), working across multiple systems.
- Decision rights: expected to make sound technical calls independently under incomplete information ("reason about an unfamiliar system... make a sound call with incomplete information").

### 6. Domain experience

| Tier | Background | Examples |
|---|---|---|
| Direct match | Payments, lending, card issuing, or other regulated financial infrastructure | Authorization/ledger/settlement systems, card processing, banking-as-a-service platforms |
| Adjacent | Other regulated, high-stakes production systems (the JD itself frames "regulated environment" broadly) | Healthcare data systems, compliance-sensitive data pipelines, other high-reliability production backends |
| Distant | General backend engineering with no regulated-environment exposure | Generic SaaS CRUD backends, internal tooling with no compliance or correctness stakes |

### 7. Recency

- Backend/distributed systems experience should appear in the most recent role(s); older generalist experience is fine as a base layer but should not be the only evidence.
- Any regulated-environment or production-reliability work should be recent (last 1-2 roles) since it is the hidden requirement most tied to this specific company's anxiety.
- Down-weight purely academic or coursework-only systems experience if present.

### Suggested scoring order

1. Gates: none apply as hard knockouts here (location/relocation always passes per house rule).
2. Must-have coverage: M1 and M2 need explicit evidence first (a real backend language/ecosystem and distributed systems/API/database fundamentals); M3-M5 follow.
3. Ranking factors: N1 (fintech/payments) weighs heavily if present though not required; N2, domain tier, and recency rank the remaining candidates.

### What this JD is really worried about

Cardless is worried about hiring someone who cannot be trusted to move real money and make credit decisions correctly in a regulated environment without constant supervision, across unfamiliar systems. M1-M3 test basic competence; H1 and M4-M5 test the correctness/regulated-environment judgment that is the real anxiety.

## Step 3: Hard and soft skills

### Hard skills

| Skill | Level | What the JD says |
|---|---|---|
| Modern backend language (Java preferred, not required) | Must-have | "Proficiency in a modern backend language and ecosystem... primarily Java with Python for data work" |
| Distributed systems fundamentals | Must-have | "Solid fundamentals in distributed systems, APIs, databases, and infrastructure" |
| API design and database work | Must-have | Same line as above |
| Production backend service ownership | Must-have | "Experience building and operating production backend services, with a track record of shipping projects end to end" |
| External/partner-facing API design | Hidden | "You've built and maintained external, partner-facing APIs" |
| Observability / monitoring | Hidden | "Improve reliability, observability, and developer experience" |
| Payments/ledger/fintech domain techniques (authorization, settlement, reconciliation) | Nice-to-have | "Fintech, payments, lending, or card issuing experience... we weight it heavily" |
| Workflow orchestration / event streaming (Temporal, Step Functions, event streaming) | Nice-to-have | Explicitly listed |

### Soft skills

| Skill | Level | What the JD says |
|---|---|---|
| Systems thinking / reasoning under incomplete information | Must-have | "You can reason about an unfamiliar system, find where it breaks, and make a sound call with incomplete information" |
| Correctness discipline / care | Must-have | "Clear communication and genuine care about correctness" |
| Cross-functional collaboration (product, risk, compliance, operations, partners/vendors) | Hidden | "Partner with product, risk, compliance, operations, and our partner and vendor counterparts" |
| Flexibility across domains/problem areas | Hidden | "Work across domains rather than inside a single service" |
| Ownership from ambiguity to production | Must-have (mixed) | "Take projects from ambiguity to production: scoping, design, implementation, testing, rollout" |

### Items that are not skills

- Hard gate: none (location/relocation excluded per house rule).
- Domain experience: fintech/payments/regulated-environment tier (see Step 2.6).
- Seniority: open band, IC role, calibrated at interview.
- Recency: regulated/reliability work should be in the most recent 1-2 roles.

## Step 4: Ideal candidate profile

### Ideal candidate in one sentence

A backend engineer who has owned production services end to end in a regulated or high-stakes environment, with strong distributed systems and API fundamentals and a demonstrated ability to reason through unfamiliar systems under incomplete information.

### Project types they have ideally done

| Project type | What they actually did | Maps to |
|---|---|---|
| Payments/ledger/transaction system work | Built or maintained authorization, settlement, reconciliation, or ledger logic | N1, H1 |
| External partner-facing API | Designed and maintained an API consumed by outside parties, with versioning/contract concerns | H3 |
| Production service hardening | Added monitoring, alerting, or reliability improvements to an existing production system | H4, M5 |
| Cross-system ownership | Worked across multiple services/domains rather than one narrow area, taking projects from scoping to production | M3, H2 |

### Companies or teams they have ideally worked in

- Fintech/payments companies (card issuers, payment processors, BNPL, neobanks)
- Other regulated-data companies (healthcare tech, insurtech, compliance-heavy SaaS)
- Backend/infrastructure teams at general tech companies with strong engineering rigor

### Best-fit role backgrounds

1. Backend engineer at a fintech/payments company with direct ledger/transaction experience — closest fit.
2. Backend engineer in another regulated, high-stakes domain (healthcare, compliance) with strong production-service ownership — adjacent fit; trades direct payments knowledge for proven regulated-environment judgment.
3. General backend/full-stack engineer with strong distributed-systems fundamentals but no regulated-environment exposure — weakest fit; strong on technical fundamentals but light on the domain-judgment the JD cares about most.

### The ideal skill combination

- Production backend ownership (not just feature work) combined with regulated-environment judgment (healthcare, fintech, or compliance-adjacent).
- API/distributed-systems fundamentals paired with demonstrated reliability/observability work.
- Comfort working across multiple systems/domains rather than staying in one lane.

### Strong and weak signals on a CV

- Strong signals: "Designed and deployed production backend services on AWS processing real-time [sensitive/regulated] records," "built and maintained external-facing REST APIs," "added monitoring and observability to a production system," "worked directly with compliance/risk/clinical stakeholders to ship a system that held up under real constraints."
- Weak signals: payments/fintech keywords listed only in a Skills section with no project evidence; academic-only distributed systems coursework; internal-tooling-only API work with no external consumers; reliability work described only as "monitored dashboards" with no ownership of the fix.
