// Central routing table: gateway path prefix -> upstream microservice.
// Upstream hosts come from the environment so the same image runs in local
// dev (localhost) and in Docker Compose (service DNS names). Ports stay here
// because they are part of each service's contract, not the environment.
const upstream = (envName, fallback) => process.env[envName] || fallback;

const AUTH = upstream('AUTH_SERVICE_URL', 'http://localhost:4001');
const COMPLAINT = upstream('COMPLAINT_SERVICE_URL', 'http://localhost:4002');
const ROUTING = upstream('ROUTING_SERVICE_URL', 'http://localhost:4003');
const USER_DEPT = upstream('USER_DEPARTMENT_SERVICE_URL', 'http://localhost:4004');
const NOTIFY = upstream('NOTIFICATION_SERVICE_URL', 'http://localhost:4005');
const REPORTING = upstream('REPORTING_SERVICE_URL', 'http://localhost:4006');
const VERIFICATION = upstream('VERIFICATION_SERVICE_URL', 'http://localhost:4007');

export const serviceRoutes = [
  // More specific prefixes must come first: officer management is ADMIN-only
  // while the rest of /api/auth (register, login) stays public.
  // Express strips the mount prefix before proxying, so pathRewrite restores
  // the /users prefix auth-service routes expect.
  { path: '/api/auth/users', target: AUTH, roles: ['ADMIN'], pathRewrite: { '^/': '/users/' } },
  { path: '/api/auth', target: AUTH, public: true },
  // Evidence photos are public: the portals render them with a plain <img src>,
  // which cannot send the Authorization header the JWT middleware requires.
  // Must precede /api/complaints, which is auth-gated.
  { path: '/api/media', target: COMPLAINT, public: true, pathRewrite: { '^/': '/uploads/' } },
  { path: '/api/complaints', target: COMPLAINT, roles: ['CITIZEN', 'OFFICER', 'ADMIN'] },
  { path: '/api/routing', target: ROUTING, roles: ['ADMIN'] },
  { path: '/api/users', target: USER_DEPT, roles: ['ADMIN'] },
  { path: '/api/departments', target: USER_DEPT, roles: ['ADMIN'] },
  { path: '/api/notifications', target: NOTIFY, roles: ['CITIZEN', 'OFFICER', 'ADMIN'] },
  { path: '/api/reports', target: REPORTING, roles: ['ADMIN'] },
  { path: '/api/verification', target: VERIFICATION, roles: ['ADMIN', 'OFFICER'] }
];
