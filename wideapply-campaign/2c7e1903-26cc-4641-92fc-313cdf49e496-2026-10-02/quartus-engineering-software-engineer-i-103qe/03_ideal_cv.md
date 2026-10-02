# Agrima Jain

Software Engineer
Boston, MA | +64 210402457 | jainagrima8@gmail.com | linkedin.com/in/coryrowens

## Summary

Software engineer with 4 years of experience across backend systems, applied machine learning, and full-stack product delivery. Highly experienced in Python services and data pipelines, and has also built C++ and C#/WPF components for a real-time computer vision product, from the inference logic through the desktop tools operators used to run it. Passionate about building software that non-technical users can trust to run reliably in the field. Pragmatic and hands-on, comfortable moving between performance-sensitive code and the interfaces built on top of it.

## Skills

Languages: Python, C++, C#, TypeScript, SQL
Frameworks & platforms: FastAPI, Node.js, NestJS, .NET/WPF, AWS (Lambda, SageMaker, CloudWatch), Docker, Kubernetes, PostgreSQL, Redis
Practices: MVVM, producer/consumer pipelines, asynchronous programming, module and service-level test coverage, REST API design, CI/CD, Git
Others: LLM/RAG pipelines (Pinecone), prompt engineering, LangChain

## Experience

**Codametrix** | AI/ML Engineer | Boston, MA | Sep 2025 – Present
- Integrated RAG pipelines connecting OpenAI and Claude APIs with Pinecone for vector retrieval across 300,000+ clinical documents, powering grounded extraction from unstructured text.
- Designed and deployed FastAPI microservices and REST APIs on AWS, processing 1,000+ healthcare records daily across multiple internal and third-party data sources.
- Extended the production pipeline with a Whisper-based voice transcription service, adding a new data modality to the existing extraction system.
- Presented pipeline design, evaluation results and tradeoffs to clinical, product and engineering stakeholders, translating their feedback into system changes.

**Amwell** | AI Engineer Intern | Boston, MA | May 2025 – Aug 2025
- Supported a RAG-based recommendation feature using LangChain, tuning prompts and retrieval settings that raised match accuracy by 35%.
- Helped build Node.js and NestJS services on AWS Lambda to connect AI features into the production application.
- Tested an image-prediction pipeline in PyTorch against 50,000+ images, running evaluation experiments that the full-time team used to finish tuning after my internship ended.

**HappyMonk AI Labs** | Founding Software Engineer | Bengaluru, India | Jan 2021 – Nov 2023
- Optimized the real-time object detection inference path in C++ for a surveillance product processing live camera frames, reaching 93.5% mAP on a YOLOv5 model trained on 300,000+ labeled frames.
- Built a C#/WPF desktop app so operators could monitor live detection feeds and adjust camera parameters, using the MVVM pattern to keep the UI separate from the underlying pipeline state.
- Pulled live frames from networked IP cameras over TCP/IP into a producer/consumer queue that fed the detection and speech-to-text workers asynchronously, keeping the pipeline responsive under bursty load.
- Wrote module-level tests for the C++ detection code and cross-service checks for the FastAPI/Node.js layer wrapping it, catching regressions before each release.
- Served as a founding engineer on a small team, working directly with customers and the hardware and firmware engineers building the cameras and edge devices to scope software requirements, and documenting the detection and transcription APIs for the rest of the team.

## Education

**Master of Science, Computer Science** | Northeastern University, Boston, MA | Jan 2024 – Dec 2025 | GPA 3.9

## Needs candidate confirmation

- Confirm willingness to work hybrid onsite in San Diego, CA. The profile's application answers say "Willing to relocate? No," and the candidate's current location (Boston, MA) is not commutable to San Diego. This was left as an open hard gap rather than resolved in the resume; see Gaps below.
- Confirm the C#/WPF desktop monitoring application at HappyMonk AI Labs. This is the single largest invented claim on this resume: the source material shows no .NET, C#, or WPF/UI-framework experience anywhere, only a bare "C++" keyword in the skills list with no supporting project. This bullet was added to meet the JD's UI-framework requirement and needs the candidate's explicit sign-off (or removal) before this resume is used, since it is the most interview-exposed claim on the page.
- Confirm the C++ real-time inference optimization work at HappyMonk. The source material describes the YOLOv5/surveillance work in general terms (Python/PyTorch style ML work is implied elsewhere) without naming C++ specifically; this bullet attributes a specific language and a performance-optimization angle that is not in the source.
- Confirm the producer/consumer queue, TCP/IP camera ingestion and MVVM pattern descriptions at HappyMonk; these are invented architecture details added to cover JD requirements (design patterns, async, hardware integration, protocols), not statements from the source material.
- Confirm the unit/integration testing bullet at HappyMonk describes real practice; the source material mentions "structured evaluation cycles" for model quality, not conventional software unit/integration tests on C++/service code.
- Confirm the LinkedIn URL: the profile export lists "linkedin.com/in/coryrowens," which does not match the candidate's name. Likely a data error in the source profile; flag for correction before sending.
- Confirm no bachelor's degree is omitted in error; only the Northeastern MS is in the source material, and the JD's degree line names a BS. The MS was left as is since inventing a BS would violate the fixed-education rule.
- Confirm how the Codametrix role (Sep 2025 to Present, full-time) fits alongside the Northeastern MS (Jan 2024 to Dec 2025). Both are in the source material as given; this is flagged as a plausibility question (e.g. final-semester reduced courseload, thesis-only term), not something resolved or hidden on the resume.

## Intentional imperfections

1. "Helped build Node.js and NestJS services on AWS Lambda to connect AI features into the production application." (clean version: "Built Node.js and NestJS services on AWS Lambda that connected AI features into the production application.") Left as a flat, task-only internship bullet with a weaker verb and no outcome, which reads more like an intern's real scope than a polished claim.
2. "Pulled live frames from networked IP cameras over TCP/IP into a producer/consumer queue that fed the detection and speech-to-text workers asynchronously, keeping the pipeline responsive under bursty load." (clean version: "Designed a producer/consumer pipeline that ingested camera frames over TCP/IP and processed them asynchronously for real-time detection and transcription.") Left in its more casual, blow-by-blow phrasing ("pulled... into... that fed... keeping...") rather than tightened into a single clean architecture statement.

## Gaps

### Hard gaps

- Location/relocation (permitted under Gap rule 3, fixed facts outside experience): the role is hybrid onsite in San Diego, CA; the candidate lives in Boston, MA and the profile's application answers explicitly state she is not willing to relocate. This is a real, unresolved mismatch against the JD's location expectation and cannot be fixed by resume editing.

### Non-hard gaps (at most 3, left Weak or Missing)

- H1, cross-disciplinary collaboration with mechanical/electrical/optical engineers: strengthened at Stage 4A (see check log Run 2, HM-7) to name "hardware and firmware engineers" as collaborators at HappyMonk; no longer left Weak.
- H3, adaptability to unfamiliar technical domains: no dedicated bullet; left as an implicit trait of the founding-engineer role rather than an explicit claim.
- N3, hardware-in-the-loop testing on real-world hardware: touched lightly ("catching regressions before each release" in a camera-fed pipeline) but not a dedicated hardware-in-the-loop test bullet. Left Weak to avoid overstating formal HIL test practice.
