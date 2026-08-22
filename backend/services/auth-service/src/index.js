import 'dotenv/config';
import express from 'express';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());
app.use('/', routes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));

app.listen(PORT, () => {
  console.log('auth-service (Registration, login, JWT issuance) listening on port', PORT);
});
