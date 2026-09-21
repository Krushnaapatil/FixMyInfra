import 'dotenv/config';
import express from 'express';
import routes from './routes/index.js';
import { sequelize } from './db/sequelize.js';
import { initOutbox, startOutboxPoller } from './outbox/outbox.js';

const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());

// Registered before '/' routes so '/health' is never shadowed by '/:id'.
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'complaint-service' }));

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
