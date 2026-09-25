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

Local development runs entirely on `localhost` — plain Node.js, Python and
PostgreSQL processes. Docker is not required at any point.

### 1. Local prerequisites

Install and run PostgreSQL and RabbitMQ directly on the development machine.
Create a PostgreSQL database named `fixmyinfra` with user/password `fixmyinfra`,
and make RabbitMQ available on its default AMQP port.

The services expect:

```text
PostgreSQL: localhost:5432
RabbitMQ:   localhost:5672
```

On Windows, RabbitMQ has no native build — install
[Erlang/OTP](https://www.erlang.org/downloads) then
[RabbitMQ](https://www.rabbitmq.com/install-windows.html), or run the broker in
a WSL distro. Without a broker the application still starts: complaint-service
logs that the outbox is disabled and persists complaints without emitting
events, and picks them up once a broker is available.

Apply the SQL migrations in order as the database owner (the `fixmyinfra`
role has no `CREATE` privilege, so `psql -U postgres` or equivalent is required):

```bash
# auth-service: backend/services/auth-service/migrations/001-create-users.sql
# complaint-service: backend/services/complaint-service/migrations/001-*.sql … 009-*.sql
```

Migrations are idempotent and `RAISE NOTICE` anything they could not resolve on
their own (unroutable complaints, evidence URLs outside `/api/media`) instead of
guessing.

### 2. Install workspace dependencies

```bash
npm install
```

### 3. Configure secrets

Each service and the gateway needs its own `.env`. Copy the templates and
generate real values — the same value must be used for a given secret across the
gateway and every service:

```bash
cp backend/api-gateway/.env.example backend/api-gateway/.env
for s in backend/services/*/; do cp "$s/.env.example" "$s/.env"; done

node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"   # JWT_SECRET
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"   # INTERNAL_SERVICE_TOKEN
```

The gateway and every service refuse to start if `INTERNAL_SERVICE_TOKEN` is
missing, still a placeholder, or shorter than 32 characters. That secret is what
stops anyone reaching a service port directly and forging the `X-User-*` identity
headers — see [SECURITY.md](SECURITY.md).

### 4. Start the backend locally

```bash
npm run dev:gateway
npm run dev:complaint
```

Run each command in a separate terminal. The remaining backend services use the
same pattern:

```bash
cd backend/services/complaint-service
npm run dev
```

The gateway listens on `http://localhost:4000`. Start the services required by
the workflow you are developing; service ports are documented in each
`.env.example`. Services accept only traffic carrying the gateway's
`INTERNAL_SERVICE_TOKEN`, so the service ports are not an open door.

### 5. Start a frontend locally

From the repository root, run the portal you need:

```bash
npm run dev:citizen     # http://localhost:5173
npm run dev:department  # http://localhost:5174
npm run dev:admin       # http://localhost:5175
```

### 6. AI service, running locally

```bash
cd ai-service
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Production deployment (Nashik)

Container images are provided for deployment only. Local development does not
use them.

```bash
cp .env.example .env   # set JWT_SECRET, INTERNAL_SERVICE_TOKEN, POSTGRES_PASSWORD, CORS_ORIGIN
docker compose -f infra/docker-compose.prod.yml up -d --build
```

Full runbook (first admin account, upgrades, hardening checklist): [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
Security posture and accepted risks: [SECURITY.md](SECURITY.md).

## Next steps (Sprint 0)
1. Finalize the OpenAPI contract for every gateway route in `backend/api-gateway/src/config/routes.js`.
2. Generate `frontend/packages/types` from that OpenAPI spec.
3. Set up MSW or json-server mocks so frontend devs are never blocked on real endpoints.
4. Wire Sequelize models + migrations per service against the shared Postgres instance.
5. Implement the Transactional Outbox write path in `complaint-service` first — it's the pattern every other write-heavy service will copy.
6. Start with YOLOv8 issue detection and CLIP duplicate-check in `ai-service`; treat AI-image detection, EfficientNet, and the full XGBoost priority model as stretch goals.

See `docs/FixMyInfra_SAD.md` for full architecture rationale, database design, and workflow diagrams.
