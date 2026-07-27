import type { Database } from '@viralscopes/db';
import type { FastifyBaseLogger } from 'fastify';
import type { Redis } from 'ioredis';

import type { AppConfig } from '../config.js';
import type { EmailService } from './email.service.js';
import { addDuration } from '../lib/duration.js';
import { AppError } from '../lib/errors.js';
import { signAccessToken } from '../lib/jwt.js';
import { assertNotLockedOut, recordFailedLogin, resetFailedLogins } from '../lib/lockout.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import {
  generateOpaqueToken,
  generateRefreshToken,
  hashOpaqueToken,
  hashRefreshToken,
} from '../lib/tokens.js';
import { findActiveOrgContext } from '../repositories/org-membership.repository.js';
import {
  createSession,
  findSessionByHash,
  findSessionById,
  listActiveSessionsForUser,
  revokeAllSessionsForUser,
  revokeSession,
  type SessionRow,
} from '../repositories/session.repository.js';
import {
  createEmailVerificationToken,
  createPasswordResetToken,
  findUnusedEmailVerificationToken,
  findUnusedPasswordResetToken,
  markEmailVerificationTokenUsed,
  markPasswordResetTokenUsed,
} from '../repositories/token.repository.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  markEmailVerified,
  updatePasswordHash,
  type UserRow,
} from '../repositories/user.repository.js';

export interface RequestMeta {
  ipAddress: string | null;
  userAgent: string | null;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  onboardingDone: boolean;
}

function toPublicUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    onboardingDone: user.onboardingDone,
  };
}

const EMAIL_VERIFICATION_TOKEN_TTL_HOURS = '24h';
const PASSWORD_RESET_TOKEN_TTL_HOURS = '1h';

export class AuthService {
  constructor(
    private readonly db: Database,
    private readonly redis: Redis,
    private readonly config: AppConfig,
    private readonly emailService: EmailService,
    private readonly logger: FastifyBaseLogger,
  ) {}

  async register(input: { email: string; name: string; password: string }): Promise<{
    user: PublicUser;
    message: string;
  }> {
    const existing = await findUserByEmail(this.db, input.email);
    if (existing) {
      throw new AppError('EMAIL_ALREADY_REGISTERED', 'This email is already registered.', 409);
    }

    // Throws AppError (422) on weak/common passwords before anything is written.
    const passwordHash = await hashPassword(input.password);
    const user = await createUser(this.db, {
      email: input.email,
      name: input.name,
      passwordHash,
    });

    await this.issueEmailVerificationToken(user);

    return {
      user: toPublicUser(user),
      message: 'Verification email sent. Please check your inbox.',
    };
  }

  async login(
    input: { email: string; password: string },
    meta: RequestMeta,
  ): Promise<{ accessToken: string; refreshToken: string; user: PublicUser }> {
    const user = await findUserByEmail(this.db, input.email);

    // Always run a bcrypt compare, even for a nonexistent user, against a
    // fixed dummy hash -- otherwise "no such user" returns faster than
    // "wrong password", which is a timing side-channel for account
    // enumeration.
    const DUMMY_HASH = '$2b$12$CwTycUXWue0Thq9StjUM0uJ8Q8QW9x6z5X6z5X6z5X6z5X6z5X6z5';
    if (!user) {
      await verifyPassword(input.password, DUMMY_HASH);
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password.', 401);
    }

    await assertNotLockedOut(this.redis, user.id);

    const passwordValid = user.passwordHash
      ? await verifyPassword(input.password, user.passwordHash)
      : await verifyPassword(input.password, DUMMY_HASH);

    // DEC-015 (PROJECT_STATUS.md §11): a correct password against an
    // unverified account used to return a distinct 403 EMAIL_NOT_VERIFIED,
    // which let an attacker confirm a guessed/stuffed password was correct
    // without ever completing login -- and without tripping lockout, since
    // recordFailedLogin only ran on the wrong-password branch. Both cases
    // now produce an identical response and both count toward lockout, so
    // the two are indistinguishable to the caller. The account's actual
    // state is still fully visible server-side via this log line.
    if (!passwordValid || !user.emailVerified) {
      await recordFailedLogin(this.redis, user.id);
      if (passwordValid && !user.emailVerified) {
        this.logger.info(
          { userId: user.id },
          'Login rejected: password correct but email not verified.',
        );
      }
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password.', 401);
    }

    await resetFailedLogins(this.redis, user.id);

    const { accessToken, refreshToken } = await this.issueSession(user, meta);
    return { accessToken, refreshToken, user: toPublicUser(user) };
  }

  async logout(sessionId: string): Promise<void> {
    await revokeSession(this.db, sessionId);
  }

