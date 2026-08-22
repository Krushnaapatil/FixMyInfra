import { Router } from 'express';

const router = Router();

// Registration, login, JWT issuance
// TODO: mount controllers here, e.g. router.use('/', complaintController);
router.get('/', (_req, res) => {
  res.json({ service: 'auth-service', status: 'scaffold - implement endpoints here' });
});

export default router;
