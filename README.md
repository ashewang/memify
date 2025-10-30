# Memify

Multi-service platform for turning any conversation, screenshot, or idea into an AI-assisted meme. The project currently consists of:

- **web** – Next.js 14 frontend with Tailwind CSS and NextAuth (Google OAuth)
- **server** – Go (Gin) API gateway orchestrating meme generation workflows
- **services/ai** – Python FastAPI stub that returns deterministic meme suggestions
- **docker-compose.yml** – Local development stack with Postgres and Redis foundations

## Prerequisites

- Node.js 20+
- Go 1.22+
- Python 3.11 (optional when running the AI service outside Docker)
- Docker Desktop (recommended for running the entire stack)

## Environment variables

Copy each template before running locally:

```bash
cp web/.env.example web/.env.local
cp server/.env.example server/.env
cp services/ai/.env.example services/ai/.env
```

Populate the following values:

- `NEXTAUTH_SECRET` – random 32+ character string (`openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` – OAuth credentials from Google Cloud Console
- `API_BASE_URL` – typically `http://localhost:8080`
- `DATABASE_URL` – connection string for Postgres (docker-compose uses `postgres://memify:memify@postgres:5432/memify?sslmode=disable`)
- `OPENAI_API_KEY` – optional placeholder for future caption synthesis

## Running locally

### Full stack (recommended)

```bash
docker-compose up --build
```

- Frontend – http://localhost:3000
- Go API – http://localhost:8080
- AI service – http://localhost:8000
- Postgres – localhost:5432 (user/password `memify`)
- Redis – localhost:6379

### Individual services

```bash
# Frontend
cd web
npm install
npm run dev

# Go API (requires Go installed locally)
cd server
go mod tidy   # generates go.sum
go run ./cmd/api

# AI service
cd services/ai
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Code structure highlights

- `web/src/app/workspace` – authenticated meme generation workspace hitting `/api/memes/generate`
- `server/internal/httpserver` – Gin router, middleware, handlers
- `server/internal/ai` – HTTP client for the Python AI service
- `services/ai/app` – FastAPI endpoints and Pydantic schemas mirroring the Go contracts

## Roadmap

1. Persist user sessions, context snippets, and meme generations using Postgres + migrations (e.g., Atlas, Goose, or Prisma schema driving sqlc).
2. Implement screenshot OCR and humor classification inside the AI service; connect to a template embedding store (pgvector or Redis vector).
3. Render meme images through a dedicated rendering worker (Go image libraries or Node canvas) and store assets in S3-compatible storage.
4. Expand frontend workspace with template chooser, caption editor, and history dashboard.
5. Add background queue processing via Redis (Asynq) for heavier pipelines and notifications.

