import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import routes from './routes/index.js';
import { sequelize } from './db/sequelize.js';
import { initOutbox, startOutboxPoller } from './outbox/outbox.js';
import { uploadDir } from './config/uploads.js';
import { assertInternalServiceTokenConfigured, requireInternalServiceToken } from '@fixmyinfra/shared-lib';

const SERVICE_NAME = 'complaint-service';
assertInternalServiceTokenConfigured(SERVICE_NAME);

const app = express();
const PORT = process.env.PORT || 4002;

app.disable('x-powered-by');
// This service both returns JSON and serves user-uploaded bytes, so nosniff and
// a locked-down policy matter here: they stop a crafted upload from being
// re-interpreted as active content by the browser.
app.use(helmet({
  contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], imgSrc: ["'self'", 'data:'] } },
  crossOriginResourcePolicy: { policy: 'same-site' }
}));

// Before anything else: only the API gateway may talk to this service, because
// the gateway is what establishes the X-User-* identity headers used for
// authorization further down.
app.use(requireInternalServiceToken);

app.use(express.json());

// Registered before '/' routes so '/health' is never shadowed by '/:id'.
app.get('/health', (_req, res) => res.json({ status: 'ok', service: SERVICE_NAME }));

// Evidence photos. The gateway rewrites the public /api/media/:file prefix onto
// this mount; filenames are random UUIDs, so guessing another citizen's photo
// is not practical. immutable is safe because every upload gets a fresh name.
app.use('/uploads', express.static(uploadDir, { immutable: true, maxAge: '30d' }));

app.use('/', routes);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('complaint-service connected to PostgreSQL');
  } catch (error) {
    console.error('complaint-service could not connect to PostgreSQL:', error.message);
  }

  // Ensures the outbox table exists (mirrors migrations/005, admin-applied).
  // Falls back to degraded mode when the DB role cannot access it.
  await initOutbox();

  // Best-effort poller: retries unpublished outbox events; tolerates broker downtime.
  startOutboxPoller();

  app.listen(PORT, () => {
    console.log('complaint-service (Complaint CRUD, status lifecycle, unique complaint IDs) listening on port', PORT);
  });
}

start();
