import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authenticate, requireRole } from './middleware/authenticate.js';
import { serviceRoutes } from './config/routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(rateLimit({ windowMs: 60_000, max: 300 })); // NFR-001/002 style protection

// Registered before proxy routes so '/health' is never proxied upstream.
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

for (const route of serviceRoutes) {
  if (route.public) {
    const proxy = createProxyMiddleware({ target: route.target, changeOrigin: true });
    app.use(route.path, proxy);
  } else {
    const proxy = createProxyMiddleware({
      target: route.target,
      changeOrigin: true,
      on: {
        proxyReq: (proxyReq, req) => {
          // These claims are trusted only because services are private behind this gateway.
          // Harden this boundary with a gateway-to-service secret before exposing services directly.
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
