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

for (const route of serviceRoutes) {
  const proxy = createProxyMiddleware({ target: route.target, changeOrigin: true });

  if (route.public) {
    app.use(route.path, proxy);
  } else {
    app.use(route.path, authenticate, requireRole(...route.roles), proxy);
  }
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

app.listen(PORT, () => {
  console.log(`API gateway listening on port ${PORT}`);
});
