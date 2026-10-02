# Agrima Jain

**Software Engineer**

Boston, MA · +64 210402457 · jainagrima8@gmail.com · linkedin.com/in/coryrowens

## Summary

Software engineer with 4 years of experience across backend systems and applied AI, including RAG pipelines, LLM integration, and production ML deployment. Highly experienced in Python-based services, vector search, and healthcare data pipelines, with recent work extending into TypeScript and React tooling. Passionate about picking up whatever stack a problem actually needs rather than staying in one lane. Comfortable learning a new language or framework fast and carrying a feature from a vague ask through to something running in production.

## Skills

Python, TypeScript, Rust, SQL, FastAPI, Node.js, NestJS, React
AWS (Lambda, SageMaker, CloudWatch), Docker, PostgreSQL, Redis, CI/CD, microservices, RAG pipelines, LLM API integration (OpenAI, Claude), prompt engineering, model evaluation, vector search (Pinecone)
Others: MongoDB, PyTorch, speech and vision ML (Whisper, YOLOv5)

## Experience

**Codametrix** | AI/ML Engineer | Boston, MA | Sep 2025 – Present
- Designed the embeddings and retrieval layer for a RAG pipeline tying OpenAI and Claude models to Pinecone, grounding inference and structured extraction across a 300,000+ document corpus, including a voice-to-text channel built on the Whisper API.
- Built and deployed FastAPI microservices on AWS, backed by PostgreSQL for metadata, that pulled together multiple internal and third-party sources to process over 1,000 real-time healthcare records a day, with monitoring in place to track latency and failures in production.
- Put together a lightweight TypeScript and React dashboard for monitoring extraction accuracy and pipeline health.
- Fine-tuned domain-specific LLMs with LoRA and built evaluation loops to track extraction accuracy and hallucination rate, using AI coding assistants to draft eval scripts faster and checking their output carefully before trusting the numbers.
- Worked directly with clinical stakeholders to pin down ambiguous requirements, then turned what they described into concrete decisions about the extraction schema and API responses the rest of the system relied on, rather than building strictly to a handed-off spec.

**Amwell** | AI Engineer Intern | Boston, MA | May 2025 – Aug 2025
- Helped build a RAG pipeline with LangChain to retrieve domain knowledge and power recommendations, tuning prompts and retrieval settings to lift match accuracy by 35%.
- Supported REST API development in Node.js and NestJS on AWS Lambda.
- Tested and evaluated an image prediction pipeline in PyTorch across 50K+ images to check model performance before it shipped; a couple of edge-case failure modes were still being triaged by the team when my internship ended.
- Added Redis caching to an LLM-backed microservice, containerized with Docker and wired into CI/CD, cutting production latency by about 40%.

**HappyMonk AI Labs** | Founding Software Engineer | Bengaluru | Jan 2021 – Nov 2023
- Stood up FastAPI and Node.js REST services for a speech-to-text pipeline, exposing endpoints for both real-time and batch inference in production.
- Adapted Whisper and Wav2Vec2 for domain-specific speech recognition in PyTorch, then switched to a different computer vision stack to train a YOLOv5 detector on 300K+ labeled surveillance frames, reaching 93.5% mAP.
- Automated deployment with Docker, Git, and CI/CD on AWS.
- Partnered closely with customers as a founding engineer to understand their workflows, scoping loosely defined problems on my own and owning delivery from design through rollout, while explaining trade-offs so the rest of engineering stayed aligned on the right problem to solve.

## Education

Master of Science, Computer Science, Northeastern University, Boston, MA, Jan 2024 – Dec 2025, GPA 3.9

## Projects

- **MedFlow, AI Intake Chatbot**: Built a React and Node.js chatbot with RESTful APIs, integrating Claude, OpenAI, and LangChain with vector search for real-time query resolution, with guardrails including PII redaction and output validation.
- **Log Analyzer CLI** (personal project): Taught myself Rust over a few weekends and built a command-line tool that parses and summarizes service logs, picking the language up well enough to ship a working tool fast.
