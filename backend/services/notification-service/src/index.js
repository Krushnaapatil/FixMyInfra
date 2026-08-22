import 'dotenv/config';
import express from 'express';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 4005;

app.use(express.json());
app.use('/', routes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }));

app.listen(PORT, () => {
  console.log('notification-service (Real-time push via WebSocket/STOMP, email/SMS fallback) listening on port', PORT);
});
