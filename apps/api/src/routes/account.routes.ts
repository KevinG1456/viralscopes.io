import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { clearAuthCookies } from '../lib/cookies.js';
import { ok } from '../lib/response.js';
import { authenticate } from '../middleware/authenticate.js';
import { businessRateLimit } from '../middleware/business-rate-limit.js';
import { validateCsrf } from '../middleware/csrf.js';
import { deleteAccount, exportAccountData } from '../services/account.service.js';

// Phase 10 Milestone 5 -- GDPR "Right to access" / "Right to deletion"
// (Security_Architecture.md §19). Deliberately NOT gated behind
// requireOrgContext: a user with no organisation yet (TD-011) must still
// be able to export or delete their own account.
export async function accountRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  fastify.get(
    '/export',
    { preHandler: [authenticate, businessRateLimit] },
    async (request, reply) => {
      const data = await exportAccountData(fastify.db, request.user!.orgId, request.user!.userId);
      return reply.code(200).send(ok(data));
    },
  );

  fastify.delete(
    '/',
    { preHandler: [authenticate, validateCsrf, businessRateLimit] },
    async (request, reply) => {
      await deleteAccount(fastify.db, request.user!.orgId, request.user!.userId);
      clearAuthCookies(reply);
      return reply.code(200).send(ok({ message: 'Account deleted.' }));
    },
  );
}
