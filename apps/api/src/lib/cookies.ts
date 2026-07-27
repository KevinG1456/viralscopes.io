import type { FastifyReply } from 'fastify';

import type { AppConfig } from '../config.js';
import { parseDurationMs } from './duration.js';
import { generateCsrfToken, CSRF_COOKIE_NAME } from '../middleware/csrf.js';

export const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';

// Session Architecture (Security_Architecture.md §4): refreshToken is
// HTTP-only + Secure + SameSite=Strict, never readable by JavaScript.
// csrf_token is deliberately NOT httpOnly (client JS must read it to echo
// it back in a header -- see middleware/csrf.ts).
export function setAuthCookies(reply: FastifyReply, config: AppConfig, refreshToken: string): void {
  const maxAgeSeconds = Math.floor(parseDurationMs(config.jwt.refreshExpiry) / 1000);
  const secure = config.env === 'production' || config.env === 'staging';

  reply.setCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge: maxAgeSeconds,
  });

  reply.setCookie(CSRF_COOKIE_NAME, generateCsrfToken(), {
    httpOnly: false,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

export function clearAuthCookies(reply: FastifyReply): void {
  reply.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: '/api/v1/auth' });
  reply.clearCookie(CSRF_COOKIE_NAME, { path: '/' });
}
