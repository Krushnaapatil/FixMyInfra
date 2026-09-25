# Security review

Audit of the local FixMyInfra stack, with the findings that were exploited
against the running application and the fixes applied. Everything here was
verified by probing the live services, not by reading code alone.

## Trust model

```
browser ──▶ Vite dev server (:5173/74/75) ──▶ API gateway (:4000)
                                                   │  verifies JWT, enforces RBAC
                                                   │  stamps X-Internal-Token
                                                   ▼
                                          microservices (:4001–:4007)
                                                   │  authorise from X-User-*
                                                   ▼
                                    PostgreSQL 18  ·  RabbitMQ
```

The gateway is the only component that authenticates callers. Services make
authorization decisions from the `X-User-Id` / `X-User-Role` /
`X-User-Department-Id` headers it injects after validating the JWT. That makes
the gateway→service hop the most security-critical boundary in the system.

## Fixed

### 1. CRITICAL — gateway→service authentication bypass

Services trusted the `X-User-*` headers unconditionally, and nothing stopped a
caller from reaching a service port directly and setting those headers by hand.
Authentication and the gateway's RBAC were both bypassable.

Confirmed before the fix — no token, no gateway, just a forged header:

```bash
curl http://localhost:4001/users -H "X-User-Role: ADMIN"
# → 200, full user list: every email, name and role

curl http://localhost:4002/assigned -H "X-User-Role: OFFICER"
# → 200, every complaint in the city
```

**Fix.** The gateway stamps `X-Internal-Token` on every proxied request, from a
secret (`INTERNAL_SERVICE_TOKEN`) only it knows. Every service runs
`requireInternalServiceToken` as its first middleware and returns `403` without
a matching token, compared with `crypto.timingSafeEqual`. The gateway refuses to
boot if the secret is missing, still a placeholder, or under 32 characters, and
so does each service — a missing secret fails loudly instead of silently
disabling the guard.

`/health` is deliberately exempt so monitoring still works.

After the fix all four probes return `403`; the gateway itself still serves
normal traffic.

### 2. HIGH — an unassigned officer could read the whole city

Officers self-register (`department-portal/src/pages/SignupPage.tsx` posts
`role: 'OFFICER'`), and `GET /complaints/assigned` returned **every** complaint
when `X-User-Department-Id` was empty. Since a new officer has no department,
open signup plus that rule meant any anonymous visitor could mint an account and
read the entire complaint queue.

**Fix.** An officer with no department now gets `403`
`{ code: 'DEPARTMENT_UNASSIGNED' }` and the portal shows a "Waiting for
department assignment" panel. Officers *with* a department are unchanged: their
department plus the unrouted pool. The designed signup flow still works, and the
admin assigns a department through the existing
`PATCH /api/auth/users/:id/department`.

### 3. HIGH — arbitrary `imageUrl` accepted and stored

`imageUrl` was stored verbatim, and three components render it in a plain
`<img src>`. A citizen could therefore make an officer's browser request an
attacker-controlled URL — a tracking pixel leaking the officer's IP, referrer
and the fact that they opened the complaint.

**Fix.** Only paths minted by the upload endpoint are accepted:
`/api/media/<name>.<jpg|jpeg|png|webp|gif|heic>`, with no dot in the name
segment so `..` cannot appear, and no scheme or host. Anything else is `400`.
Migration `009-scope-image-urls.sql` cleared 9 pre-existing off-origin values.
Covered by `test/uploads.test.js`, including traversal and `javascript:` cases.

### 4. MEDIUM — no rate limiting on credential endpoints

The gateway's 300 req/min budget applied to `/api/auth` too, so login was
effectively unlimited for online password guessing.

**Fix.** `/api/auth/login` allows 10 **failed** attempts per 15 minutes, and
`/api/auth/register` 30 per hour, on separate budgets.

