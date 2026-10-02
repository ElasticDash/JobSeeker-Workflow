# JD Evaluation — Senior AI Platform Engineer, Hasbro / Wizards of the Coast

## Signals before listing

- Title says "Senior AI Developer" / "Senior AI Platform Engineer" but the stated years-of-experience bar is low: "2+ years developing and deploying production scale cloud solutions; or equivalent experience." The "or equivalent experience" clause further softens this gate.
- "Proficiency with two or more of Python, Typescript, CDK, SAP, GitHub, GitLab, AWS" is an OR-list, not a full-stack requirement; only 2 of 7 need to be demonstrated.
- Responsibilities describe an internal developer-platform / tooling team (not product-facing game development): "build out a consistent developer platform," "low code developer solutions using AI for non-developers." This implies platform/tooling and internal-stakeholder experience, not game design.
- Work mode is onsite in Renton, WA. No visa sponsorship mentioned (silence, not an explicit offer) -> treat as a soft gate requiring US work authorization.
- Salary range ($144,100-$216,100) is wide, suggesting level is flexible and decided at interview, consistent with the "Senior" title sitting on top of only a 2+ year stated floor.
- No explicit interview process described in this posting, so hands-on expectations are inferred only from the role description (building and delivering solutions), not from a stated work trial.

## Step 2: Requirements checklist

### 1. Hard gates

| Item | What the JD says | Verdict |
|---|---|---|
| Location / timezone | Onsite, Renton, WA | Real gate unless candidate is local/relocating |
| Work visa | Not mentioned | Soft gate; assume US work authorization required |
| Minimum years | "2+ years ... or equivalent experience" | Soft gate (explicitly allows equivalent experience) |
| Certificates / degree | None stated | Not a gate |
| Employment type | Not stated (assume full-time) | Not a gate |

### 2. Must-haves

| # | Requirement | Evidence to look for in the CV | Weight |
|---|---|---|---|
| M1 | 2+ years production-scale cloud solution development and deployment | Specific cloud deployments (AWS/etc.), production systems shipped, scale indicators | Highest |
| M2 | Prompt engineering and agent-based workflows for LLMs | Named LLM APIs, agent/orchestration frameworks, prompt iteration work | Highest |
| M3 | Proficiency with 2+ of: Python, TypeScript, CDK, SAP, GitHub, GitLab, AWS | Named languages/tools used in real projects, not just listed | High |
| M4 | Understanding of modern SDLC for cloud solutions | CI/CD, code review, testing/deployment pipelines mentioned in project context | Medium-high |

### 3. Hidden requirements

| # | Hidden requirement | Source in the JD | Evidence to look for in the CV |
|---|---|---|---|
| H1 | Internal developer-platform / tooling experience | "Work with internal developer teams to build out a consistent developer platform" | Building internal tools, APIs, or platforms used by other engineers |
| H2 | Enterprise SaaS automation experience | "Assist in building automation solutions for enterprise SaaS solutions" | Automation pipelines, workflow systems in an enterprise/SaaS context |
| H3 | Ability to build for non-technical end users (low-code/no-code AI tooling) | "Work on low code developer solutions using AI for non-developers" | UX-conscious tooling, no-code/low-code integrations, internal-facing product sense |
| H4 | Cross-team collaboration with non-AI internal stakeholders | "Work with internal teams to implement AI technologies in our tools and products" | Evidence of working directly with business/clinical/internal stakeholders to translate needs into solutions |

### 4. Nice-to-haves

| # | Plus | Evidence to look for in the CV |
|---|---|---|
| N1 | AWS Bedrock or SageMaker AI for agentic solutions | Named use of Bedrock/SageMaker in an agentic pipeline |
| N2 | Deployment of AI/automation workloads for enterprise software | Production AI deployment in an enterprise setting |
| N3 | Cloud account configuration/settings for deployed architecture | IAM, account-level config, infra-as-code experience |

### 5. Seniority

- Years: Stated floor is low (2+), despite "Senior" in the title; salary band is wide, suggesting level is interview-decided rather than hard-gated on years.
- People management: Not mentioned; this is an IC role ("deliver end to end solutions").
- Scope: End-to-end delivery of a single developer-platform/tooling feature or solution area, not organization-wide architecture ownership.
- Decision rights: Expected to drive solutions within a tool/platform area, working "without mandating adoption," implying influence-based rather than authority-based scope.

### 6. Domain experience

| Tier | Background | Examples |
|---|---|---|
| Direct match | Internal AI/developer-platform engineering at a mid/large enterprise | Building internal AI tooling, agent workflows, or automation platforms for other engineers/business users |
| Adjacent | Production LLM/RAG application engineering in any regulated or enterprise vertical | Healthcare, fintech, or other regulated-industry AI product work (API integration, backend, deployment) |
| Distant | General backend/cloud engineering with no AI/LLM component | Pure CRUD services, non-AI SaaS backend work |

### 7. Recency

- LLM/agentic work is a fast-moving field; only the most recent 1-2 roles should carry the prompt-engineering/agentic-workflow evidence.
- Down-weight older, pre-LLM-era automation or ML work (e.g., classic computer vision or ASR fine-tuning) unless it shows production deployment discipline that still transfers.

