/**
 * Knowledge base for the in-browser AI twin.
 * Each chunk is retrieved with BM25 over `title + keys + answer`, then the
 * answer is streamed back with a citation to `href`. Keep every answer
 * grounded in something that is visible on the page.
 */
window.HK_KB = [
  {
    id: 'who', title: 'About · who is Harshil', href: '#about',
    keys: 'who is harshil kaneria introduce yourself summary bio overview tell me about him background experience years',
    answer: 'Harshil Kaneria is an AI engineer who started in ML, with 5+ years in the field, based in Rajkot, India. His first serious work was graph-neural-network research at IIT Gandhinagar; since January 2023 he has shipped multi-agent systems, RAG pipelines and voice agents to production at Argusoft, along with the evals that prove they work.'
  },
  {
    id: 'argusoft', title: 'Experience · Argusoft', href: '#experience',
    keys: 'current job role company employer argusoft solution analyst where does he work present position experience years',
    answer: 'Since January 2023 he has worked at Argusoft India Ltd in Gandhinagar as an AI engineer (officially Solution Analyst, ML & AI Engineering). There he ships agentic scraping, RAG document Q&A, natural-language-to-chart tooling, Zoom and phone voice agents, and a Django and Flask time-series backend handling 10K+ records a day on AWS.'
  },
  {
    id: 'production', title: 'Projects · in production', href: '#work',
    keys: 'shipped production deployed real world impact clients live systems what has he built',
    answer: 'Four systems are in production. An agentic scraper that tracks medicine prices across 10+ e-commerce platforms in near real time. A RAG Q&A pipeline that hits 97% accuracy over 1,000+ scanned documents. An NL-to-chart tool at 90%+ accuracy that saves 50+ hours a month. Voice agents that improved action-item capture by 40%.'
  },
  {
    id: 'scrape', title: 'Projects · agentic scraping', href: '#work',
    keys: 'scraping scraper playwright celery langgraph medicine price comparison ecommerce vendor real time crawling',
    answer: 'The agentic scraping system uses LangGraph to orchestrate agents, Celery for distributed work and Playwright for browsing. It compares medicine prices and availability across 10+ e-commerce platforms, close to real time.'
  },
  {
    id: 'rag', title: 'Projects · RAG document Q&A', href: '#work',
    keys: 'rag retrieval augmented generation stack vector database chromadb llama langchain ocr documents pdf accuracy embeddings pgvector pinecone faiss graphrag',
    answer: 'His production RAG stack is LangChain with LLaMA, ChromaDB for vectors and an OCR front end for scanned PDFs. It answers over 1,000+ documents at 97% accuracy. He has also worked with pgVector, Pinecone, FAISS and GraphRAG.'
  },
  {
    id: 'chart', title: 'Projects · NL → charts', href: '#work',
    keys: 'chart generation natural language analytics fine tuning fine-tuned openai business queries visualization nlp',
    answer: 'He built a tool where fine-tuned OpenAI models turn business questions written in plain English into charts. It runs at 90%+ accuracy and saves the team 50+ hours a month.'
  },
  {
    id: 'voice', title: 'Projects · voice agents', href: '#work',
    keys: 'voice agent zoom twilio whisper speech call meeting transcription conversational phone',
    answer: 'His conversational agents join Zoom meetings and phone calls (Zoom SDK, Twilio, Whisper plus LLMs). They improved action-item capture by 40% and call efficiency by 30%.'
  },
  {
    id: 'cascade', title: 'Projects · Cascade', href: '#p-cascade',
    keys: 'cascade root cause incident on call oncall sre falsifier hypothesis triage abstain abstention microservices alerts duckdb',
    answer: 'Cascade is an on-call root-cause agent. Triage, hypothesis and falsifier agents investigate a simulated 12-service system. Two deterministic checks follow with no model call: a precedence checker and an evidence validator. It abstains when evidence is thin, and every fix waits for human approval. The baselines score 0.60 (heuristic) and 0.30 (single prompt) top-1. Cascade is hand-verified on 3 representative incidents, and the full number is deliberately not published unverified.'
  },
  {
    id: 'nexus', title: 'Projects · Nexus', href: '#p-nexus',
    keys: 'nexus microsoft build hackathon devops ci cd pipeline test selection quality gates postmortem gpt-4o xgboost',
    answer: 'Nexus is an AI-native DevOps platform that placed at the Microsoft Build AI Hackathon 2026. It covers GPT-4o diff risk scoring, test selection with XGBoost plus an LLM (67% less CI time on the demo data), adaptive quality gates, automatic incident postmortems and plain-English DevOps chat.'
  },
  {
    id: 'graph', title: 'Projects · Graph Chatbot', href: '#work',
    keys: 'graph chatbot text to sql text-to-sql postgres postgresql database natural language query gemini guardrail',
    answer: 'Graph Chatbot lets you ask any PostgreSQL database questions in plain English. It uses schema-aware text-to-SQL, a SELECT-only safety guardrail, session memory and automatic charts. The stack is FastAPI, asyncpg, Gemini, HF Inference and React.'
  },
  {
    id: 'ipl', title: 'Projects · IPL Coaching Simulator', href: '#work',
    keys: 'ipl cricket coaching simulator game gdg vibe coding leaderboard websockets tactical decisions',
    answer: 'The IPL Coaching Simulator puts you in the dugout of a live, ball-by-ball match simulation. An LLM grades each tactical call on captain alignment, historical merit and tactical rules, then ranks you on a real-time leaderboard. It is built with FastAPI, React and WebSockets, with 69 tests passing.'
  },
  {
    id: 'wearable', title: 'Projects · wearable anomaly detection', href: '#work',
    keys: 'wearable health anomaly detection isolation forest shap explainable xai streaming heart rate spo2',
    answer: 'His wearable anomaly detection project streams simulated health data for many users concurrently with asyncio. It fits an Isolation Forest on a 13-dimensional feature vector, then turns SHAP attributions into plain-language clinical alerts.'
  },
  {
    id: 'photo', title: 'Projects · AI photo culling', href: '#work',
    keys: 'photo culling computer vision images opencv deepface pytorch u2net captus aesthetics quality',
    answer: 'The AI photo culling system extracts 72 ML features covering grouping, quality, composition, pose, aesthetics and cultural context. It runs at 2.7 images per second on CPU only with 98% accuracy. Captus is a keyboard-first culling workspace on top of it.'
  },
  {
    id: 'research', title: 'Research · GNN air-quality forecasting', href: '#research',
    keys: 'research paper publication workshop gnn graph neural network air quality aqi pm2.5 pm25 forecasting climate weather atmospheric iit gandhinagar spatiotemporal knowair amalthea nipun batra',
    answer: 'At IIT Gandhinagar (Jan–May 2022), under Prof. Nipun Batra, he built a spatiotemporal graph neural network to forecast PM2.5 across 184 cities using the KnowAir dataset (4 years, 3-hourly, 17 meteorological features). He benchmarked seven architectures from MLP and LSTM to GC-LSTM and PM2.5-GNN, built a knowledge-enhanced graph with 300 km distance and 1,200 m mountain-barrier constraints, and replicated PM2.5-GNN at an RMSE of about 19.6. It was presented at the Workshop on Climate Change and ML at Amalthea 2022.'
  },
  {
    id: 'years', title: 'About · experience', href: '#about',
    keys: 'how many years experience long field ml ai machine learning senior seniority career',
    answer: 'He has 5+ years in ML and AI. He started in ML, with graph-neural-network research at IIT Gandhinagar, and has spent 3+ years shipping ML and LLM systems in production as an AI engineer at Argusoft (since January 2023).'
  },
  {
    id: 'dehaze', title: 'Projects · satellite dehazing', href: '#work',
    keys: 'satellite dehazing haze fog multispectral images cnn smart india hackathon sih',
    answer: 'For Smart India Hackathon he built multispectral satellite-image dehazing with multilayer CNNs and fused outputs, which won 2nd place in the college round.'
  },
  {
    id: 'hackathons', title: 'Eval · hackathons', href: '#recognition',
    keys: 'hackathon hackathons results won win awards prizes competitions hashcode microsoft build sih hackrush placed rank',
    answer: 'Hackathon record: 1st in Google HashCode (regional, international rank 5,134), placed at the Microsoft Build AI Hackathon 2026 with Nexus, 2nd at Smart India Hackathon (college round) for satellite image dehazing, and 9th at HackRush, IIT Gandhinagar. He holds 17 hackathon and competition certificates in total.'
  },
  {
    id: 'cp', title: 'Eval · competitive programming', href: '#recognition',
    keys: 'competitive programming leetcode codechef geeksforgeeks gfg kickstart rating dsa algorithms data structures problems solved',
    answer: 'Competitive programming: LeetCode rating 1664 with 900+ problems solved, CodeChef 1810 (4★) with an international rank of 99 in a Long Challenge, GeeksforGeeks 1674 (rank #1) and Google Kickstart rank 2626.'
  },
  {
    id: 'exams', title: 'Eval · exams', href: '#recognition',
    keys: 'gate cat exam score percentile air all india rank',
    answer: 'He scored 468 in GATE 2022 (AIR 3933) and the 95.16 percentile in CAT 2022.'
  },
  {
    id: 'education', title: 'About · education', href: '#about',
    keys: 'education college university degree cgpa gpa grades gec rajkot iit gandhinagar externship graduated studied',
    answer: 'He holds a B.E. in Computer Engineering from Government Engineering College, Rajkot (2019–2023) with a CGPA of 9.26. He was also selected from 20,000+ applicants for the IIT Gandhinagar student externship (Jan–May 2022), doing research in ML for atmospheric systems under Prof. Nipun Batra.'
  },
  {
    id: 'skills-ai', title: 'Skills · agents & LLMs', href: '#skills',
    keys: 'skills stack tech tools llm agents langgraph langchain openai claude gemini llama hugging face groq langsmith ai frameworks',
    answer: 'His agent and LLM stack: LangGraph and LangChain for orchestration; OpenAI, Claude, Gemini, LLaMA, Groq and Hugging Face for models; LangSmith for tracing; and Whisper for speech. The attention map in the skills section shows which of these he leaned on in each project.'
  },
  {
    id: 'skills-backend', title: 'Skills · backend', href: '#skills',
    keys: 'backend python fastapi django node express nestjs celery asyncio rest graphql websockets api microservices system design databases postgres redis kafka',
    answer: 'On the backend he works mainly in Python with FastAPI and Django, plus Node.js, NestJS and Express. Around that: Celery and asyncio, REST, GraphQL and WebSockets, PostgreSQL, MongoDB, Redis and DuckDB, and Kafka or RabbitMQ for messaging.'
  },
  {
    id: 'skills-ml', title: 'Skills · ML & vision', href: '#skills',
    keys: 'machine learning ml deep learning pytorch tensorflow scikit learn xgboost shap opencv vision cv models gnn gcn gat gru time series spatiotemporal physics informed',
    answer: 'For ML he uses PyTorch, TensorFlow, scikit-learn and XGBoost, with SHAP for explainability. His research work adds graph neural networks (GCN, GAT), GRUs, spatiotemporal and time-series forecasting, and physics-informed neural networks. For vision he uses OpenCV, DeepFace and Google Vision.'
  },
  {
    id: 'skills-infra', title: 'Skills · infra', href: '#skills',
    keys: 'devops cloud aws docker nginx ci cd deployment opentelemetry prometheus grafana infrastructure observability',
    answer: 'For infrastructure: Docker, AWS (EC2, S3, Lambda), NGINX and load balancing, CI/CD, and observability with OpenTelemetry, Prometheus and Grafana.'
  },
  {
    id: 'languages', title: 'Skills · languages', href: '#skills',
    keys: 'programming languages python javascript typescript java c++ code language',
    answer: 'Python is his strongest language (0.95 on the page), followed by JavaScript (0.85) and TypeScript (0.80). Earlier projects also used C++ and Java.'
  },
  {
    id: 'open', title: 'About · availability', href: '#about',
    keys: 'open to roles hire hiring available availability looking job opportunities remote relocate freelance new role',
    answer: 'Yes, he is open to ML and AI engineering roles, remote or hybrid, and to open-source AI collaborations. His research interest is ML for weather, climate and atmospheric modelling. The quickest route is the contact form or email.'
  },
  {
    id: 'location', title: 'About · location', href: '#about',
    keys: 'location where based live city country timezone time zone rajkot gujarat india',
    answer: 'He is based in Rajkot, Gujarat, India (UTC+5:30) and is open to remote work.'
  },
  {
    id: 'contact', title: 'Output · contact', href: '#contact',
    keys: 'contact email reach message talk connect linkedin twitter x github get in touch',
    answer: 'Reach him at harshilkaneriya26202@gmail.com, on LinkedIn (harshil-kaneria), on GitHub (Harshil26202) or on X (@HarshilKaneria4). The contact form pre-writes the email for you.'
  },
  {
    id: 'resume', title: 'Résumé', href: '#contact',
    keys: 'resume résumé cv curriculum vitae download pdf',
    answer: 'His résumé is on Google Drive. Type /resume here, or use the Résumé link in the contact section.'
  },
  {
    id: 'leadership', title: 'Orchestrate · leadership', href: '#leadership',
    keys: 'leadership lead gdsc google developer student clubs codechef chapter inspire talks coo community organizer events managed',
    answer: 'He led the Google Developer Student Clubs chapter at GEC Rajkot (25+ events) and was Event Lead for the CodeChef chapter (9 events). He was also Chief Organizing Officer at Inspire Talks and a Google Cloud facilitator who guided 400+ students. In total he has managed 34 events.'
  },
  {
    id: 'community', title: 'Orchestrate · community', href: '#leadership',
    keys: 'speaker talks speaking sessions linkedin followers community newsletter lumos web3',
    answer: 'He has spoken at 11 sessions, has 5K+ followers on LinkedIn, designed 6 department newsletters, and was a Lumos Wizard in the Lumos Metaverse developer community.'
  },
  {
    id: 'principles', title: 'How he builds', href: '#principles',
    keys: 'principles philosophy approach how does he build evals evaluation guardrails hallucination safety human in the loop approval',
    answer: 'Three guardrails: evals before vibes (every system gets a baseline to beat), abstain when unsure (a confident wrong answer is worse than saying "I don\'t know"), and humans approve actions (anything with side effects sits behind an approval gate).'
  },
  {
    id: 'maruti', title: 'Experience · Maruti Techlabs', href: '#experience',
    keys: 'internship intern maruti techlabs ahmedabad domo tableau mssql fivetran dashboards',
    answer: 'In May–July 2022 he was a Data Engineering Intern at Maruti Techlabs in Ahmedabad, building automated DOMO and Tableau dashboards on FiveTran-backed MSSQL pipelines.'
  },
  {
    id: 'certs', title: 'Eval · certificates', href: '#recognition',
    keys: 'certificates certifications courses coursera udemy google cloud badges gcp learning',
    answer: 'He has 100+ certificates: 42 Udemy courses, 6 Coursera specialisations, 16 other courses, 4 internship certificates and 20+ Google Cloud skill badges. The full folder is linked in the recognition section.'
  },
  {
    id: 'exploring', title: 'About · exploring now', href: '#about',
    keys: 'currently exploring learning next interests mcp model context protocol memory graphrag future',
    answer: 'Right now he is exploring MCP and tool ecosystems, versioned agent memory, GraphRAG and eval-driven development.'
  },
  {
    id: 'site', title: 'This site', href: '#top',
    keys: 'this site website portfolio twin how does this work built made bm25 retrieval chatbot',
    answer: 'This twin is plain BM25 retrieval over hand-written chunks, running in your browser with no LLM call and no data sent anywhere. If the best match falls below a threshold it abstains instead of guessing, the same principle as Cascade. The robot and the cube are hand-built in three.js with no 3D model files.'
  }
];
