import { randomBytes } from 'node:crypto';

import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppError } from '../lib/errors.js';

export const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

// Double Submit Cookie pattern (Security_Architecture.md §12): a
// state-changing request must echo the readable csrf_token cookie back in
// the X-CSRF-Token header. An attacker's page can trigger the browser to
// send the cookie automatically, but same-origin policy stops it from
// reading the cookie's value to also set the header -- SameSite=Strict on
// the refresh_token cookie (the actual credential) is the first, more
// important layer; this is the second, independent one.
export async function validateCsrf(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const cookieToken = request.cookies[CSRF_COOKIE_NAME];
  const headerToken = request.headers[CSRF_HEADER_NAME];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw new AppError('CSRF_VALIDATION_FAILED', 'Invalid CSRF token.', 403);
  }
}
