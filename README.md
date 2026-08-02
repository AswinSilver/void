# VOID — Phishing Investigation Platform

> A comprehensive, AI-powered platform for SOC analysts and organizations to investigate phishing emails, URLs, QR codes, SMS messages, and domains.

## ✨ Features

- **URL Scanner** — Redirect chains, SSL analysis, WHOIS, DNS, ASN, blacklists, AI verdict
- **Email Scanner** — SPF/DKIM/DMARC, header viewer (Monaco), attachment analysis
- **QR Scanner** — Extract URLs, text, Wi-Fi, payment links; AI explanation
- **SMS Scanner** — AI-powered urgency detection, brand impersonation checks
- **Domain Scanner** — Full DNS, WHOIS, reputation, risk indicators
- **Brand Impersonation Detection** — Logo similarity, color palette, domain spelling
- **Threat Intelligence** — VirusTotal, AbuseIPDB, URLhaus, AlienVault OTX, OpenPhish
- **AI Chat** — Conversational analysis powered by OpenAI/Gemini/Groq via LangChain
- **AI Report Generator** — Executive + technical reports, IOCs, MITRE ATT&CK mapping
- **Scan History** — Filterable, bookmarkable history of all scans
- **Organizations** — Team management, RBAC, shared reports
- **Admin Panel** — User management, threat feeds, API usage, logs

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript, Vite, Tailwind CSS, Shadcn UI, Framer Motion |
| Charts | Recharts, React Flow, Leaflet |
| Backend | FastAPI, Python 3.12, Uvicorn |
| Database | PostgreSQL 16 |
| Queue | Celery + Redis |
| Storage | MinIO (S3-compatible) |
| AI | LangChain + OpenAI / Gemini / Groq |
| Screenshots | Playwright |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- Docker + Docker Compose

### 1. Clone & configure environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 2. Start infrastructure
```bash
docker compose up -d
```

### 3. Start backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### 4. Start Celery worker
```bash
cd backend
celery -A app.worker.celery_app worker --loglevel=info
```

### 5. Start frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173  
Backend API docs at http://localhost:8000/docs  
MinIO console at http://localhost:9001  

## 📁 Project Structure

```
void/
├── docker-compose.yml
├── .env.example
├── frontend/          # React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── api/
│   │   └── types/
└── backend/           # FastAPI
    ├── app/
    │   ├── api/
    │   ├── core/
    │   ├── models/
    │   ├── schemas/
    │   ├── services/
    │   ├── workers/
    │   └── main.py
    ├── alembic/
    └── requirements.txt
```
