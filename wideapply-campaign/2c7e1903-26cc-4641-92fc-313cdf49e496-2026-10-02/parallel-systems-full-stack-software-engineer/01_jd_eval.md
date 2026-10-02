# JD Evaluation: Full Stack Software Engineer (Software Engineer I) — Parallel Systems

## Step 1: Signals

- Title in the posting body is "Software Engineer I"; external title is "Full Stack Software Engineer". Explicitly junior: "You do not need years of production experience... We care more about how you work than how many years you have been paid to work." This softens any years-of-experience gate to near zero and shifts weight onto demonstrated learning speed and ownership rather than tenure.
- Responsibilities list TypeScript, React and Rust as the stack, plus Electron for the operator app. These three are both the core requirements and the stack used daily, so they double as must-haves and as the main skim keywords.
- "Grow into full-stack product work... including data models, APIs, and the performance and reliability of software that talks to the real world" is a responsibility line implying backend/API/data-model exposure is wanted even though this is sold as a frontend-heavy role today. Hidden requirement.
- "Work with product and vehicle/systems engineers to turn operational needs into clear, reliable interfaces" implies cross-functional collaboration with non-software engineers (hardware/vehicle systems), a hidden requirement around working across a hardware/software boundary.
- "Own features end-to-end: understand the user, implement, test, document, and follow through after merge" is a strong ownership/process signal, testable via project narratives showing a full cycle, not just "built X".
- The 30/60/90-day success criteria confirm junior level (environment setup, first shipped change in 30 days) but also confirm real ownership is expected fast (owns a full feature by day 60).
- "Experience pairing with AI coding tools and being honest about what they got wrong" is an explicit, unusual requirement: evidence of using AI coding assistants critically, not just using them.
- Degree line explicitly allows substitutes: "Bachelor's degree... or equivalent practical experience (bootcamp plus portfolio, research, or shipped projects are fine)." This softens the degree gate.
- Location is onsite in Los Angeles, CA with no mention of relocation or remote; this is a real gate given "onsite" work mode.
- Salary band ($122k-$141k) is narrow and junior-level for a Los Angeles engineering role, reinforcing the junior framing and acting as an overqualification filter against senior candidates.
- No visa sponsorship language appears in the given text; flag as unconfirmed, likely standard US work authorization requirement for a vehicle-operations company.

## Step 2: Requirements checklist

### 1. Hard gates

| Item | What the JD says | Verdict |
|---|---|---|
| Location | Los Angeles, CA; work mode "onsite" | Real gate. No remote/relocation language given; confirm relocation policy on live posting |
| Work visa | Not mentioned in the text given | Not confirmed; flag to confirm on live posting (regulated vehicle/robotics-adjacent employer) |
| Minimum years | "You do not need years of production experience" | Not a gate |
| Certificates / degree | Bachelor's in CS/CE/related, or equivalent practical experience (bootcamp + portfolio, research, or shipped projects) | Soft gate; portfolio/shipped work can substitute |
| Employment type | Not stated explicitly; language throughout implies full-time entry-level hire | Assume full-time; not a hard gate in the text given |

### 2. Must-haves

| # | Requirement | Evidence to look for in the CV | Weight |
|---|---|---|---|
| M1 | TypeScript and component-based UI (React or similar) | A project or role where TypeScript/React (or a comparable component framework) was used to build real UI, not just listed in Skills | Highest |
| M2 | Rust or a track record of picking up new languages fast | Rust project/coursework, or clear evidence of quickly becoming productive in an unfamiliar language/tool (career-change speed, new stack adoption) | High |
| M3 | End-to-end feature ownership | A bullet showing understand-user to implement to test to document to follow-through, not just "built X" | High |
| M4 | Experience with Python or another of Rust/React/TypeScript | Any project/professional use of Python, React, TypeScript, or Rust beyond coursework | Medium-high |
| M5 | Experience pairing with AI coding tools and critically assessing their output | A line describing use of AI coding assistants and catching/correcting their mistakes | Medium; mainly verified in interview if CV has no explicit bullet |
| M6 | Bachelor's degree in CS/CE/related or equivalent practical experience | Degree line, or portfolio/shipped projects substituting for it | Medium |

### 3. Hidden requirements

