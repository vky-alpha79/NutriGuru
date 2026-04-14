# NutriGuru — Anti-Ageing Diet Recommendation Bot

AI-powered, enterprise-grade diet recommendation chatbot for the Indian market. Combines evidence-based nutrition science with anti-ageing longevity research to generate personalised, culturally authentic 3-meal-per-day diet plans.

## Architecture

- **Frontend**: React 18 + TypeScript, Tailwind CSS, Recharts, Framer Motion, Zustand, React Query
- **Backend**: FastAPI (Python 3.11+), SQLAlchemy, asyncpg
- **LLM Routing**: Nemotron Cascade 2 (primary) → Claude Sonnet 4 (fallback) → Gemma 4 (local fallback)
- **Security**: Lakera Guard v2 — all 9 integration patterns (holistic, input, RAG, agent, PII, progressive, monitor, audit, toggle)
- **PDF Generation**: WeasyPrint (server-side A4 reports)
- **Database**: PostgreSQL + Redis

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis

### Backend

```bash
cd nutriguru/backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/Mac
pip install -r requirements.txt
cp .env.example .env         # Edit with your keys
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd nutriguru/frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to the backend at `http://localhost:8000`.

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/onboard` | POST | User onboarding — profile + computed metrics |
| `/api/v1/chat` | POST | Chat with NutriGuru (Lakera-screened) |
| `/api/v1/plan/generate` | POST | Generate meal plan for a day |
| `/api/v1/plan/export` | POST | Export meal plan as PDF |
| `/api/v1/progress` | GET | Progress metrics for a challenge |
| `/api/v1/models/health` | GET | LLM model chain health status |
| `/api/v1/security/status` | GET | Lakera Guard status and stats |
| `/api/v1/security/logs` | GET | Paginated audit log |
| `/api/v1/security/mode` | PUT | Toggle Lakera enforcement mode (admin) |

## Environment Variables

See `backend/.env.example` for all required configuration.

## Lakera Guard Integration

All 9 use cases from the Lakera docs are implemented:

1. **Holistic Post-LLM** — Screens full conversation after LLM responds
2. **Pre-LLM Input** — Screens user input in parallel with LLM call
3. **RAG/Document** — Screens external documents at ingestion and runtime
4. **Agent/Tool** — Screens each step of agentic workflows
5. **PII Masking** — Detects and masks PII (Aadhaar, phone, email)
6. **Progressive Response** — 3-tier threat handling (block/warn/allow)
7. **Monitor Mode** — Shadow mode for policy calibration
8. **Audit Trail** — Full compliance logging with breakdown details
9. **Secure Toggle** — Operator UI to switch enforcement modes
