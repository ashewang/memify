# Memify Backend TODO

- [ ] **Persistence foundation**
  - [ ] Pick migration tooling (Goose, Atlas, etc.) and set up migrations folder.
  - [ ] Define database schema for `users`, `meme_generations`, `templates`, and related tables.
  - [ ] Introduce a data-access layer (e.g., sqlc or GORM) for CRUD operations.

- [ ] **Authentication & authorization**
  - [ ] Validate NextAuth-issued JWTs in Go (middleware).
  - [ ] Create or upsert user records on first authenticated request.
  - [ ] Enforce per-user access to meme history endpoints.

- [ ] **Meme generation workflow**
  - [ ] Replace AI stub with real OCR, retrieval, and captioning integrations.
  - [ ] Support asynchronous job processing (Redis/Asynq) for long-running tasks.
  - [ ] Emit detailed reasoning, safety signals, and scoring metadata.

- [ ] **Template & asset pipeline**
  - [ ] Build template catalog endpoints (`/api/templates`) backed by storage.
  - [ ] Implement meme image rendering and upload to object storage (S3-compatible).
  - [ ] Generate signed URLs for frontend consumption.

- [ ] **User history & analytics**
  - [ ] Persist meme generation events with timestamps and captions.
  - [ ] Add `/api/users/:id/memes` endpoint for profile page history.
  - [ ] Track usage metrics (counts, tags, template popularity).

- [ ] **Testing & observability**
  - [ ] Add unit/integration tests for handlers and AI client interactions.
  - [ ] Configure structured logging and request tracing.
  - [ ] Set up health/readiness checks for DB, Redis, and AI service dependencies.

