import cookie from '@fastify/cookie';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

// No secret/signing configured: the refresh_token cookie's integrity is
// already anchored by the server-side sessions table (packages/db) --
// hashRefreshToken() lookup fails on any tampering, the same effect a
// signature would provide. The csrf_token cookie must be readable by
// client JS by design (double-submit pattern, Security_Architecture.md
// §12), so it can't be a signed/httpOnly cookie either.
async function cookiePluginImpl(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  await fastify.register(cookie);
}

export const cookiePlugin = fp(cookiePluginImpl, { name: 'cookie-plugin' });