The important detail is `skipSuccessfulRequests: true`. The first attempt at
this counted *every* request, and because local development sends everything from
`127.0.0.1`, a single per-IP bucket was shared by the whole app — so a
developer re-authenticating a few times locked themselves out of their own
machine. Only 4xx/5xx responses count now, so normal use never consumes the
budget. Verified: 30 consecutive successful logins produce no lockout, while 10
wrong passwords are throttled.

Tunable without touching code:

| Variable | Default | Effect |
| --- | --- | --- |
| `AUTH_RATE_LIMIT_WINDOW_MS` | `900000` | Failed-login window |
| `AUTH_RATE_LIMIT_MAX` | `10` | Failed logins allowed per window |
| `REGISTER_RATE_LIMIT_MAX` | `30` | Signups allowed per hour |

Limiting is per-IP only. Per-account limiting is deliberately not attempted at
the gateway: it would need the request body, and the gateway has no body parser
because consuming the stream would break proxying. Buffering and replaying the
body is possible but risks the gateway's core function, and it buys little
against the single-source guessing this defends against. A deployment that needs
it should terminate auth at a component that already parses bodies.

### 5. MEDIUM — missing security headers

No `helmet` anywhere, and `X-Powered-By: Express` disclosed the stack.

**Fix.** `helmet` on the gateway and on complaint-service (which serves
user-uploaded bytes, where `nosniff` genuinely matters), plus
`app.disable('x-powered-by')`. The gateway sends a strict CSP — it only ever
returns JSON and proxied images, so a locked-down policy costs nothing.

### 6. MEDIUM — placeholder secrets

Every `.env` shipped `JWT_SECRET=dev-secret-change-me`. It is public knowledge,
so anyone could forge an ADMIN token.

**Fix.** Local `.env` files now hold freshly generated 96-character random
secrets. The gateway refuses to start in production when `JWT_SECRET` is absent
*or* still the development placeholder. `.env.example` files were rewritten to
document both secrets, note that they must match across the gateway and every
service, and give the one-line command to generate them.

## Accepted risks

These are deliberate, not oversights.

- **Evidence photos are publicly readable** at `/api/media/<uuid>.<ext>`. The
  three `<img src>` call sites cannot send an `Authorization` header. Filenames
  are random UUIDs, so guessing another citizen's photo is not practical, but
  anyone holding a URL can view it. Making evidence private means fetching
  through `apiClient` and rendering a blob URL in all three components.
- **Officer self-registration is open** by product design. It is now harmless on
  its own because an unassigned officer sees nothing (finding 2), but it does
  mean anyone can create accounts. Rate-limited, and closed by finding 2.
- **CORS is `*` in development.** Fine for local tooling; set `CORS_ORIGIN`
  before any deployment, which the gateway already reads.
- **TLS is not terminated in local dev.** Use a reverse proxy in any real
  deployment.

## Not yet done

- **No rate limiting per account**, only per IP. Behind a shared NAT, one user
  can exhaust the budget for others. See finding 4 for why this is not fixed at
  the gateway, and what a deployment should do instead.
- **JWTs live in `localStorage`**, readable by any XSS. There is no XSS sink
  today (no `dangerouslySetInnerHTML`, no `eval`), but an httpOnly cookie plus a
  CSRF strategy is the stronger design.
- **No lockout or alerting on repeated login failures** beyond the 429.
- **Uploads are not scanned.** Type and size are enforced, but there is no
  antivirus step.
- **The category list is a string, not a database enum.** The API validates
  against the catalogue, so a bad value cannot be stored, but a `CHECK`
  constraint or enum would also protect direct database writes.

## Tests

```bash
cd backend/services/complaint-service && npm test
```

12 tests: category routing, case/whitespace canonicalisation, the
frontend↔backend catalogue drift guard, media-URL acceptance, and rejection of
off-origin/traversal payloads.

The drift guard is not decorative — changing a colour in
`frontend/packages/types/src/index.ts` without changing
`backend/services/complaint-service/src/routing/departments.js` fails the
suite.
