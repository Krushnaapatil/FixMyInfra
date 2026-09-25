import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authenticate, requireRole } from './middleware/authenticate.js';
import { serviceRoutes } from './config/routes.js';
import { INTERNAL_TOKEN_HEADER } from '@fixmyinfra/shared-lib';

const app = express();
const PORT = process.env.PORT || 4000;
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || '';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('Refusing to start: JWT_SECRET must be set in production.');
  process.exit(1);
}

// The gateway is the only party that knows this secret, and it is what makes
// the X-User-* headers below trustworthy. Without it the services would accept
// forged identity headers from anyone who can reach their port.
if (!INTERNAL_SERVICE_TOKEN) {
  console.error('Refusing to start: INTERNAL_SERVICE_TOKEN is not set.');
  process.exit(1);
}
if (INTERNAL_SERVICE_TOKEN.length < 32) {
  console.error('Refusing to start: INTERNAL_SERVICE_TOKEN must be at least 32 characters.');
  process.exit(1);
}
if (process.env.JWT_SECRET === 'dev-secret-change-me' && process.env.NODE_ENV === 'production') {
  console.error('Refusing to start: JWT_SECRET is still the development placeholder.');
  process.exit(1);
}

// Comma-separated allowlist, e.g. CORS_ORIGIN=https://a.example,https://b.example.
// Unset means "same tooling as local dev" (all origins) — set it for any deployment.
const corsOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
// The gateway only ever returns JSON and proxied image bytes, so a strict policy
// costs nothing here and removes the usual gateway-borne XSS/clickjacking surface.
app.use(helmet({
  contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], imgSrc: ["'self'", 'data:'], sandbox: [] } },
  crossOriginResourcePolicy: { policy: 'same-site' }
}));
app.use(cors({ origin: corsOrigins.includes('*') ? true : corsOrigins }));
app.use(rateLimit({ windowMs: 60_000, max: 300 })); // NFR-001/002 style protection

// Credential endpoints are limited by *failed* attempts, not total volume.
//
// skipSuccessfulRequests is the important part: in local development every
// request arrives from 127.0.0.1, so a single per-IP bucket is shared by the
// whole app. Counting successful logins meant a developer re-authenticating a
// few times locked themselves out of their own machine. Only 4xx/5xx count, so
// ordinary use never consumes the budget.
//
// Keyed by IP only. Per-account limiting is deliberately not attempted here: it
// would need the request body, and the gateway has no body parser because
// consuming the stream would break proxying. Buffering and replaying the body
// is possible but risks the gateway's core function, and it buys little for the
// single-source guessing this actually defends against. See SECURITY.md.
const authWindowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60_000);
const authMaxFailures = Number(process.env.AUTH_RATE_LIMIT_MAX || 10);

app.use('/api/auth/login', rateLimit({
  windowMs: authWindowMs,
  max: authMaxFailures,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many failed sign-in attempts. Please wait before trying again.'
  }
}));

// Registration is limited separately and far more loosely: it only needs to
// stop bulk scripted signups, and legitimate signups must never be throttled
// into looking like an outage.
app.use('/api/auth/register', rateLimit({
  windowMs: 60 * 60_000,
  max: Number(process.env.REGISTER_RATE_LIMIT_MAX || 30),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many accounts created from this network. Please try again later.' }
}));

// Registered before proxy routes so '/health' is never proxied upstream.
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

// Every proxied request carries the shared internal token, which is what lets a
// service trust the identity headers below. setHeader overwrites, so a client
// cannot smuggle its own X-Internal-Token or X-User-* values through.
function stampInternalToken(proxyReq) {
  proxyReq.setHeader(INTERNAL_TOKEN_HEADER, INTERNAL_SERVICE_TOKEN);
}

for (const route of serviceRoutes) {
  if (route.public) {
    const proxy = createProxyMiddleware({
      target: route.target,
      changeOrigin: true,
      ...(route.pathRewrite ? { pathRewrite: route.pathRewrite } : {}),
      on: { proxyReq: stampInternalToken }
    });
    app.use(route.path, proxy);
  } else {
    const proxy = createProxyMiddleware({
      target: route.target,
      changeOrigin: true,
      ...(route.pathRewrite ? { pathRewrite: route.pathRewrite } : {}),
      on: {
        proxyReq: (proxyReq, req) => {
          stampInternalToken(proxyReq);
          // Verified from the JWT above; trusted downstream only because the
          // internal token proves the request really came through this gateway.
          proxyReq.setHeader('X-User-Id', req.user.sub);
          proxyReq.setHeader('X-User-Role', req.user.role);
          proxyReq.setHeader('X-User-Department-Id', req.user.departmentId ?? '');
        }
      }
    });
    app.use(route.path, authenticate, requireRole(...route.roles), proxy);
  }
}

app.listen(PORT, () => {
  console.log(`API gateway listening on port ${PORT}`);
});
