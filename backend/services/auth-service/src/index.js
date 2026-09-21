import 'dotenv/config';
import express from 'express';
import routes from './routes/index.js';
import { sequelize } from './db/sequelize.js';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());

// Registered before '/' routes so '/health' is never shadowed.
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));

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
