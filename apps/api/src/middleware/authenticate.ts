import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppError } from '../lib/errors.js';
import { verifyAccessToken, type AccessTokenPayload } from '../lib/jwt.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AccessTokenPayload;
  }
}

// Layer 1 of RBAC (Security_Architecture.md §3): verifies the
// Authorization: Bearer <accessToken> header and attaches the decoded
// claims to request.user. Route handlers and requireRole() read from
// request.user -- neither trusts anything the client sends outside this
// verified JWT.
export async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('UNAUTHENTICATED', 'Authentication required.', 401);
  }

  const token = header.slice('Bearer '.length);
  const decoded = verifyAccessToken(request.server.appConfig, token);
  request.user = decoded;
}
