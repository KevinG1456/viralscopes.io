import jwt from 'jsonwebtoken';
import { ulid } from 'ulid';

import type { AppConfig } from '../config.js';
import { AppError } from './errors.js';

const JWT_ALGORITHM = 'HS256';

// Org context is nullable: a newly registered user has no organisation
// until Organisation & Workspace Management (later phase, explicitly out
// of Phase 4's identity/session/access-control scope) creates one. RLS
// tenant isolation (packages/db's withTenant) simply isn't invoked for a
// request with no org context -- there's no tenant data to see yet, which
// is the correct behaviour, not a gap.
export interface AccessTokenPayload {
  sub: string;
  userId: string;
  orgId: string | null;
  orgRole: string | null;
  planTier: string | null;
}

export interface DecodedAccessToken extends AccessTokenPayload {
  iat: number;
  exp: number;
  jti: string;
}

export function signAccessToken(config: AppConfig, payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    algorithm: JWT_ALGORITHM,
    expiresIn: config.jwt.accessExpiry as jwt.SignOptions['expiresIn'],
    jwtid: ulid(),
  });
}

export function verifyAccessToken(config: AppConfig, token: string): DecodedAccessToken {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, { algorithms: [JWT_ALGORITHM] });
    if (typeof decoded === 'string') {
      throw new AppError('INVALID_TOKEN', 'Malformed access token.', 401);
    }
    return decoded as DecodedAccessToken;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('INVALID_TOKEN', 'Invalid or expired access token.', 401);
  }
}
