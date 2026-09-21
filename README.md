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
PostgreSQL + RabbitMQ                                                   local development prerequisites
docs/FixMyInfra_SAD.md                                                architecture document
```

## Quick start

### 1. Local prerequisites

Install and run PostgreSQL and RabbitMQ directly on the development machine.
Create a PostgreSQL database named `fixmyinfra` with user/password `fixmyinfra`,
and make RabbitMQ available on its default AMQP port.

The services expect:

```text
PostgreSQL: localhost:5432
RabbitMQ:   localhost:5672
```

Development runs as ordinary local Node.js and Python processes.

Alternatively, start the dependencies with Docker instead of installing them directly:

```bash
docker compose -f infra/docker-compose.yml up -d
```

Apply the SQL migrations in order as the database owner (the `fixmyinfra`
role has no `CREATE` privilege, so `psql -U postgres` or equivalent is required):

```bash
# auth-service: backend/services/auth-service/migrations/001-create-users.sql
# complaint-service: backend/services/complaint-service/migrations/001-*.sql … 005-*.sql
```

### 2. Install workspace dependencies

```bash
npm install
```

### 3. Start the backend locally

```bash
npm run dev:gateway
npm run dev:complaint
```

Run each command in a separate terminal. The remaining backend services use the
same pattern:

```bash
cd backend/services/complaint-service
cp .env.example .env
npm run dev
```

The gateway listens on `http://localhost:4000`. Start the services required by
the workflow you are developing; service ports are documented in each `.env.example`.

### 4. Start a frontend locally

From the repository root, run the portal you need:

```bash
npm run dev:citizen     # http://localhost:5173
npm run dev:department  # http://localhost:5174
npm run dev:admin       # http://localhost:5175
```

### 5. AI service, running locally

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
