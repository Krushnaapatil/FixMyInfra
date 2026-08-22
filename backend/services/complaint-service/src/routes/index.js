import { Router } from 'express';

const router = Router();

// Complaint CRUD, status lifecycle, unique complaint IDs
// TODO: mount controllers here, e.g. router.use('/', complaintController);
router.get('/', (_req, res) => {
  res.json({ service: 'complaint-service', status: 'scaffold - implement endpoints here' });
});

export default router;
