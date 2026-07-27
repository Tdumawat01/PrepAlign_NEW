# PrepAlign

Career platform for Tier 2 / Tier 3 Indian students breaking into AI and startup roles — without coding.

**Goals:** webinar registrations, WhatsApp community joins, Career GPS guidance, and curated startup job discovery.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React (CRA + CRACO), Tailwind, shadcn/ui, Framer Motion |
| Backend | FastAPI, Motor (MongoDB) |
| Auth | Emergent-managed Google OAuth (session cookies) |
| AI | OpenRouter (company insights + Career GPS roadmaps) |
| Jobs | SerpAPI Google Jobs |

## Project structure

```
backend/           FastAPI app, services, job providers
  config.py        Env / integration config (no secrets in code)
  server.py        API routes
  services/        AI insights, Career GPS
  providers/       SerpAPI Google Jobs
frontend/          React app
  src/pages/       Home, Webinar, Mentorship, Jobs, Career GPS, Admin, …
memory/PRD.md      Product requirements
```

## Prerequisites

- Python 3.9+
- Node.js 18+ (20 LTS recommended)
- MongoDB running locally (or a MongoDB Atlas URI)

## Setup

### 1. Backend

```bash
cd backend
python3 -m pip install -r requirements.txt
cp .env.example .env
# Edit .env — add keys (see below)
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
```

### 3. Environment variables

**`backend/.env`** (never commit this file):

| Variable | Purpose |
|----------|---------|
| `MONGO_URL` | MongoDB connection string |
| `DB_NAME` | Database name (e.g. `prepalign`) |
| `OPENROUTER_API_KEY` | AI insights + Career GPS roadmaps |
| `SERPAPI_KEY` | Job listings |
| `ADMIN_EMAILS` | Comma-separated emails for admin APIs / `/admin` |
| `CORS_ORIGINS` | e.g. `http://localhost:3000` |
| `OPENROUTER_ROADMAP_MODEL` | Optional model override |
| `OPENROUTER_INSIGHTS_MODEL` | Optional model override |

**`frontend/.env`:**

| Variable | Purpose |
|----------|---------|
| `REACT_APP_BACKEND_URL` | Backend base URL, no trailing slash (`http://localhost:8000`). Leave unset on Vercel so the waitlist uses the serverless `/api/waitlist/join` proxy. |

**Vercel (waitlist → Google Sheets):**

| Variable | Purpose |
|----------|---------|
| `GOOGLE_APPS_SCRIPT_WAITLIST_URL` | Apps Script web app URL from `scripts/google-apps-script/Waitlist.gs` (server-only; not `REACT_APP_*`) |

The waitlist serverless function lives at `frontend/api/waitlist/join.js` (and `api/` at repo root). After deploy, Vercel → Project → **Functions** should list `/api/waitlist/join`. If POSTs still return 405 + `index.html`, the function was not built — check Root Directory matches where `api/` was placed.

Templates: `backend/.env.example`, `frontend/.env.example`.

## Run locally

Terminal 1 — MongoDB (if not already running):

```bash
mongod --dbpath /path/to/data --port 27017
```

Terminal 2 — API:

```bash
cd backend
python3 -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload
```

- API: http://127.0.0.1:8000/api/
- Docs: http://127.0.0.1:8000/docs
- Integration flags: http://127.0.0.1:8000/api/integrations/status

Terminal 3 — UI:

```bash
cd frontend
npm start
```

- App: http://localhost:3000

## Main features / routes

| Path | Description |
|------|-------------|
| `/` | Landing |
| `/webinar` | Webinar registration |
| `/mentorship` | Mentorship request |
| `/jobs` | Startup / AI-adjacent job board |
| `/career-gps` | Role assessment |
| `/career-gps/roadmap` | 8-week plan: tasks, guides, videos, progress, heatmap |
| `/login` | Google sign-in (via Emergent) |
| `/dashboard` | Signed-in user area |
| `/admin` | Admin stats / leads (admin emails only) |

## API overview

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/api/` | Health message |
| `GET` | `/api/integrations/status` | Whether OpenRouter / SerpAPI / Mongo are configured (booleans only) |
| `POST` | `/api/auth/session` | Exchange Emergent `session_id` → cookie |
| `GET` | `/api/auth/me` | Current user |
| `POST` | `/api/auth/logout` | Clear session |
| `POST` | `/api/webinar/register` | Public lead capture |
| `POST` | `/api/mentorship/request` | Public lead capture |
| `GET` | `/api/jobs` | Cached jobs (refreshes via SerpAPI when stale) |
| `POST` | `/api/jobs/insights` | AI company insights for a job |
| `POST` | `/api/career-gps/assess` | Rule-based role matches |
| `POST` | `/api/career-gps/roadmap` | AI personalized 8-week roadmap |
| `GET` | `/api/admin/stats` | Admin only |

## Auth note

Sign-in uses **Emergent-hosted Google OAuth** (`auth.emergentagent.com`). After login, PrepAlign stores its own `session_token` cookie. Fine for closed student testing; plan first-party Google OAuth before a public brand launch.

## Tests

```bash
cd backend
pytest tests/ -v
```

## Security

- Secrets only in `.env` (gitignored). Ship empty placeholders in `.env.example`.
- Do not commit API keys, session tokens, or credentials.
- Public form endpoints should be rate-limited before wide public traffic.

## License

Private — all rights reserved.
