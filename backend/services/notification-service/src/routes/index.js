import { Router } from 'express';

const router = Router();

// Real-time push via WebSocket/STOMP, email/SMS fallback
// TODO: mount controllers here, e.g. router.use('/', complaintController);
router.get('/', (_req, res) => {
  res.json({ service: 'notification-service', status: 'scaffold - implement endpoints here' });
});

export default router;
