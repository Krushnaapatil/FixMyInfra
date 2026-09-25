# Production deployment (Nashik)

Single-host Docker Compose deployment: Postgres + RabbitMQ, FastAPI AI
service, auth + complaint services, API gateway, and the three portals
behind nginx (which proxies same-origin `/api` to the gateway).

## 1. Prerequisites

- Docker Engine 24+ with the Compose v2 plugin.
- A host with ports 4000, 5173–5175, 5432, 5672 free (all overridable in `.env`).
- No checked-in secrets: you supply `JWT_SECRET` and `POSTGRES_PASSWORD`.

## 2. Configure

```bash
cp .env.example .env
# Edit .env: set JWT_SECRET (long random string) and POSTGRES_PASSWORD.
# Set CORS_ORIGIN to the public portal origins, comma-separated.
```

## 3. Launch

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build
```

What happens on first boot:

1. `postgres` initializes from the checked-in SQL migrations
   (`auth 001`, `complaint 001–006`), creating the `users`, `complaints`
   and `outbox_events` tables. These run once per fresh volume only.
2. `auth-service` and `complaint-service` connect via `DATABASE_URL`.
3. `api-gateway` enforces JWT auth and proxies to the services by their
   Compose DNS names (`http://auth-service:4001`, …).
4. The portals serve static bundles; browser `/api` calls hit their own
   nginx, which proxies to the gateway.

Check health:

```bash
curl localhost:4000/health
docker compose -f infra/docker-compose.prod.yml ps
```

## 4. First admin account

Self-registration only creates `CITIZEN`/`OFFICER` users. Create the first
admin inside the database:

```bash
# Generate a bcrypt hash (auth-service image has bcrypt):
HASH=$(docker compose -f infra/docker-compose.prod.yml run --rm auth-service \
  node -e "import('bcrypt').then(async ({default:b}) => console.log(await b.hash('Admin@123456', 10)))")

docker compose -f infra/docker-compose.prod.yml exec postgres psql \
  -U fixmyinfra -d fixmyinfra -c \
  "INSERT INTO users (email, password_hash, role, name)
   VALUES ('admin@nmc.gov.in', '$HASH', 'ADMIN', 'Administrator');"
```

Then log in at `http://<host>:5175/login`.

## 5. Upgrades and data

- Application upgrades are stateless: `up -d --build` again. Migration
  SQL in `docker-entrypoint-initdb.d` runs only on volume creation; for
  schema changes on a live volume, apply new migration files with `psql`
  in release order (see README quick start).
- Postgres data lives in the `fixmyinfra-pgdata` volume. Back it up with
  `pg_dump` before upgrades.
- The routing, user-department, notification, reporting and verification
  services are scaffolds and are intentionally absent from this Compose
  file. Add them (Dockerfile args + gateway `*_URL` + service block)
  once their endpoints are implemented.

## 6. Production hardening checklist

- [ ] `JWT_SECRET` ≥ 32 random chars, unique per environment.
- [ ] `CORS_ORIGIN` restricted to the real portal origins (never `*`).
- [ ] Postgres/RabbitMQ ports firewalled from the public internet.
- [ ] TLS termination (reverse proxy or load balancer) in front of 5173–5175/4000.
- [ ] Off-host `pg_dump` backups on a schedule; test restores.
- [ ] Container log shipping and `docker compose ps` health monitoring.
