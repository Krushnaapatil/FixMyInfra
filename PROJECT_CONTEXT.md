# FixMyInfra Project Context

This document describes the repository as it exists in the source tree. It distinguishes implemented behavior from intended or scaffolded behavior. Items that cannot be established from the repository are marked **Unknown / Not found**.

## 1. Project Purpose

FixMyInfra is intended to be a municipal infrastructure complaint platform for Nashik Municipal Corporation. The stated product concept combines:

- Citizen issue reporting with a photo, location, and description.
- AI-assisted infrastructure issue classification.
- Authenticity verification of uploaded images.
- Duplicate complaint detection.
- Priority prediction.
- Complaint routing to departments and officers.
- Complaint status tracking and resolution evidence.
- Notifications and reporting dashboards.

The current repository is an initial scaffold. The frontend screens and Node service routes are mostly placeholders, while the gateway, basic authentication middleware, AI route shapes, and shared outbox/messaging utilities exist.

## 2. Complete Technology Stack

### Frontend

- React 18.3.1.
- TypeScript 5.5.4.
- Vite 5.4.0.
- React Router DOM 6.26.0.
- TanStack React Query 5.51.0.
- Axios 1.7.0.
- Tailwind CSS 3.4.9 with PostCSS and Autoprefixer.
- A local UI package, `@fixmyinfra/ui-kit`, containing `Button` and `Card`.
- Shared local packages for API access, auth, and types.

### Backend

- Node.js, ES modules, and Express 4.19.2.
- One API gateway using `http-proxy-middleware`.
- Seven Express service directories: auth, complaint, routing, user/department, notification, reporting, and verification.
- JSON Web Tokens through `jsonwebtoken` 9.0.2 at the gateway.
- CORS through `cors` and request limiting through `express-rate-limit`.
- PostgreSQL 16 as a local development dependency.
- Sequelize 6.37.3 and `pg` are declared by the services, but no service currently initializes Sequelize or defines business models.
- RabbitMQ 3.13 as a local development dependency.
- `amqplib` for the shared RabbitMQ publisher.
- `dotenv` for local environment loading.

### AI service

- Python 3.11 for local AI-service development.
- FastAPI 0.115.0 and Uvicorn 0.30.6.
- Pydantic 2.9.0 and `python-multipart` for request parsing.
- Pillow, NumPy, OpenCV headless.
- Declared intended ML dependencies: Ultralytics YOLOv8, OpenCLIP, Sentence Transformers, XGBoost, scikit-learn, MLflow, and PyTorch.
- The checked-in route handlers currently return placeholder values and do not load these models.

### Operations and tooling

- Local PostgreSQL and RabbitMQ installations.
- GitHub Actions CI in `.github/workflows/ci.yml`.
- Node workspace management from the root `package.json`.
- No test framework is configured for the frontend. Node services declare `node --test`, but no tests are present.

## 3. Architecture Overview

The intended runtime topology is:

```text
React/Vite portals (5173, 5174, 5175)
        |
        | /api proxy in Vite
        v
API gateway (4000)
        |
        +--> auth service (4001)
        +--> complaint service (4002)
        +--> routing service (4003)
        +--> user-department service (4004)
        +--> notification service (4005)
        +--> reporting service (4006)
        +--> verification service (4007) --> AI service (8000, intended)

PostgreSQL (5432) and RabbitMQ (5672 / management 15672)
```

The gateway proxies to local `localhost` service targets. Run the gateway and the backend services as separate local processes on their configured ports.

The architecture document is not a reliable implementation source: `docs/FixMyInfra_SAD.md` explicitly says it is a placeholder and still describes a Spring Boot / Java 21 backend even though this repository uses Node.js/Express.

## 4. Repository and Folder Structure

