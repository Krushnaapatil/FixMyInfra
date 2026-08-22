import { Router } from 'express';

const router = Router();

// User, department and category management
// TODO: mount controllers here, e.g. router.use('/', complaintController);
router.get('/', (_req, res) => {
  res.json({ service: 'user-department-service', status: 'scaffold - implement endpoints here' });
});

export default router;
