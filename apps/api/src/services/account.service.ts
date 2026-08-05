import type { Database } from '@viralscopes/db';

import { auditLog } from '../lib/audit-log.js';
import { AppError } from '../lib/errors.js';
import {
  type AccountExportData,
  deleteOAuthAccountsForUser,
  deleteSessionsForUser,
  getAccountExportData,
  listOwnedOrgsWithOtherMembers,
  scrubAndSoftDeleteUser,
} from '../repositories/account.repository.js';
import { revokeAllSessionsForUser } from '../repositories/session.repository.js';
import { findUserById } from '../repositories/user.repository.js';

// Phase 10 Milestone 5 -- Security_Architecture.md §19's GDPR "Right to
// access"/"Right to deletion" requirements. Takes `orgId: string | null`
// directly (not the stricter `TenantContext`) because both actions must
// work for a user who hasn't joined an organisation yet (TD-011) -- org
// scoping only applies to the parts of the export/deletion that are
// actually org-scoped data.
export async function exportAccountData(
  db: Database,
  orgId: string | null,
  userId: string,
): Promise<AccountExportData> {
  const user = await findUserById(db, userId);
  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'User not found.', 404);
  }
  return getAccountExportData(db, orgId, {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  });
}

export async function deleteAccount(
  db: Database,
  orgId: string | null,
  userId: string,
): Promise<void> {
  const blockingOrgs = await listOwnedOrgsWithOtherMembers(db, userId);
  if (blockingOrgs.length > 0) {
    throw new AppError(
      'ACCOUNT_DELETION_BLOCKED_BY_OWNERSHIP',
      'You own an organisation with other members. Transfer ownership or remove the other members before deleting your account.',
      409,
      { organizations: blockingOrgs.map((o) => ({ id: o.orgId, name: o.name })) },
    );
  }

  // Revoke first (marks sessions invalid immediately for anyone mid-request
  // on another device), then hard-delete the rows -- belt and braces,
  // matching the "immediate PII removal" intent rather than relying on
  // only one of the two.
  await revokeAllSessionsForUser(db, userId);
  await deleteSessionsForUser(db, userId);
  await deleteOAuthAccountsForUser(db, userId);
  await scrubAndSoftDeleteUser(db, userId);

  if (orgId) {
    await auditLog(
      db,
      { orgId, userId },
      { userId, action: 'account.deletion_requested', resourceType: 'user', resourceId: userId },
    );
  }
}