```text
.
├── package.json                         Root npm workspace and scripts
├── package-lock.json                    Present in the working tree
├── README.md                            Stack and quick-start notes
├── PROJECT_CONTEXT.md                   This document
├── .github/workflows/ci.yml             CI build/import checks
├── ai-service/                          FastAPI AI service
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       └── routes/{detect,duplicate,priority,verify}.py
├── backend/
│   ├── api-gateway/                     Express proxy and edge auth
│   ├── services/                        Express service scaffolds
│   │   ├── auth-service/
│   │   ├── complaint-service/
│   │   ├── notification-service/
│   │   ├── reporting-service/
│   │   ├── routing-service/
│   │   ├── user-department-service/
│   │   └── verification-service/
│   └── shared-lib/                      Outbox, RabbitMQ, AppError exports
├── frontend/
│   ├── apps/{citizen-portal,department-portal,admin-dashboard}
│   └── packages/{api-client,auth,types,ui-kit}
├── infra/                               Reserved for future infrastructure configuration
└── docs/FixMyInfra_SAD.md               Incomplete/partly stale architecture doc
```

Generated Python `__pycache__` files are present in the workspace inventory but are ignored by Git. Node modules and build outputs are ignored.

## 5. Important Files

- [package.json](package.json): root workspaces for all frontend apps/packages and Node backend packages; frontend dev, gateway dev, lint, and build scripts.
- [README.md](README.md): stated purpose, stack, quick start, and Sprint 0 notes.
- `infra/`: currently contains no active local runtime configuration.
- [backend/api-gateway/src/index.js](backend/api-gateway/src/index.js): Express gateway, CORS, rate limiting, route mounting, and health endpoint.
- [backend/api-gateway/src/config/routes.js](backend/api-gateway/src/config/routes.js): gateway path, upstream target, and allowed-role table.
- [backend/api-gateway/src/middleware/authenticate.js](backend/api-gateway/src/middleware/authenticate.js): bearer-token verification and role guard.
- `backend/services/*/src/index.js`: service Express bootstrap, JSON middleware, root route mount, and health endpoint.
- `backend/services/*/src/routes/index.js`: currently one scaffold root response per service.
- [backend/shared-lib/src/outbox/outboxModel.js](backend/shared-lib/src/outbox/outboxModel.js): Sequelize definition for `outbox_events`.
- [backend/shared-lib/src/messaging/rabbitmq.js](backend/shared-lib/src/messaging/rabbitmq.js): cached RabbitMQ channel and durable topic publishing.
- [backend/shared-lib/src/errors/AppError.js](backend/shared-lib/src/errors/AppError.js): custom error class with `statusCode`.
- [ai-service/app/main.py](ai-service/app/main.py): FastAPI app and AI router registration.
- `ai-service/app/routes/*.py`: AI request schemas and placeholder responses.
- `frontend/apps/*/src/App.tsx`: route maps for each portal.
- `frontend/apps/*/src/pages/*.tsx`: currently presentational placeholder pages describing future API calls.
- [frontend/packages/api-client/src/index.ts](frontend/packages/api-client/src/index.ts): Axios client with `/api` base URL and local-storage bearer injection.
- [frontend/packages/auth/src/index.ts](frontend/packages/auth/src/index.ts): login/logout helpers, role type, and incomplete `hasRole`.
- [frontend/packages/types/src/index.ts](frontend/packages/types/src/index.ts): manually declared `Complaint` type.
- `frontend/packages/ui-kit/src/*`: minimal shared `Button` and `Card` components.
- [.github/workflows/ci.yml](.github/workflows/ci.yml): Node build and Python import CI jobs.
- [docs/FixMyInfra_SAD.md](docs/FixMyInfra_SAD.md): explicitly incomplete and stale architecture notes.

## 6. Frontend Architecture

There are three independent Vite React applications:

### Citizen portal, port 5173

Routes in `frontend/apps/citizen-portal/src/App.tsx`:

- `/`: `ReportIssuePage`, currently explanatory text for a future `POST /api/complaints` flow.
- `/complaints`: `TrackComplaintsPage`, currently explanatory text for a future `GET /api/complaints/mine` flow.
- `/login`: `LoginPage`, currently explanatory text for a future `POST /api/auth/login` flow.

### Department portal, port 5174

