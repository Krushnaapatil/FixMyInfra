import 'dotenv/config';
import express from 'express';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 4006;

app.use(express.json());

// Registered before '/' routes so '/health' is never shadowed.
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'reporting-service' }));

app.use('/', routes);

app.listen(PORT, () => {
  console.log('reporting-service (Dashboard analytics, hotspots, resolution stats) listening on port', PORT);
});
