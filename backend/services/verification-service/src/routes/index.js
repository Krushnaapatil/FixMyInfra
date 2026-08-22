import { Router } from 'express';

const router = Router();

// Calls ai-service for authenticity scoring and duplicate detection
// TODO: mount controllers here, e.g. router.use('/', complaintController);
router.get('/', (_req, res) => {
  res.json({ service: 'verification-service', status: 'scaffold - implement endpoints here' });
});

export default router;