- `/`: `AssignedQueuePage`, future `GET /api/complaints/assigned`, requiring an `OFFICER` token claim.
- `/complaints/:id`: `ComplaintDetailPage`, future complaint detail and status update flow.
- `/login`: officer login placeholder.

### Admin dashboard, port 5175

- `/`: `OverviewPage`, future reporting summary.
- `/users`: `UserManagementPage`, future user CRUD.
- `/departments`: `DepartmentManagementPage`, future department CRUD.
- `/login`: admin login placeholder.

Each app wraps its routes with `React.StrictMode`, `BrowserRouter`, and a standalone TanStack `QueryClientProvider`. No queries are currently defined. The Vite proxy maps `/api` to `http://localhost:4000`.

All three apps share the same TypeScript strictness settings, Tailwind/PostCSS setup, and basic CSS entrypoint. The UI kit is available as a workspace dependency but is not currently used by the page components.

## 7. Backend Architecture

### API gateway

The gateway listens on port 4000. It applies global CORS and a rate limit of 300 requests per 60 seconds, then mounts a proxy for each configured path. Public auth traffic skips authentication. All other configured paths require a valid JWT and one of the route's allowed roles before proxying.

### Node services

Each service follows the same current bootstrap pattern:

1. Load dotenv.
2. Create an Express app.
3. Enable `express.json()`.
4. Mount its route module at `/`.
5. Expose `/health`.
6. Listen on its configured/default port.

Current route modules only implement `GET /`, returning `{ service, status: "scaffold - implement endpoints here" }`. There are no controllers, DTOs, models, repositories, or service-layer implementations in the checked-in tree despite the intended folder layout described in the initial workspace structure.

Service responsibilities stated in comments/startup messages:

- Auth: registration, login, JWT issuance.
- Complaint: complaint CRUD and status lifecycle.
- Routing: category-to-department assignment.
- User-department: user, department, and category management.
- Notification: real-time push plus email/SMS fallback.
- Reporting: dashboard analytics, hotspots, and resolution statistics.
- Verification: calls the AI service for authenticity and duplicate detection.

Only the responsibility labels exist; the corresponding business implementations are **Unknown / Not found**.

## 8. Database Structure and Relationships

PostgreSQL 16 is expected as a local database with the development connection values documented in `README.md`, and services declare PostgreSQL/Sequelize dependencies. No migrations, seed scripts, Sequelize initialization, business models, repositories, or schema SQL files were found.

The only concrete schema is the shared outbox model:

Table `outbox_events`:

- `id`: UUID primary key, generated by Sequelize.
- `aggregateType`: required string.
- `aggregateId`: required string.
- `eventType`: required string.
- `payload`: required JSONB.
- `published`: boolean defaulting to false.
- `createdAt`: date defaulting to current time.
- Sequelize timestamps are disabled.

No foreign keys or relationships are defined. Complaint, user, department, notification, report, verification, and routing tables are **Unknown / Not found**. The `Complaint` TypeScript interface indicates intended fields, but it is not a database schema.

## 9. API Endpoints and Request/Response Flow

### Implemented HTTP endpoints

Every Node service implements:

- `GET /health` directly on the service, returning `{ "status": "ok", "service": "..." }`.
- `GET /` in the service route module, returning a scaffold status object.

The gateway implements:

- `GET /health`, returning `{ "status": "ok", "service": "api-gateway" }`.
- Proxy paths listed below. The upstream services currently do not implement the intended domain endpoints.

The AI service implements:

- `GET /health`.
- `POST /detect/` with multipart field `image`; returns filename, `detected_category: "TODO"`, and confidence `0.0`.
- `POST /verify/` with multipart field `image`; returns filename, `authenticity_score: 0.0`, and an empty flags array.
- `POST /duplicate-check/` with multipart field `image`; the declared `DuplicateCheckRequest` additionally describes `description`, `latitude`, and `longitude`, but the handler only accepts the image parameter. It returns a false duplicate result with no match and score `0.0`.
- `POST /priority/` with JSON fields `category`, `severity_signal`, `affected_users_estimate`, and `public_safety_impact`; returns priority `MEDIUM` and score `0.5`.

