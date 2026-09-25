import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import routes from './routes/index.js';
import { assertInternalServiceTokenConfigured, requireInternalServiceToken } from '@fixmyinfra/shared-lib';

const SERVICE_NAME = 'reporting-service';
// Fails fast when the shared secret is missing, rather than starting with
// an open trust boundary.
assertInternalServiceTokenConfigured(SERVICE_NAME);

const app = express();
const PORT = process.env.PORT || 4006;

app.disable('x-powered-by');
app.use(helmet());

// Only the API gateway may reach this service. Requests are authorised from
// the X-User-* headers the gateway injects after verifying the JWT, so an
// unguarded port would let any caller forge an identity.
app.use(requireInternalServiceToken);

app.use(express.json());

// Registered before '/' routes so '/health' is never shadowed.
app.get('/health', (_req, res) => res.json({ status: 'ok', service: SERVICE_NAME }));

app.use('/', routes);

app.listen(PORT, () => {
  console.log('reporting-service (Dashboard analytics, hotspots, resolution stats) listening on port', PORT);
});
