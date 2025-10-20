# Memify AI Service

FastAPI application that orchestrates OCR, humor classification, template retrieval, and caption synthesis for the Memify platform. The current implementation is a stub that returns deterministic fixture data so the Go API and Next.js frontend can integrate before the ML pipeline is complete.

## Local development

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Environment variables can be supplied via `.env` (see `.env.example`). The service exposes:

- `GET /healthz` – readiness probe for orchestration
- `POST /v1/analyze` – accepts context payloads and returns a placeholder meme suggestion response

## Next steps

- Integrate screenshot OCR (PaddleOCR or Tesseract) and text normalization
- Add humor taxonomy classifier with persisted tag embeddings
- Connect to vector store / template metadata catalog for retrieval
- Invoke caption LLM (OpenAI, local model, etc.) and surface safety/GRC signals
- Return detailed scoring metadata for UI experimentation

