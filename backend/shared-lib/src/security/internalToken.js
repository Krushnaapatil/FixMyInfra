import crypto from 'node:crypto';

export const INTERNAL_TOKEN_HEADER = 'x-internal-token';

// Endpoints that must stay reachable without the internal token so monitoring
// and load balancers can probe them. Nothing here reads identity claims.
const UNAUTHENTICATED_PATHS = new Set(['/health', '/health/']);

export function internalServiceToken() {
  return process.env.INTERNAL_SERVICE_TOKEN || '';
}

/**
 * Throws at boot when the shared secret is missing or still a placeholder.
 * Failing loudly beats starting up with an unset secret, which would make the
 * guard a no-op and silently reopen the trust boundary.
 */
export function assertInternalServiceTokenConfigured(serviceName) {
  const token = internalServiceToken();
  if (!token) {
    throw new Error(
      `${serviceName} refusing to start: INTERNAL_SERVICE_TOKEN is not set. ` +
        'Copy .env.example to .env and set a long random value shared with the API gateway.'
    );
  }
  if (token === 'change-me' || token.startsWith('change-me')) {
    throw new Error(
      `${serviceName} refusing to start: INTERNAL_SERVICE_TOKEN is still the placeholder value.`
    );
  }
  if (token.length < 32) {
    throw new Error(
      `${serviceName} refusing to start: INTERNAL_SERVICE_TOKEN must be at least 32 characters.`
    );
  }
}

function timingSafeEquals(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  // hashLength: false keeps this a constant-time comparison of equal-length
  // inputs; the length check below is not secret.
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

/**
 * Guards the gateway -> service boundary.
 *
 * Services authorise requests from the X-User-* headers the gateway injects
 * after verifying the JWT. Without this guard anyone able to reach the service
 * port directly can set those headers themselves and impersonate any role,
 * bypassing authentication and the gateway's RBAC entirely. Requiring a secret
 * that only the gateway knows restores the boundary.
 */
export function requireInternalServiceToken(req, res, next) {
  if (UNAUTHENTICATED_PATHS.has(req.path)) {
    return next();
  }

  const expected = internalServiceToken();
  const provided = req.header(INTERNAL_TOKEN_HEADER);

  if (!expected) {
    // Misconfiguration: refuse rather than fall open.
    return res.status(503).json({ error: 'Service is not configured for internal traffic' });
  }
  if (!provided || !timingSafeEquals(provided, expected)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}
