import 'dotenv/config';
import express from 'express';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 4002;

app.use(express.json());
app.use('/', routes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'complaint-service' }));

app.listen(PORT, () => {
  console.log('complaint-service (Complaint CRUD, status lifecycle, unique complaint IDs) listening on port', PORT);
});
