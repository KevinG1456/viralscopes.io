import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppError } from '../lib/errors.js';
import { findUserById } from '../repositories/user.repository.js';

// Platform-level admin gate for Endpoints — Admin (ROADMAP.md Phase 5).
// Deliberately NOT based on the JWT: `users.role` ('super_admin' | 'user')
// is a platform-wide flag distinct from the JWT's `orgRole` (org-level:
// admin/owner/member/viewer, checked by middleware/require-role.ts) --
// adding it to the access token would mean a demoted admin keeps admin API
// access for up to the token's 15-minute lifetime. A live DB read on every
// admin request costs one indexed lookup and closes that gap immediately.
// Must run after `authenticate`.
export async function requireSuperAdmin(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  if (!request.user) {
    throw new AppError('UNAUTHENTICATED', 'Authentication required.', 401);
  }

  const user = await findUserById(request.server.db, request.user.userId);
  if (!user || user.role !== 'super_admin') {
    throw new AppError('INSUFFICIENT_PERMISSIONS', 'Super admin access required.', 403);
  }
}
