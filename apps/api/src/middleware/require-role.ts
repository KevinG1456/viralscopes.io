import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppError } from '../lib/errors.js';

// Layer 1 of RBAC (Security_Architecture.md §3, route-level). Must run
// after `authenticate` -- reads request.user.orgRole, which authenticate
// sets from the verified JWT, never from anything else the client sends.
//
// Layer 2 (service-layer permission checks, independent of route
// middleware) and Layer 3 (RLS, already active since Phase 3) are the
// other two legs of defence-in-depth; Layer 2 has nothing to enforce
// permissions ON yet in this phase -- no resource services exist before
// Phase 5 -- so it isn't demonstrated here.
export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new AppError('UNAUTHENTICATED', 'Authentication required.', 401);
    }
    if (!request.user.orgRole || !roles.includes(request.user.orgRole)) {
      throw new AppError('INSUFFICIENT_PERMISSIONS', 'Your role does not permit this action.', 403);
    }
  };
}