### Gateway route table

| Gateway prefix | Upstream | Gateway access roles |
|---|---|---|
| `/api/auth` | port 4001 | Public |
| `/api/complaints` | port 4002 | `CITIZEN`, `OFFICER`, `ADMIN` |
| `/api/routing` | port 4003 | `ADMIN` |
| `/api/users` | port 4004 | `ADMIN` |
| `/api/departments` | port 4004 | `ADMIN` |
| `/api/notifications` | port 4005 | `CITIZEN`, `OFFICER`, `ADMIN` |
| `/api/reports` | port 4006 | `ADMIN` |
| `/api/verification` | port 4007 | `ADMIN`, `OFFICER` |

### Intended frontend request flow

The intended flow is browser -> Vite `/api` proxy -> gateway -> role-checked service -> persistence or AI/messaging integration. The actual domain request/response contracts are **Unknown / Not found**. There is no OpenAPI file; the types package explicitly says it should be generated from a future `backend/api-gateway/openapi.yaml`.

## 10. Authentication and Authorization Flow

The gateway expects `Authorization: Bearer <token>` for non-public routes. It verifies the token with `jsonwebtoken` using `process.env.JWT_SECRET`, falling back to `dev-secret-change-me`. On success, decoded claims are assigned to `req.user`.

The middleware comments identify expected claims as `sub`, `role`, and optional `departmentId`. `requireRole` checks whether `req.user.role` is one of the route's configured roles. Missing/invalid tokens return HTTP 401; a valid token with a disallowed role returns HTTP 403.

The frontend auth package posts email/password to `/auth/login`, stores `data.token` in `localStorage` under `fixmyinfra_token`, and removes it on logout. The Axios request interceptor adds the stored token to every request. `hasRole` is not implemented and currently always returns `true`; there are no route guards.

Auth registration, login, password handling, token issuance, refresh, token expiry policy, password hashing, user persistence, and service-level authorization are **Unknown / Not found**.

## 11. Important Data Flows

### Complaint submission, intended

The citizen UI is intended to collect an image, location, and optional description and send them to the complaint API. The intended downstream concepts are detection, authenticity verification, duplicate checking, priority calculation, routing, persistence, and notifications. No executable implementation connects these steps.

### Complaint status and officer resolution, intended

The department UI references an assigned complaint queue, complaint detail lookup, status updates, and resolution evidence upload. No endpoint, persistence, upload handler, or status transition implementation exists.

### AI analysis, current

FastAPI validates the priority JSON shape and accepts multipart image uploads, but all AI results are fixed placeholders. Verification-service does not currently call the AI service.

### Domain events, intended utility

The shared library defines an outbox record shape and a RabbitMQ topic publisher. The documented naming convention is `fixmyinfra.<aggregateType>.<eventType>`. No service writes outbox records, runs a poller/CDC process, consumes messages, or declares queues.

### Notifications and reporting, intended

The service comments mention WebSocket/STOMP, email/SMS fallback, analytics, hotspots, and resolution statistics. No implementation or provider configuration is present.

## 12. External Services and Integrations

- PostgreSQL: local database, port 5432.
- RabbitMQ AMQP broker: local service, port 5672.
- RabbitMQ management UI: available only if enabled by the local RabbitMQ installation.
- AI service: internal HTTP service on port 8000, intended to be called by verification-service.
- No cloud provider, object storage, email provider, SMS provider, map/geocoding provider, WebSocket broker, or external identity provider is configured.
- MLflow is declared as an AI dependency, but no tracking configuration or usage is present.

## 13. Environment Variables Required

Names only, as requested:

- `PORT`
- `DATABASE_URL`
- `RABBITMQ_URL`
- `JWT_SECRET`
- `AI_SERVICE_URL`

Environment values are supplied through local `.env` files or the shell. AI-specific model/provider environment variables are **Unknown / Not found**.

## 14. Business Logic and Important Rules

Concrete rules visible in code or comments:

