# VOID — Advanced Phishing Investigation Platform

VOID is a comprehensive, AI-powered investigation platform built to help Security Operations Center (SOC) analysts and security teams quickly triage, analyze, and mitigate digital threats. 

---

## ✨ Features

**🔍 Deep URL Analysis**
Perform comprehensive URL scanning including automated redirect chain tracing, SSL/TLS certificate analysis, WHOIS lookups, reverse DNS, ASN mapping, and querying against leading blacklists. Powered by an AI verdict engine to definitively categorize malicious infrastructure.

**📧 Email Header & Body Investigation**
Paste raw EML files or email headers for automated SPF, DKIM, and DMARC authentication checks. Features a rich Monaco-based code editor for deep inspection of raw headers, alongside embedded link extraction and attachment risk analysis.

**📱 QR Code & SMS Smishing Detection**
Detect threats that bypass traditional filters. Upload QR codes to extract hidden payload URLs, Wi-Fi credentials, or payment links. Analyze SMS messages with AI-powered urgency detection and brand impersonation checks.

**🌐 Domain Threat Intelligence**
Perform total domain reconnaissance. View full DNS records, historical WHOIS data, and dynamic reputation scoring to spot typosquatting domains or recently registered malicious infrastructure.

**🧠 Contextual AI Chat & Analysis**
A fully integrated, conversational AI assistant powered by OpenAI, Gemini, or Groq via LangChain. Ask complex questions about scan results, understand obscure indicators of compromise (IOCs), or ask for mitigation strategies directly within the platform.

**🛡️ Aggregated Threat Intelligence**
Consolidates intelligence from industry-leading sources including VirusTotal, AbuseIPDB, URLhaus, AlienVault OTX, and OpenPhish into a single, unified risk score.

**📊 Automated Incident Reporting**
Automatically generate detailed executive summaries and technical incident reports mapped to the MITRE ATT&CK framework, ready to be exported and shared.

**🏢 Enterprise Ready**
Built for teams with full Scan History tracking, Organization management, Role-Based Access Control (RBAC), and a dedicated Admin Panel for managing threat feeds, API usage, and system logs.

---

## 🛠 Tech Stack

VOID is built using a modern, scalable, and highly performant architecture.

### Frontend
- **Framework:** React 18 with TypeScript and Vite for ultra-fast HMR and optimized builds.
- **Styling:** Tailwind CSS combined with Shadcn UI for a sleek, responsive, and accessible dark-mode-first interface.
- **Animations:** Framer Motion for buttery-smooth micro-interactions and transitions.
- **Visualizations:** Recharts for data visualization, React Flow for node-based threat mapping, and Leaflet for geospatial IP tracking.

### Backend
- **Framework:** FastAPI (Python 3.12) running on Uvicorn for asynchronous, high-throughput API endpoints.
- **Database:** PostgreSQL 16 managed via SQLAlchemy and Alembic migrations.
- **Background Processing:** Celery task queue backed by Redis to handle long-running, asynchronous threat scans without blocking the API.
- **Object Storage:** MinIO (S3-compatible) for securely storing user uploads like screenshots, EML files, and generated reports.

### AI & Automation
- **AI Orchestration:** LangChain for complex retrieval-augmented generation (RAG) and conversational context management.
- **Headless Browsing:** Playwright for capturing safe, sandboxed screenshots of potentially malicious URLs.
