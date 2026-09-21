import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const roles = ['CITIZEN', 'OFFICER', 'ADMIN'];

function serializeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    departmentId: user.departmentId ?? null
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.get('/', (_req, res) => {
  res.json({ service: 'auth-service', status: 'ok' });
});

// Assigns an officer to a department. Reached via the gateway's ADMIN-only
// /api/auth/users prefix (which the gateway strips), so the path here is
// /:id/department. Gateway restricts this to ADMIN; the header check below
// is defense-in-depth for direct service access.
router.patch('/:id/department', async (req, res) => {
  if (req.header('X-User-Role') !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  if (!uuidPattern.test(req.params.id)) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { departmentId = null } = req.body ?? {};
  if (departmentId !== null && !uuidPattern.test(departmentId)) {
    return res.status(400).json({ error: 'departmentId must be a UUID or null' });
  }

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.departmentId = departmentId;
    await user.save();
    return res.json(serializeUser(user));
  } catch (error) {
    console.error('Failed to assign department:', error);
    return res.status(500).json({ error: 'Failed to assign department' });
  }
});

router.post('/register', async (req, res) => {
  const { email, password, name, role = 'CITIZEN' } = req.body ?? {};

  if (typeof email !== 'string' || !isValidEmail(email.trim())) {
    return res.status(400).json({ error: 'A valid email is required' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (role === 'ADMIN') {
    return res.status(400).json({ error: 'Admin accounts must be created manually' });
  }
  if (!roles.includes(role) || !['CITIZEN', 'OFFICER'].includes(role)) {
    return res.status(400).json({ error: 'Invalid registration role' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  try {
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      role
    });
    return res.status(201).json(serializeUser(user));
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email is already registered' });
    }
    console.error('Failed to register user:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  try {
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role, departmentId: user.departmentId ?? undefined },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({ token, user: serializeUser(user) });
  } catch (error) {
    console.error('Failed to log in user:', error);
    return res.status(500).json({ error: 'Unable to log in' });
  }
});

export default router;