- Roles are `CITIZEN`, `OFFICER`, and `ADMIN` in the frontend auth type and gateway route table.
- Gateway access is role-based per service prefix.
- Gateway rate limiting is 300 requests per 60-second window.
- The intended complaint statuses are `SUBMITTED`, `VERIFIED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, and `CLOSED`.
- The intended complaint record includes category, optional description, image URL, latitude, longitude, optional authenticity score, optional department ID, and creation time.
- The shared outbox is intended to be written in the same transaction as a business write.
- The comments reference a single-department-assignment rule, but enforcement beyond the gateway role check is not implemented.
- AI routes currently return fixed placeholder results and therefore do not enforce real classification, authenticity, duplicate, or priority rules.

## 15. State Management

- Each frontend app creates one TanStack Query client, but no query or mutation hooks currently exist.
- There is no Redux, Zustand, Context-based domain store, or other global state library.
- The only persisted client state is the JWT string in `localStorage` under `fixmyinfra_token`.
- React Router owns URL/navigation state.
- Backend state is intended to live in PostgreSQL and RabbitMQ, but business persistence is not implemented.

## 16. Error Handling

- Gateway authentication returns JSON 401 errors for missing or invalid/expired bearer tokens.
- Gateway role checks return a JSON 403 error.
- `AppError` exists with a `statusCode`, but no Express error middleware uses it.
- There is no visible service-level validation, centralized error handler, logging strategy, retry policy, or frontend error boundary.
- FastAPI/Pydantic supplies framework-level validation for the priority request model; image routes rely on multipart parsing.
- Proxy, database, broker, upload, and AI failure behavior is **Unknown / Not found**.

## 17. Build, Run, and Test Commands

From the repository root:

```bash
npm install
npm run dev:citizen       # Vite on 5173
npm run dev:department    # Vite on 5174
npm run dev:admin         # Vite on 5175
npm run dev:gateway       # Gateway on 4000
npm run build             # Build all workspaces that expose build scripts
npm run lint              # Run workspace lint scripts when present
```

Local backend dependencies:

```bash
# Install PostgreSQL and RabbitMQ locally, then start the required services
npm run dev:gateway
npm run dev:complaint
```

Individual Node services expose `npm run dev`, `npm start`, and a declared `npm test` using Node's built-in test runner. No tests are present in the repository.

AI service locally:

```bash
cd ai-service
python -m venv venv
# activate the venv using the shell's platform-specific command
pip install -r requirements.txt
uvicorn app.main:app --reload
```

CI runs root `npm install`, `npm run build --if-present`, installs AI requirements, and imports `app.main`. It does not run application tests or perform endpoint smoke tests.

## 18. Deployment Architecture

No deployment architecture is currently defined. No Kubernetes manifests, Terraform/Bicep, cloud deployment configuration, ingress, TLS, secrets manager, CI deployment job, or production observability configuration was found.

## 19. Known Limitations and Issues

- The project is an initial scaffold; domain endpoints are not implemented.
- All frontend pages are placeholders and do not make API calls.
- `hasRole` always returns `true`.
- Auth service has no registration/login implementation despite the public `/api/auth` gateway route.
- No business database schema, migrations, seeds, or database initialization exists.
- The shared outbox publisher is not integrated into any service, and there are no consumers/pollers.
- AI models are not loaded; AI results are placeholders.
- `DuplicateCheckRequest` is declared but not used by the duplicate handler.
- `OutboxEvent` is exported as `null` in addition to the model factory, so consumers must use the factory correctly.
- No upload storage or image URL generation exists.
- No tests are present; CI coverage is limited to builds and a Python import.
- The architecture document is incomplete and has stale Java/Spring Boot content.
- Local PostgreSQL and RabbitMQ must be installed and running before dependent services start.
- No production security posture is established: default development secrets are visible in configuration, CORS is unrestricted, and no TLS/secret management is configured.
- The current working tree has a user modification to `frontend/apps/admin-dashboard/src/main.tsx` and an untracked root `package-lock.json`; those changes were not altered while creating this document.

## 20. Important Dependencies

The highest-impact dependency groups are:

- React/Vite/TypeScript/Tailwind for all portals.
- React Router and TanStack Query for frontend navigation/data access.
- Axios for browser API calls.
- Express and `http-proxy-middleware` for HTTP services and gateway routing.
- `jsonwebtoken` for gateway JWT verification.
- `express-rate-limit` and `cors` for gateway edge behavior.
- `pg` and Sequelize for the planned PostgreSQL persistence layer.
- `amqplib` for RabbitMQ integration.
- FastAPI/Uvicorn/Pydantic for AI HTTP endpoints.
- Torch, Ultralytics, OpenCLIP, Sentence Transformers, XGBoost, scikit-learn, and OpenCV for planned AI capabilities.

Workspace packages use `*` versions for local package dependencies, so root workspace linking is required.

## 21. Coding Conventions

- JavaScript backend files use ES module `import`/`export` syntax and semicolons.
- Frontend files use React function components, TypeScript, and JSX.
- Frontend compiler settings are strict and disallow unused locals/parameters.
- Frontend styling uses Tailwind utility classes; global CSS contains Tailwind directives.
- Service entrypoints use `dotenv/config`, Express JSON middleware, a default port fallback, and a `/health` route.
- Gateway routes are data-driven through `serviceRoutes` rather than individually duplicated proxy setup.
- Python follows a small FastAPI router-per-capability structure.
- Comments identify intended requirements and future work, but comments are not evidence that the behavior exists.
- No formatter, linter configuration file, API contract, migration convention, or test naming convention was found.

## 22. Areas Risky to Modify

- [backend/api-gateway/src/config/routes.js](backend/api-gateway/src/config/routes.js): changes affect every API path, upstream target, and role boundary.
- [backend/api-gateway/src/middleware/authenticate.js](backend/api-gateway/src/middleware/authenticate.js): changes affect all protected traffic and JWT compatibility.
- [frontend/packages/api-client/src/index.ts](frontend/packages/api-client/src/index.ts): changes affect token propagation and every frontend API call.
- [frontend/packages/auth/src/index.ts](frontend/packages/auth/src/index.ts): changes affect login persistence and future authorization checks.
- [backend/shared-lib/src/outbox/outboxModel.js](backend/shared-lib/src/outbox/outboxModel.js): schema changes can break event durability and cross-service contracts.
- [backend/shared-lib/src/messaging/rabbitmq.js](backend/shared-lib/src/messaging/rabbitmq.js): connection/channel and routing changes affect asynchronous integration.
- Local database and broker connection settings: changes affect every service that depends on persistence or messaging.
- `frontend/packages/types/src/index.ts`: the manually shared complaint contract is a dependency across all portals.
- All service route prefixes: the gateway assumes the prefix and upstream route shape remain compatible.
- AI request/response shapes: verification, complaint processing, and future model clients will depend on them.
- Any future status transition or role rule: these are cross-portal business contracts and should be captured in tests and an API/schema contract first.

## 23. How to Understand This Project

1. Read this document and [README.md](README.md) to establish the intended product and current scaffold status.
2. Read `README.md` and each service's `.env.example` to understand local ports and dependency wiring.
3. Read the gateway route table and auth middleware before touching any API path or role behavior.
4. Read the relevant portal's `App.tsx`, then its pages, then the shared `api-client`, `auth`, and `types` packages.
5. Treat service startup files and route modules as the current backend implementation boundary; confirm whether a requested feature exists before designing around the comments.
6. Use the AI route files to identify current request shapes, but assume returned model values are placeholders until model loading and service integration are added.
7. Do not use the SAD as an implementation authority until its stale Java/Spring content is reconciled with this Node/Express repository.
8. Before implementing a cross-service feature, define the API contract, database/migration strategy, auth rule, event contract if needed, and focused tests. None of those contracts are currently complete.
9. Validate the smallest affected slice first, then run the relevant workspace build or CI-equivalent command. There is currently no comprehensive test suite to provide behavioral coverage.