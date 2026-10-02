# JD Evaluation: Software Engineer I - 103QE, Quartus Engineering

## Step 2: Requirements checklist

### 1. Hard gates

| Item | What the JD says | Verdict |
|---|---|---|
| Location / work mode | San Diego, CA, hybrid | Real gate unless remote exception; no remote mentioned |
| Work authorization | "Must be a US Person (US Citizen or US Permanent Resident)" | Real, binary gate |
| Minimum years | "0-2 years of software development experience" | Soft band, not stated as a hard floor, but posting targets entry level |
| Degree | "BS in Computer Science, Computer Engineering, or related discipline" | Real gate (or equivalent experience implied, not stated) |
| Employment type | Not stated explicitly, salary given as annual range | Assume full-time |

### 2. Must-haves

| # | Requirement | Evidence to look for in the CV | Weight |
|---|---|---|---|
| M1 | Experience with .NET, C#, or C/C++ | A project or role that used one of these languages to build real software, not just a skills-list mention | Highest |
| M2 | UI development experience (WPF, WinUI, Avalonia, Blazor, etc.) | A specific desktop/app UI built with one of these frameworks | High |
| M3 | Design principles and patterns (OOP, MVVM, Producer/Consumer) | Architecture decisions described in a project, not just terminology | Medium-high |
| M4 | Asynchronous programming (Async/Await, Tasks, Futures) | Concrete use of async patterns in a real system | Medium-high |
| M5 | Software that integrates with hardware, control systems, UIs | A project where software talked to physical hardware or control systems | High |
| M6 | Testing/debugging via unit and integration tests | Named test frameworks or a described test/validation process | Medium |
| M7 | Present technical information to groups | Mainly verified in interview; CV evidence is weak signal only | Medium |

### 3. Hidden requirements

| # | Hidden requirement | Source in the JD | Evidence to look for in the CV |
|---|---|---|---|
| H1 | Comfort working in a cross-disciplinary team (mechanical, hardware, optical, electrical engineers) | "Collaborate with cross-disciplinary teams to deliver complete system solutions" | Prior work alongside hardware/EE/ME teams, not pure software teams |
| H2 | Documentation and technical writing | "Share your expertise through documentation and clear technical communication" | Evidence of writing specs, docs, or technical reports |
| H3 | Adaptability to unfamiliar technical domains | "You will gain exposure to new challenges that you have not seen before" | Evidence of ramping quickly into new domains/stacks |

### 4. Nice-to-haves

| # | Plus | Evidence to look for in the CV |
|---|---|---|
| N1 | Communication protocols (UART, EtherCAT, UDP, TCP/IP, MODBUS) | Any protocol-level or embedded networking work |
| N2 | Software system design/architecture experience | Ownership of a system's architecture, even junior-level |
| N3 | Testing software on real hardware | Hardware-in-the-loop or bench testing experience |

### 5. Seniority

- Years: 0-2 years targeted; salary band ($64.7k-$105.7k) is wide, suggesting some flexibility by experience level at offer stage.
- People management: none, individual contributor only.
- Scope: single engineer embedded in a cross-disciplinary project team, not owning a full system alone.
- Decision rights: limited; junior-level execution under senior guidance implied by "Engineer I" title and pay band.

### 6. Domain experience

| Tier | Background | Examples |
|---|---|---|
| Direct match | Engineering-services firm building software tied to physical hardware (optics, controls, instrumentation) | Defense/aerospace contractor software roles, instrumentation companies |
| Adjacent | Desktop/application software with hardware or device integration in any industry | Industrial automation, robotics, medical device software, embedded systems |
| Distant | Pure web/backend or data/AI software with no hardware or device touchpoint | SaaS backend, pure data science/ML roles |

### 7. Recency

- Desktop UI (WPF/WinUI) and .NET/C# skills are not a fast-moving field; recency within the last 2-3 years is fine, no need to be in the current role.
- Most recent role should show hands-on coding in C#/C++/.NET if possible; older stacks (e.g. a 2021-2023 role) can still count as the primary evidence if nothing more recent exists.
- Down-weight skills-list-only mentions with no project evidence anywhere in the work history.

### Suggested scoring order

1. Gates: work authorization, location/hybrid feasibility, degree.
2. Must-have coverage: M1 (language) and M2 (UI framework) need explicit project evidence; M5 (hardware integration) is the next most load-bearing.
3. Ranking factors: N1-N3, domain tier, recency.

### What this JD is really worried about

Hiring a software engineer who can only write isolated application code and cannot function inside a hardware-centric, cross-disciplinary engineering team, or who lacks the specific .NET/C++ desktop-UI skill set the group standardizes on. M1, M2 and M5 best test for this.

