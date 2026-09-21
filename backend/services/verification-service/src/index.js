import 'dotenv/config';
import express from 'express';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 4007;

app.use(express.json());

// Registered before '/' routes so '/health' is never shadowed.
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'verification-service' }));

app.use('/', routes);

app.listen(PORT, () => {
  console.log('verification-service (Calls ai-service for authenticity scoring and duplicate detection) listening on port', PORT);
});
