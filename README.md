# FixMyInfra

Smart Infrastructure Issue Detection, Authenticity Verification and Intelligent Complaint Routing System — built for Nashik Municipal Corporation (capstone project, Group 8).

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind, 3 apps in a monorepo (citizen portal, department portal, admin dashboard)
- **Backend**: Node.js + Express microservices behind an API gateway
- **AI layer**: Python + FastAPI (YOLOv8, CLIP, Sentence-BERT, XGBoost)
- **Database**: PostgreSQL
- **Messaging**: RabbitMQ (Transactional Outbox pattern for reliable event publishing)

## Repo layout

```
frontend/apps/{citizen-portal,department-portal,admin-dashboard}   React apps
frontend/packages/{ui-kit,api-client,auth,types}                    shared code
backend/api-gateway                                                  JWT auth, routing, rate limiting
backend/services/{auth,complaint,routing,user-department,
                   notification,reporting,verification}-service      Express microservices
backend/shared-lib                                                    outbox pattern, RabbitMQ helper
ai-service                                                            FastAPI CV/NLP/ML layer
infra/docker-compose.yml                                              local dev environment
docs/FixMyInfra_SAD.md                                                architecture document
```

## Quick start

### 1. Infrastructure (Postgres + RabbitMQ + all services via Docker)

```bash
cd infra
docker compose up --build
```

RabbitMQ management UI: http://localhost:15672 (guest/guest)

### 2. Frontend (run locally against the Dockerized backend)

```bash
npm install         # installs all workspaces from repo root
npm run dev:citizen     # http://localhost:5173
npm run dev:department  # http://localhost:5174
npm run dev:admin       # http://localhost:5175
```

### 3. Backend service, running individually outside Docker (for active development)

```bash
cd backend/services/complaint-service
cp .env.example .env
npm install
npm run dev
```

### 4. AI service, running individually

```bash
cd ai-service
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Next steps (Sprint 0)

1. Finalize the OpenAPI contract for every gateway route in `backend/api-gateway/src/config/routes.js`.
2. Generate `frontend/packages/types` from that OpenAPI spec.
3. Set up MSW or json-server mocks so frontend devs are never blocked on real endpoints.
4. Wire Sequelize models + migrations per service against the shared Postgres instance.
5. Implement the Transactional Outbox write path in `complaint-service` first — it's the pattern every other write-heavy service will copy.
6. Start with YOLOv8 issue detection and CLIP duplicate-check in `ai-service`; treat AI-image detection, EfficientNet, and the full XGBoost priority model as stretch goals.

See `docs/FixMyInfra_SAD.md` for full architecture rationale, database design, and workflow diagrams.
