import { Router } from 'express';

const router = Router();

// Category-to-department assignment logic
// TODO: mount controllers here, e.g. router.use('/', complaintController);
router.get('/', (_req, res) => {
  res.json({ service: 'routing-service', status: 'scaffold - implement endpoints here' });
});

export default router;
