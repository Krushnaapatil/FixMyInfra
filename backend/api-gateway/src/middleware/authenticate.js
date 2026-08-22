import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Verifies the JWT and attaches decoded claims (sub, role, departmentId) to req.user.
// Public routes (auth/login, auth/register) should be excluded before this middleware runs.
export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  const token = header.slice('Bearer '.length);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Rejects the request unless req.user.role is one of the allowed roles.
// Enforces BR-004 (single department assignment) style rules at the edge -
// actual business rules still live in the owning service.
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient role for this route' });
    }
    next();
  };
}
