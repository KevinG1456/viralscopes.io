import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppError } from '../lib/errors.js';

// Every org-scoped Phase 5 endpoint (watchlists, alert rules/events,
// api keys, usage, recommendations) needs a real org_id to pass into
// withTenant() -- but `orgId` on the JWT is nullable (Phase 4's
// buildAccessTokenPayload: a user has no org until Organisation & Workspace
// Management, TD-011, gives them one to create/join). Must run after
// `authenticate`. Route handlers read `request.user!.orgId!` after this
// runs -- the non-null assertion is safe because this throws first
// otherwise.
export async function requireOrgContext(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  if (!request.user) {
    throw new AppError('UNAUTHENTICATED', 'Authentication required.', 401);
  }
  if (!request.user.orgId) {
    throw new AppError(
      'NO_ORGANIZATION',
      'This account is not a member of an organisation yet.',
      403,
    );
  }
}