| # | Hidden requirement | Source in the JD | Evidence to look for in the CV |
|---|---|---|---|
| H1 | Backend/API/data-model exposure | "Grow into full-stack product work... including data models, APIs, and the performance and reliability of software that talks to the real world" | Any backend API, database, or data-model work, even outside the primary role |
| H2 | Collaboration across a hardware/software boundary | "Work with product and vehicle/systems engineers to turn operational needs into clear, reliable interfaces" | Any project working alongside non-software disciplines (hardware, ops, clinical, embedded) to define requirements |
| H3 | Desktop app / Electron exposure | "Ship features in our Electron operator application" | Electron, Tauri, or other desktop-wrapper experience |
| H4 | Fast independent learning under ambiguity | 30/60/90-day plan language ("independently identifying and fixing problems without waiting to be assigned") | Evidence of self-directed problem scoping without a fully specified spec |

### 4. Nice-to-haves

| # | Plus | Evidence to look for in the CV |
|---|---|---|
| N1 | Desktop wrappers (Electron, Tauri) | Named Electron/Tauri use |
| N2 | Backend development or databases | FastAPI, Node.js, NestJS, SQL/NoSQL database work |
| N3 | Networks, operating systems, or distributed systems coursework/projects | Coursework list, systems-level projects, distributed/microservice work |

N2 (backend/databases) overlaps with H1 and is close to what the role grows into, so its weight is close to a must-have in practice.

### 5. Seniority

- Years: effectively 0-2; explicitly de-emphasized ("you do not need years of production experience").
- People management: none; pure IC role.
- Scope: owns individual features within the Interfaces team; by day 90 expected to touch UI plus some data/API/performance work.
- Decision rights: implementation-level decisions on owned features; relies on product/vehicle engineers for requirements.

### 6. Domain experience

| Tier | Background | Examples |
|---|---|---|
| Direct match | Operator-facing software for physical/industrial systems (fleet, robotics, autonomous vehicles, logistics) | Operator dashboards, fleet management UIs, robotics control interfaces |
| Adjacent | Desktop/Electron apps, or software that interfaces with real-world/hardware systems, or B2B product UIs with API/data-model work | Internal tools, IoT dashboards, healthcare/clinical software talking to real-world data streams, ops tooling |
| Distant | General web/full-stack work with no real-world-system tie-in | Generic CRUD web apps, marketing sites, pure backend/ML work with no UI component |

### 7. Recency

- The stack (TypeScript/React/Rust/Electron) is not a fast-moving niche, but the JD wants it demonstrated recently or at least practically, not just coursework from years ago.
- Most recent 1-2 experiences should show hands-on TypeScript/React (or equivalent UI framework) work; older or academic-only exposure should be down-weighted relative to anything built recently.
- AI-coding-tool pairing experience should read as current practice, not a dated one-off.

### Suggested scoring order

1. Gates: location (onsite LA, confirm relocation), work authorization (confirm), degree or equivalent practical evidence.
2. Must-have coverage: M1 (TS/React) and M2 (Rust or fast language pickup) need explicit evidence; M3 (end-to-end ownership) needs a full-cycle bullet; M4-M6 round out coverage.
3. Ranking: hidden requirements (H1-H4), then nice-to-haves (N1-N3), then domain tier and recency.

### What this JD is really worried about

Hiring a junior engineer who cannot ramp fast enough on an unfamiliar stack (Rust, Electron, a hardware-adjacent domain) or who needs a fully specified spec instead of operating with real ownership. The checklist items that test this best are M2 (track record of fast language/tool pickup), M3 (end-to-end ownership), and H4 (independent problem-scoping).

## Step 3: Hard skills and soft skills

### Hard skills

| Skill | Level | What the JD says |
|---|---|---|
| TypeScript | Must-have | "Build and improve the operator and customer product platform in TypeScript, React, and Rust" |
| React (or similar component UI framework) | Must-have | "component-based UI (React or similar)" |
| Rust | Must-have | Listed as core stack; also "Project or professional experience with Rust, React, TypeScript, or Python" |
| Python | Nice-to-have (one of the listed stack options) | "Project or professional experience with Rust, React, TypeScript, or Python" |
| Electron / Tauri (desktop wrappers) | Hidden / Nice-to-have | "Ship features in our Electron operator application"; "Exposure to desktop wrappers (Electron, Tauri)" |
| Backend development / databases | Hidden / Nice-to-have | "Grow into full-stack product work... including data models, APIs..."; "Exposure to...backend development, or databases" |
| Networks, operating systems, distributed systems | Nice-to-have | "Coursework or projects touching networks, operating systems, or distributed systems" |
| AI coding tool usage | Must-have | "Experience pairing with AI coding tools and being honest about what they got wrong" |

