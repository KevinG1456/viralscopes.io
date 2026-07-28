import { timingSafeEqual } from 'node:crypto';

import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppError } from '../lib/errors.js';

// Phase 6: authenticates incoming calls FROM n8n to apps/api's
// /api/v1/internal/* routes -- a distinct concept from both the
// customer-facing JWT (Phase 4) and org-scoped API keys (Phase 5), since
// n8n is a trusted internal service, not a logged-in user or a customer's
// API integration. A single shared secret (N8N_SERVICE_TOKEN), identical
// in both the API's and n8n's environment, attached by n8n's workflows as
// the `X-Service-Token` header.
export async function requireServiceToken(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const provided = request.headers['x-service-token'];
  const expected = request.server.appConfig.n8n.serviceToken;

  if (typeof provided !== 'string' || !timingSafeEqualStrings(provided, expected)) {
    throw new AppError('UNAUTHENTICATED', 'Invalid or missing service token.', 401);
  }
}

// Plain !== on secrets is a timing side-channel (string comparison
// short-circuits at the first differing byte); timingSafeEqual needs
// equal-length buffers, so length is checked separately first (this
// itself is safe to leak -- token length isn't the secret).
function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
