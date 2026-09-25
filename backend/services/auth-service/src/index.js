import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import routes from './routes/index.js';
import { sequelize } from './db/sequelize.js';
import { assertInternalServiceTokenConfigured, requireInternalServiceToken } from '@fixmyinfra/shared-lib';

const SERVICE_NAME = 'auth-service';
assertInternalServiceTokenConfigured(SERVICE_NAME);

const app = express();
const PORT = process.env.PORT || 4001;

app.disable('x-powered-by');
app.use(helmet());

// Only the gateway may reach this service. /users and the officer-assignment
// routes authorise on the X-User-Role header, which the gateway sets from a
// verified JWT; without this guard a direct caller could set that header
// themselves and read or modify every account.
app.use(requireInternalServiceToken);

app.use(express.json());

// Registered before '/' routes so '/health' is never shadowed.
app.get('/health', (_req, res) => res.json({ status: 'ok', service: SERVICE_NAME }));

app.use('/', routes);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('auth-service connected to PostgreSQL');
  } catch (error) {
    console.error('auth-service could not connect to PostgreSQL:', error.message);
  }

  app.listen(PORT, () => {
    console.log('auth-service (Registration, login, JWT issuance) listening on port', PORT);
  });
}

start();
