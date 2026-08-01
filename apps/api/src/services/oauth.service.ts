import type { Database } from '@viralscopes/db';

import { AppError } from '../lib/errors.js';
import type { OAuthProfile } from '../lib/oauth-profile.js';
import { createOAuthAccount, findOAuthAccount } from '../repositories/oauth.repository.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  markEmailVerified,
  type UserRow,
} from '../repositories/user.repository.js';

/**
 * Resolves an OAuth profile to a local user: reuses an existing linked
 * account, links the provider to an existing email/password account, or
 * creates a brand new user. The provider has already verified the email
 * address (that's what the OAuth flow is), so a new account is created
 * with `emailVerified: true` and no password hash -- matching
 * Database_Schema.md's "NULL for OAuth-only accounts" note on
 * `users.password_hash`.
 *
 * Account-linking policy (DEC-016, PROJECT_STATUS.md §11 /
 * Security_Architecture.md §5 "Account Linking Policy"): an OAuth identity
 * is only ever auto-linked to an existing local account whose email is
 * ALREADY verified. An unverified existing row means nobody has ever
 * proven they control that mailbox -- it may be a password an unrelated
 * party set on a pre-registered account they don't own (the "attacker
 * pre-registers victim@example.com, victim later signs in with Google"
 * pre-hijack pattern). Auto-linking on email match alone would silently
 * hand the real owner's identity to whatever password that other party
 * chose. Instead, the OAuth attempt is refused with a distinct error, and
 * the real owner reclaims the account explicitly through the existing
 * password-reset flow (which emails a reset link to the mailbox they've
 * just proven, via the OAuth provider, that they control) -- an
 * intentional, explicit linking action rather than an implicit one.
 */
export async function findOrCreateUserFromOAuth(
  db: Database,
  provider: 'google' | 'github',
  profile: OAuthProfile,
  encryptionKey: Buffer | null,
): Promise<{ user: UserRow; isNewUser: boolean }> {
  const existingLink = await findOAuthAccount(db, provider, profile.providerUid, encryptionKey);
  if (existingLink) {
    const user = await findUserById(db, existingLink.userId);
    if (!user) {
      throw new Error(`oauth_accounts row ${existingLink.id} references a missing user`);
    }
    return { user, isNewUser: false };
  }

  const existingUser = await findUserByEmail(db, profile.email);
  if (existingUser) {
    if (!existingUser.emailVerified) {
      throw new AppError(
        'OAUTH_ACCOUNT_REQUIRES_VERIFICATION',
        'An account with this email already exists but has not been verified yet. ' +
          'Use "Forgot password" to reset it and sign in, or check your inbox for the original verification email.',
        409,
      );
    }

    await createOAuthAccount(
      db,
      { userId: existingUser.id, provider, providerUid: profile.providerUid },
      encryptionKey,
    );
    return { user: existingUser, isNewUser: false };
  }

  const newUser = await createUser(db, {
    email: profile.email,
    name: profile.name ?? profile.email,
    passwordHash: null,
  });
  await markEmailVerified(db, newUser.id);
  await createOAuthAccount(
    db,
    { userId: newUser.id, provider, providerUid: profile.providerUid },
    encryptionKey,
  );

  return { user: { ...newUser, emailVerified: true }, isNewUser: true };
}