### Soft skills

| Skill | Level | What the JD says |
|---|---|---|
| High agency / ownership | Must-have | "high agency, clear communication, and the hunger to learn fast"; "Own features end-to-end" |
| Clear communication | Must-have | Same line as above; also cross-functional work with product/vehicle engineers |
| Fast, independent learning | Must-have | "track record of picking up a new tool, language, or domain and becoming useful with it" |
| Cross-functional collaboration (software/hardware boundary) | Hidden | "Work with product and vehicle/systems engineers to turn operational needs into clear, reliable interfaces" |
| Critical judgment of AI-generated code | Must-have | "being honest about what they got wrong" |
| Self-directed problem identification | Hidden | 90-day success criterion: "independently identifying and fixing problems without waiting to be assigned" |

All soft skills above are mainly verified in interview; a CV can only gesture at them through specific project narratives.

### Items that are not skills

- Gates: location (onsite LA), work authorization (unconfirmed), degree or equivalent.
- Domain experience: operator/fleet/robotics software vs. adjacent real-world-system software vs. distant/generic web work.
- Seniority: 0-2 years, pure IC, feature-level scope.
- Recency: stack experience should be current, not only academic/old.

## Step 4: Ideal candidate profile

### Ideal candidate in one sentence

A junior-to-early-career engineer who has shipped real TypeScript/React UI work (ideally touching a desktop app or a system that talks to real-world/hardware data), has picked up at least one unfamiliar language or stack fast enough to be useful, and can describe owning a feature from understanding the user through to post-merge follow-through.

### Project types they have ideally done

| Project type | What they actually did | Maps to |
|---|---|---|
| Operator/ops dashboard or control UI for a physical system | Built React/TypeScript UI surfacing real-time state of hardware, vehicles, or industrial processes to operators | M1, H1, H2; core business |
| Desktop app via Electron or Tauri | Shipped features inside an Electron/Tauri-wrapped web app | M1, H3, N1 |
| Backend API/data-model work behind a UI | Built APIs and data models that fed a frontend they also worked on | H1, N2 |
| Fast pickup of a new language or stack | Took on Rust, Go, or another unfamiliar language for a scoped project and became productive quickly | M2, H4 |
| End-to-end owned feature | Took a feature from requirements gathering through implementation, testing, docs, and post-merge iteration | M3 |

### Companies or teams they have ideally worked in

- Robotics, autonomous vehicle, drone, or industrial-IoT startups building operator software (e.g. companies building fleet management or telemetry UIs).
- Developer-tool or internal-tools teams at any company that ship Electron/Tauri desktop apps.
- Small startups or founding-engineer-style roles where ownership of a feature end-to-end is routine (not large-company process-only work).

### Best-fit role backgrounds

1. Junior/entry-level full-stack or frontend engineer with direct React/TypeScript shipping experience, ideally on a product that talks to real-world/hardware data.
2. Engineer from an adjacent domain (e.g. AI/backend-heavy roles) with strong evidence of fast stack pickup and end-to-end ownership, but comparatively thinner production React/TypeScript history; trade-off is strong agency/learning signal against weaker direct UI evidence.
3. New-grad with strong coursework in systems (networks/OS/distributed) and a shipped personal/class project in React or Rust, but no professional experience; trade-off is depth vs. breadth.

### The ideal skill combination

- TypeScript/React UI work paired with real backend/API exposure, so the candidate can "grow into full-stack" credibly.
- Demonstrated fast ramp on an unfamiliar language or tool, which substitutes for Rust-specific experience the JD does not strictly require on day one.
- End-to-end ownership narrative (not just feature count) combined with explicit, honest use of AI coding tools.
- This combination (UI shipping + fast learning + full-cycle ownership) is the scarce part; any one piece alone is common among junior applicants.

### Strong and weak signals on a CV

- Strong signals: "Built and shipped a React/TypeScript feature end-to-end, from requirements to post-launch monitoring"; "Picked up Rust for a class project and shipped a working CLI/service within weeks"; "Worked directly with [non-software] stakeholders to translate operational needs into UI requirements"; "Used GitHub Copilot/Claude/Cursor to accelerate development, catching and fixing incorrect suggestions before merge."
- Weak signals: TypeScript or React listed only in a Skills section with no project tie; old academic-only coursework in systems with no applied project; "familiar with Electron" with no shipped feature; generic "collaborated cross-functionally" with no concrete counterpart named.
