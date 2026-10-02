# Agrima Jain

Backend Software Engineer

Boston, MA (able to relocate) | +64 210402457 | jainagrima8@gmail.com | linkedin.com/in/coryrowens

## Summary

Backend software engineer with 4 years of experience in production backend systems and API development. Highly experienced in healthcare data systems, cloud infrastructure, and regulated-environment delivery. Passionate about software that has to be right the first time, where a bug has a real consequence for the person on the other end of it. Methodical and detail-focused, able to dig into a new codebase, locate the weak point, and ship a fix that holds up in production.

## Skills

**Backend:** Python (FastAPI), Node.js (NestJS), REST API design, PostgreSQL, microservices architecture
**Infrastructure:** AWS (Lambda, CloudWatch), Docker, CI/CD, Step Functions workflow orchestration, service monitoring and observability
**Others:** LLM/RAG pipeline design (LangChain, Pinecone), model fine-tuning (PyTorch, Whisper), Redis caching

## Experience

**Codametrix** | AI/ML Engineer (Backend & Data Systems) | Boston, MA | Sep 2025 – Present
- Designed and deployed FastAPI microservices on AWS that process more than 1,000 real-time healthcare records a day, including the intake API that partner clinics and lab systems use to submit records into the pipeline.
- Built the retrieval and extraction layer for a 300,000-plus document pipeline, pairing a PostgreSQL metadata store with a vector index so downstream model output stayed grounded in the source records.
- Took ownership of the service after launch: added latency and error monitoring, tracked drift in extraction quality week over week, and used what came back to retune the pipeline instead of waiting for a formal review cycle.
- Partnered directly with clinical operations and compliance reviewers to turn ambiguous intake requirements into concrete pipeline behavior, revising data handling when early output did not match what reviewers expected.
- Extended the same service to handle a new audio input from endpoint design through rollout with the Whisper API, though accuracy on heavily accented recordings was still being tuned when the feature reached a limited rollout.

**Amwell** | AI Engineer Intern (Backend Integrations) | Boston, MA | May 2025 – Aug 2025
- Added REST endpoints in NestJS for a new AI matching feature.
- Tested Step Functions retry flow for the Lambda pipeline, coordinating calls between the matching service and an external recommendation API.
- Proposed a Redis cache for the same Lambda function and worked with a senior engineer to land it, cutting redundant downstream calls and reducing latency by 40% in production.

**HappyMonk AI Labs** | Founding Software Engineer (APIs & Deployment) | Bengaluru, India | Jan 2021 – Nov 2023
- Shipped FastAPI and Node REST services for a speech-to-text pipeline, exposing both real-time and batch inference endpoints in production.
- Owned a second pipeline from scoping through production rollout on the same small team: labeled a surveillance image set and trained an object detection model that reached production rather than staying a research exercise.
- Automated AWS deployments for both systems with Docker and CI/CD.

## Education

**Master of Science, Computer Science** | Northeastern University, Boston, MA | Jan 2024 – Dec 2025 | GPA 3.9
