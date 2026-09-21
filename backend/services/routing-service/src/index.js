import 'dotenv/config';
import express from 'express';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 4003;

app.use(express.json());

// Registered before '/' routes so '/health' is never shadowed.
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'routing-service' }));

app.use('/', routes);

app.listen(PORT, () => {
  console.log('routing-service (Category-to-department assignment logic) listening on port', PORT);
});