  async refresh(
    refreshToken: string,
    meta: RequestMeta,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshTokenHash = hashRefreshToken(this.config.jwt.refreshSecret, refreshToken);
    const session = await findSessionByHash(this.db, refreshTokenHash);

    if (!session) {
      throw new AppError('INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token.', 401);
    }

    if (session.revoked) {
      // Rotation-gap replay detection (Security_Architecture.md §4): a
      // revoked refresh token being presented again means either it was
      // stolen after a legitimate rotation, or reused after logout. Either
      // way, treat it as compromise and kill every session for this user.
      await revokeAllSessionsForUser(this.db, session.userId);
      throw new AppError(
        'REFRESH_TOKEN_REUSE_DETECTED',
        'This session has been terminated for security reasons. Please sign in again.',
        401,
      );
    }

    if (session.expiresAt.getTime() < Date.now()) {
      throw new AppError('INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token.', 401);
    }

    const user = await findUserById(this.db, session.userId);
    if (!user) {
      throw new AppError('INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token.', 401);
    }

    // Rotate: revoke the presented token and issue a brand new one, rather
    // than reusing the same session row indefinitely.
    await revokeSession(this.db, session.id);
    const { accessToken, refreshToken: newRefreshToken } = await this.issueSession(user, meta);
    return { accessToken, refreshToken: newRefreshToken };
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenHash = hashOpaqueToken(token);
    const row = await findUnusedEmailVerificationToken(this.db, tokenHash);

    if (!row || row.expiresAt.getTime() < Date.now()) {
      throw new AppError('INVALID_OR_EXPIRED_TOKEN', 'Invalid or expired verification token.', 422);
    }

    await markEmailVerificationTokenUsed(this.db, row.id);
    await markEmailVerified(this.db, row.userId);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await findUserByEmail(this.db, email);
    // Always returns success regardless of whether the email exists —
    // URL_and_API_Structure.md §5 is explicit about this (prevents
    // enumeration). Only actually issue a token/email if the user exists.
    if (!user) return;

    const { token, hash } = generateOpaqueToken();
    await createPasswordResetToken(this.db, {
      userId: user.id,
      tokenHash: hash,
      expiresAt: addDuration(new Date(), PASSWORD_RESET_TOKEN_TTL_HOURS),
    });

    const resetUrl = `${this.config.appUrl}/reset-password/confirm?token=${token}`;
    await this.emailService.sendPasswordResetEmail(user.email, resetUrl);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashOpaqueToken(token);
    const row = await findUnusedPasswordResetToken(this.db, tokenHash);

    if (!row || row.expiresAt.getTime() < Date.now()) {
      throw new AppError('INVALID_OR_EXPIRED_TOKEN', 'Invalid or expired reset token.', 422);
    }

    const passwordHash = await hashPassword(newPassword);
    await markPasswordResetTokenUsed(this.db, row.id);
    await updatePasswordHash(this.db, row.userId, passwordHash);

    // Session Invalidation Events (Security_Architecture.md §4): a
    // password change invalidates every existing session.
    await revokeAllSessionsForUser(this.db, row.userId);
  }

  async listSessions(userId: string): Promise<SessionRow[]> {
    return listActiveSessionsForUser(this.db, userId);
  }

  async revokeOwnSession(userId: string, sessionId: string): Promise<void> {
    const session = await findSessionById(this.db, sessionId);
    if (!session || session.userId !== userId) {
      throw new AppError('SESSION_NOT_FOUND', 'Session not found.', 404);
    }
    await revokeSession(this.db, sessionId);
  }

  async revokeOtherSessions(userId: string, currentSessionId: string): Promise<number> {
    return revokeAllSessionsForUser(this.db, userId, currentSessionId);
  }

  /** Resolves the JWT's org/role/plan context; null if the user has no organisation yet. */
  async buildAccessTokenPayload(user: UserRow): Promise<{
    sub: string;
    userId: string;
    orgId: string | null;
    orgRole: string | null;
    planTier: string | null;
  }> {
    const orgContext = await findActiveOrgContext(this.db, user.id);
    return {
      sub: user.id,
      userId: user.id,
      orgId: orgContext?.orgId ?? null,
      orgRole: orgContext?.orgRole ?? null,
      planTier: orgContext?.planTier ?? null,
    };
  }

  private async issueEmailVerificationToken(user: UserRow): Promise<void> {
    const { token, hash } = generateOpaqueToken();
    await createEmailVerificationToken(this.db, {
      userId: user.id,
      tokenHash: hash,
      expiresAt: addDuration(new Date(), EMAIL_VERIFICATION_TOKEN_TTL_HOURS),
    });

    const verificationUrl = `${this.config.appUrl}/verify-email?token=${token}`;
    await this.emailService.sendVerificationEmail(user.email, verificationUrl);
  }

  /**
   * Issues an access/refresh token pair for an already-authenticated user.
   * Public so oauth.routes.ts can reuse the exact same session-issuance path
   * after a provider callback resolves to a local user, rather than
   * duplicating token signing/session creation.
   */
  async issueSession(
    user: UserRow,
    meta: RequestMeta,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = await this.buildAccessTokenPayload(user);
    const accessToken = signAccessToken(this.config, payload);

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(this.config.jwt.refreshSecret, refreshToken);

    await createSession(this.db, {
      userId: user.id,
      refreshTokenHash,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      expiresAt: addDuration(new Date(), this.config.jwt.refreshExpiry),
    });

    return { accessToken, refreshToken };
  }
}