### Suggested scoring order

1. Gates: location/onsite (Renton, WA), work authorization.
2. Must-have coverage: M1 (production cloud years), M2 (prompt engineering/agentic workflows) need explicit project evidence; M3 and M4 can be partially inferred from tooling mentions.
3. Ranking: hidden requirements (internal platform/tooling fit), nice-to-haves (Bedrock/SageMaker), domain tier, recency.

### What this JD is really worried about

Hiring someone who can ship production-grade AI tooling that developers actually adopt voluntarily, not just a researcher or a demo-builder. The must-have and hidden-requirement evidence (production deployment, internal platform building, enterprise SDLC) are the best tests for this.

## Step 3: Hard skills and soft skills

### Hard skills

| Skill | Level | What the JD says |
|---|---|---|
| Production cloud solution development/deployment | Must-have | "2+ years developing and deploying production scale cloud solutions" |
| Prompt engineering | Must-have | "Experience with prompt engineering ... for large language models" |
| Agent-based LLM workflows | Must-have | "...and agent-based workflows for large language models" |
| Python / TypeScript / CDK / SAP / GitHub / GitLab / AWS (2+) | Must-have | "Proficiency with two or more of..." |
| Modern SDLC processes | Must-have | "Deep understanding of modern SDLC processes and procedures for cloud solutions" |
| AWS Bedrock / SageMaker AI | Nice-to-have | "Experience with AWS Bedrock or SageMaker AI for agentic solutions" |
| Cloud account/architecture configuration | Nice-to-have | "Experience with handling required settings in cloud accounts for deployed architecture" |
| Internal developer-platform building | Hidden | "build out a consistent developer platform" |
| Enterprise SaaS automation | Hidden | "automation solutions for enterprise SaaS solutions" |

### Soft skills

| Skill | Level | What the JD says |
|---|---|---|
| Cross-functional collaboration with internal teams | Hidden | "Work with internal teams to implement AI technologies" |
| Building for non-expert end users (product sense) | Hidden | "low code developer solutions using AI for non-developers" |
| Versatility / end-to-end ownership | Must-have (mainly verified in interview) | "versatile and dedicated ... who focuses on delivering end to end solutions" |
| Driving adoption without mandate (influence) | Hidden | "without mandating adoption but creating best in class tools that developers want to use" |

### Items that are not skills

- Gates: onsite Renton WA, work authorization, 2+ years (soft gate).
- Domain experience: internal platform/tooling at enterprise scale.
- Seniority: IC role, wide salary band, no people management stated.
- Recency: LLM/agentic work should be in the most recent 1-2 roles.

## Step 4: Ideal candidate profile

### Ideal candidate in one sentence

An AI/backend engineer with a few years of production cloud and LLM/agentic delivery experience who has built internal tools or platforms that other engineers or non-technical staff actually adopted, and who is comfortable translating ambiguous internal requests into shipped automation.

### Project types they have ideally done

| Project type | What they actually did | Maps to |
|---|---|---|
| Internal AI tooling/platform for other developers | Designed and shipped an internal API, SDK, or tool used by other engineering teams | H1; core business |
| Production LLM/agent pipeline | Built and deployed an agentic or prompt-driven workflow into production with monitoring | M2, M1 |
| Enterprise automation / SaaS integration | Automated a manual enterprise process using AI, integrating multiple internal/external systems | H2, M1 |
| Low-code/no-code AI tooling for non-technical users | Built a UI or integration enabling non-engineers to use an AI capability | H3 |

### Companies or teams they have ideally worked in

- Mid-to-large enterprise internal platform/developer-experience teams (companies with internal "AI enablement" or "developer platform" orgs).
- Regulated-industry AI product teams (health tech, fintech) where production LLM delivery discipline is high.
- Startups building AI tooling/infrastructure products (agent frameworks, dev tools).

### Best-fit role backgrounds

1. AI/backend engineer who has shipped production LLM or agentic systems and also built internal tooling/platforms for other engineers (strongest fit on both axes).
2. Backend/cloud engineer with strong SDLC and AWS experience who has recently picked up prompt engineering/agentic work (strong on M1/M3/M4, weaker on M2 depth).
3. ML/AI engineer strong on LLM and agentic workflows but with little internal-platform or enterprise-tooling experience (strong on M2, weaker on H1).

### The ideal skill combination

- Production LLM/agentic delivery experience paired with internal developer-platform or tooling ownership; the combination (not either alone) is what's scarce.
- Comfort working directly with non-technical/internal stakeholders to scope ambiguous automation requests.
- Hands-on cloud deployment and SDLC discipline underneath the AI work, not just prototype-level LLM experimentation.

### Strong and weak signals on a CV

- Strong signals: "Built an internal API/tool adopted by other engineering teams"; "Deployed an agentic workflow to production with monitoring and evaluation loops"; "Worked directly with internal stakeholders to translate ambiguous requirements into automation."
- Weak signals: LLM tools listed only in a Skills section with no project tied to them; cloud certifications with no deployment project; AI/ML research or model-training work with no production deployment; experience limited to a single demo or hackathon-scale project.
