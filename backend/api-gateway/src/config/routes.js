// Central routing table: gateway path prefix -> upstream microservice.
// Update ports here if a service's local port changes in docker-compose.yml.
export const serviceRoutes = [
  { path: '/api/auth', target: 'http://localhost:4001', public: true },
  { path: '/api/complaints', target: 'http://localhost:4002', roles: ['CITIZEN', 'OFFICER', 'ADMIN'] },
  { path: '/api/routing', target: 'http://localhost:4003', roles: ['ADMIN'] },
  { path: '/api/users', target: 'http://localhost:4004', roles: ['ADMIN'] },
  { path: '/api/departments', target: 'http://localhost:4004', roles: ['ADMIN'] },
  { path: '/api/notifications', target: 'http://localhost:4005', roles: ['CITIZEN', 'OFFICER', 'ADMIN'] },
  { path: '/api/reports', target: 'http://localhost:4006', roles: ['ADMIN'] },
  { path: '/api/verification', target: 'http://localhost:4007', roles: ['ADMIN', 'OFFICER'] }
];
