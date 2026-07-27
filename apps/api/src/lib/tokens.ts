import { createHash, createHmac, randomBytes } from 'node:crypto';

// Opaque, cryptographically random tokens for email verification and
// password reset (Security_Architecture.md §2): 32 random bytes, given to
// the user as hex; only sha256(token) is ever stored, so a database dump
// alone can't be used to forge a valid link.
export function generateOpaqueToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('hex');
  return { token, hash: createHash('sha256').update(token).digest('hex') };
}

export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// Refresh tokens use a keyed hash (HMAC-SHA256 with JWT_REFRESH_SECRET)
// rather than plain sha256: Security_Architecture.md §5 calls for a
// separate secret dedicated to refresh tokens, and keying the hash means a
// stolen `sessions` table alone still can't be correlated against a
// precomputed table of hashes the way an unkeyed sha256 could be.
export function generateRefreshToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashRefreshToken(refreshSecret: string, token: string): string {
  return createHmac('sha256', refreshSecret).update(token).digest('hex');
}