## Step 3: Hard and soft skills

### Hard skills

| Skill | Level | What the JD says |
|---|---|---|
| .NET / C# | Must-have | "Experience with .NET, C#, or C/C++ required" |
| C / C++ | Must-have (alternate to .NET/C#) | Same line, listed as an alternative |
| WPF / WinUI / Avalonia / Blazor | Must-have | "Experienced with user interface design (WPF, WinUI, Avalonia, Blazor, etc.)" |
| OOP / MVVM / Producer-Consumer patterns | Must-have | "Understanding of design principles, methodologies, and patterns" |
| Async/Await, Tasks, Futures | Must-have | "Experience working with asynchronous programming" |
| Unit and integration testing | Must-have | "Test, debug, and validate software via unit and integration testing" |
| Hardware/control-system integration | Must-have | "Design and develop software that integrates with hardware, control systems" |
| Communication protocols (UART, EtherCAT, UDP, TCP/IP, MODBUS) | Nice-to-have | "Preferred Qualifications" |
| Software architecture/design | Nice-to-have | "Experience designing and architecting software systems" |
| Hardware-in-the-loop testing | Nice-to-have | "Experience testing software on real-world hardware" |

### Soft skills

| Skill | Level | What the JD says |
|---|---|---|
| Cross-disciplinary collaboration | Hidden | "Collaborate with cross-disciplinary teams" |
| Technical presentation/communication | Must-have | "Demonstrate ability to compellingly present technical information to groups" |
| Documentation | Hidden | "Share your expertise through documentation" |
| Adaptability/learning new domains | Hidden | "You will gain exposure to new challenges that you have not seen before" |

### Items that are not skills

- Hard gates: work authorization, location/hybrid, degree.
- Domain experience tiering (Section 6).
- Seniority band (Section 5).
- Recency guidance (Section 7).

## Step 4: Ideal candidate profile

### Ideal candidate in one sentence

A junior-to-early-career software engineer who has built real .NET/C# or C/C++ desktop applications with a WPF/WinUI-style UI on top of async, pattern-driven architecture, ideally with some exposure to hardware or control-system integration in a cross-disciplinary engineering environment.

### Project types they have ideally done

| Project type | What they actually did | Maps to |
|---|---|---|
| Desktop control/monitoring application | Built a WPF or WinUI app that commands or monitors a hardware device, using MVVM and async I/O | M1, M2, M3, M4, M5 |
| Instrumentation or test-automation software | Wrote C#/C++ software that talks to lab/bench hardware over a protocol (serial, TCP/IP) | M1, M5, N1, N3 |
| Internal tooling with unit tests | Built and tested a C#/C++ tool with a defined test suite | M6 |

### Companies or teams they have ideally worked in

- Defense/aerospace engineering-services firms (similar to Quartus itself)
- Instrumentation, test-and-measurement, or industrial-automation companies
- Robotics or medical-device software teams
- Small engineering shops where software engineers sit alongside hardware/ME/EE engineers

### Best-fit role backgrounds

1. Junior software/firmware engineer who built a desktop UI over hardware control logic (closest fit).
2. New-grad .NET/C# developer with internship or academic project experience in WPF/WinUI, no hardware exposure (strong on M1-M4, weak on M5).
3. C++ engineer from an unrelated (non-desktop-UI) domain, e.g. backend or systems programming, with no UI-framework experience (strong on language, weak on M2).
4. Software engineer from an entirely different stack (web, data, AI) who would need to be evaluated mainly on adjacent reasoning, patterns, and trainability (weak on M1, M2, M5; this is a stretch fit).

### The ideal skill combination

- .NET/C# or C/C++ fluency paired with a desktop UI framework (WPF/WinUI/Avalonia/Blazor) is the specific, less-common combination this JD wants.
- Add hardware/control-system integration experience and the candidate is rare for the junior level.
- Single items (just C++, or just UI work, or just "worked with hardware") are common separately; the combination of language + desktop UI + hardware touch is what is scarce.

### Strong and weak signals on a CV

- Strong signals: "Built a WPF desktop application in C# to monitor and control [hardware device] in real time using MVVM and async I/O"; "Wrote C++ software interfacing with [sensor/controller] over serial/TCP"; "Unit-tested a C#/C++ module with [framework]".
- Weak signals: C++ or C# listed only in a Skills section with no supporting project; UI framework experience that is actually web frontend (React, etc.) mislabeled as "UI design"; hardware references that are really cloud infrastructure, not physical hardware.
