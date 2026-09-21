import 'dotenv/config';
import express from 'express';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 4004;

app.use(express.json());

// Registered before '/' routes so '/health' is never shadowed.
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'user-department-service' }));

app.use('/', routes);

app.listen(PORT, () => {
  console.log('user-department-service (User, department and category management) listening on port', PORT);
});
