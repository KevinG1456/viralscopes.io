import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { z } from 'zod';

import type { AppConfig } from '../config.js';
import { registerOAuthRoutes } from './oauth.routes.js';
import { clearAuthCookies, REFRESH_TOKEN_COOKIE_NAME, setAuthCookies } from '../lib/cookies.js';
import { AppError } from '../lib/errors.js';
import { ok } from '../lib/response.js';
import { hashRefreshToken } from '../lib/tokens.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateCsrf } from '../middleware/csrf.js';
import { findSessionByHash } from '../repositories/session.repository.js';
import { AuthService, type RequestMeta } from '../services/auth.service.js';
import { createLoggingEmailService } from '../services/email.service.js';

interface AuthRoutesOptions extends FastifyPluginOptions {
  config: AppConfig;
}

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  password: z.string(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const verifyEmailSchema = z.object({ token: z.string().min(1) });
const forgotPasswordSchema = z.object({ email: z.string().email() });
const resetPasswordSchema = z.object({ token: z.string().min(1), password: z.string() });

function requestMeta(request: FastifyRequest): RequestMeta {
  return { ipAddress: request.ip, userAgent: request.headers['user-agent'] ?? null };
}

export async function authRoutes(fastify: FastifyInstance, opts: AuthRoutesOptions): Promise<void> {
  const { config } = opts;
  const emailService = createLoggingEmailService(fastify.log, config.env);
  const authService = new AuthService(fastify.db, fastify.redis, config, emailService, fastify.log);

  fastify.post(
    '/register',
    { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const body = registerSchema.parse(request.body);
      const result = await authService.register(body);
      return reply.code(201).send(ok(result));
    },
  );

  fastify.post(
    '/login',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const body = loginSchema.parse(request.body);
      const { accessToken, refreshToken, user } = await authService.login(
        body,
        requestMeta(request),
      );
      setAuthCookies(reply, config, refreshToken);
      return reply.code(200).send(ok({ accessToken, user }));
    },
  );

  fastify.post('/logout', { preHandler: [authenticate, validateCsrf] }, async (request, reply) => {
    const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_NAME];
    if (refreshToken) {
      const hash = hashRefreshToken(config.jwt.refreshSecret, refreshToken);
      const session = await findSessionByHash(fastify.db, hash);
      if (session) await authService.logout(session.id);
    }
    clearAuthCookies(reply);
    return reply.code(200).send(ok({ message: 'Logged out successfully.' }));
  });

  fastify.post('/refresh', async (request, reply) => {
    const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_NAME];
    if (!refreshToken) {
      throw new AppError('INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token.', 401);
    }
    const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(
      refreshToken,
      requestMeta(request),
    );
    setAuthCookies(reply, config, newRefreshToken);
    return reply.code(200).send(ok({ accessToken }));
  });

  fastify.post(
    '/verify-email',
    { config: { rateLimit: { max: 5, timeWindow: '15 minutes' } } },
    async (request, reply) => {
      const body = verifyEmailSchema.parse(request.body);
      await authService.verifyEmail(body.token);
      return reply.code(200).send(ok({ message: 'Email verified successfully.' }));
    },
  );

  fastify.post(
    '/forgot-password',
    { config: { rateLimit: { max: 5, timeWindow: '15 minutes' } } },
    async (request, reply) => {
      const body = forgotPasswordSchema.parse(request.body);
      await authService.forgotPassword(body.email);
      return reply
        .code(200)
        .send(ok({ message: 'If that email exists, a reset link has been sent.' }));
    },
  );

  fastify.post(
    '/reset-password',
    { config: { rateLimit: { max: 3, timeWindow: '15 minutes' } } },
    async (request, reply) => {
      const body = resetPasswordSchema.parse(request.body);
      await authService.resetPassword(body.token, body.password);
      return reply.code(200).send(ok({ message: 'Password updated successfully.' }));
    },
  );

  fastify.get('/sessions', { preHandler: [authenticate] }, async (request, reply) => {
    const sessions = await authService.listSessions(request.user!.userId);
    const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_NAME];
    const currentHash = refreshToken
      ? hashRefreshToken(config.jwt.refreshSecret, refreshToken)
      : null;

    return reply.code(200).send(
      ok({
        sessions: sessions.map((s) => ({
          id: s.id,
          ipAddress: s.ipAddress,
          userAgent: s.userAgent,
          lastUsedAt: s.lastUsedAt,
          isCurrent: currentHash !== null && s.refreshTokenHash === currentHash,
        })),
      }),
    );
  });

  fastify.delete(
    '/sessions/:id',
    { preHandler: [authenticate, validateCsrf] },
    async (request, reply) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
      await authService.revokeOwnSession(request.user!.userId, id);
      return reply.code(200).send(ok({ message: 'Session revoked.' }));
    },
  );

  fastify.delete(
    '/sessions',
    { preHandler: [authenticate, validateCsrf] },
    async (request, reply) => {
      const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_NAME];
      const currentHash = refreshToken
        ? hashRefreshToken(config.jwt.refreshSecret, refreshToken)
        : null;
      const current = currentHash ? await findSessionByHash(fastify.db, currentHash) : undefined;

      const revokedCount = await authService.revokeOtherSessions(
        request.user!.userId,
        current?.id ?? '',
      );
      return reply.code(200).send(ok({ revokedCount }));
    },
  );

  await registerOAuthRoutes(fastify, { config, authService });
}
