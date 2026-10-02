Agrima Jain
ML Engineer, Ranking & Retrieval
Boston, MA | +64 210402457 | jainagrima8@gmail.com | linkedin.com/in/coryrowens

PROFILE
Systematic ML engineer with 4 years of experience across applied AI and backend engineering roles, spanning healthcare extraction, telehealth matching, and speech and vision systems. Highly experienced in retrieval, ranking, and production model deployment, with hands-on model development in PyTorch from early vision and speech work through to current relevance modeling. Passionate about understanding why a model scores or ranks something the way it does, down to the training signal behind it. Methodical and careful, comfortable trading model size against response speed to ship something that performs well in production.

SKILLS
Modeling: Python, PyTorch, ranking and relevance modeling, retrieval and reranking, representation learning, model fine-tuning (LoRA), offline evaluation
Systems: FastAPI, REST APIs, AWS (Lambda, CloudWatch), PostgreSQL, SQL, Docker, CI/CD, production inference
Other: Node.js, NestJS, LangChain, vector databases (Pinecone), Redis, Git

EXPERIENCE

AI/ML Engineer | Codametrix | Boston, MA | Sep 2025 to Present
- Designed a learned reranking model that scored retrieved clinical passages by relevance before they reached the extraction step, training it on edit and correction signals from reviewers as an implicit feedback source and comparing pairwise ranking losses to pick the one that held up best offline.
- Kept the reranker small enough to fit inside the pipeline's existing response-time budget, trading a few points of offline ranking accuracy for a model that could score every retrieved passage within the 120 to 200 millisecond window the extraction service already ran at, serving over 1,000 real-time healthcare records a day.
- Iterated on the reranker and the underlying retrieval embeddings in PyTorch over several rounds, folding in feedback from clinical reviewers on which passages actually mattered, and staging two configurations side by side in production to decide which one shipped based on the accuracy lift.
- Added a voice transcription pipeline on the Whisper API as a new input modality for the extraction system.
- Fine-tuned domain-specific LLMs with LoRA and deployed the resulting inference stack on AWS with PostgreSQL for metadata, adding monitoring that caught a drop in reranking accuracy on a document type the training data under-represented.

AI Engineer Intern | Amwell | Boston, MA | May 2025 to Aug 2025
- Built a ranking step into a provider-recommendation feature, scoring candidate providers using historical match outcomes as the training signal and raising match accuracy by 35% through iterative tuning of the retrieval and ranking logic.
- Validated a PyTorch image pipeline against 50,000+ images.
- Supported the backend for the recommendation feature with Node.js and NestJS services on AWS Lambda, adding Redis caching in a Dockerized microservice setup that cut latency by 40% ahead of launch.

Founding Software Engineer | HappyMonk AI Labs | Bengaluru | Jan 2021 to Nov 2023
- Retrained Whisper and Wav2Vec2 models in PyTorch for domain-specific speech recognition, exposing the results through FastAPI and Node endpoints for real-time and batch inference, and running structured evaluation cycles against held-out test sets before each rollout.
- Trained a YOLOv5 object detection model on a labeled set of 300,000+ surveillance frames the team collected and annotated in house, reaching a high-90s mAP and taking it from an early prototype to a real-time production deployment.
- Automated deployment with Docker, Git & CI/CD on AWS.
- Worked as one of the first engineers on a lean founding team, going directly to customers to understand their workflows and scoping fixes myself whenever a problem showed up without a clear spec.

EDUCATION
Master of Science, Computer Science | Northeastern University, Boston, MA | Jan 2024 to Dec 2025 | GPA 3.9
