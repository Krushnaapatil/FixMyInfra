import { Router } from 'express';

const router = Router();

// Dashboard analytics, hotspots, resolution stats
// TODO: mount controllers here, e.g. router.use('/', complaintController);
router.get('/', (_req, res) => {
  res.json({ service: 'reporting-service', status: 'scaffold - implement endpoints here' });
});

export default router;
