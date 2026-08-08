import { type Database, schema, withTenant } from '@viralscopes/db';
import { and, eq, isNull, lt, ne } from 'drizzle-orm';

// Phase 10 Milestone 5 (GDPR right to access / right to deletion).

export interface OwnedOrgWithMemberCount {
  orgId: string;
  name: string;
  memberCount: number;
}

// Guards DELETE /api/v1/account against orphaning teammates: refuses
// deletion if the requester is the owner of an organisation that has other
// members, since transferring ownership is TD-011 (Organisation & Workspace
// Management) territory -- not yet built, and out of this milestone's
// scope to build now. An org the user owns *alone* (no other members) is
// not blocked -- there's nobody left to orphan.
export async function listOwnedOrgsWithOtherMembers(
  db: Database,
  userId: string,
): Promise<OwnedOrgWithMemberCount[]> {
  const owned = await db
    .select({ id: schema.organizations.id, name: schema.organizations.name })
    .from(schema.organizations)
    .where(and(eq(schema.organizations.ownerId, userId), isNull(schema.organizations.deletedAt)));

  const result: OwnedOrgWithMemberCount[] = [];
  for (const org of owned) {
    const members = await db
      .select({ id: schema.organizationMembers.id })
      .from(schema.organizationMembers)
      .where(
        and(
          eq(schema.organizationMembers.orgId, org.id),
          ne(schema.organizationMembers.userId, userId),
        ),
      );
    if (members.length > 0) {
      result.push({ orgId: org.id, name: org.name, memberCount: members.length });
    }
  }
  return result;
}

// Immediate PII scrub -- see users.ts's `deletedAt` column and this
// milestone's own migration-free design (no schema change needed, the
// soft-delete column already existed). Email is replaced with a
// deterministic, unique, non-PII value rather than NULL so the unique
// index (`uq_users_email ... WHERE deleted_at IS NULL`) stays satisfied
// and the real address can never be recovered from this row again.
export async function scrubAndSoftDeleteUser(db: Database, userId: string): Promise<void> {
  await db
    .update(schema.users)
    .set({
      email: `deleted-${userId}@deleted.invalid`,
      name: null,
      avatarUrl: null,
      passwordHash: null,
      deletedAt: new Date(),
    })
    .where(eq(schema.users.id, userId));
}

export async function deleteOAuthAccountsForUser(db: Database, userId: string): Promise<void> {
  await db.delete(schema.oauthAccounts).where(eq(schema.oauthAccounts.userId, userId));
}

export async function deleteSessionsForUser(db: Database, userId: string): Promise<void> {
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
}

// 30-day purge job (lib/privacy-maintenance-queue.ts): PII is already gone
// the moment scrubAndSoftDeleteUser() ran, so this is a best-effort attempt
// to physically remove the now-anonymous tombstone row. Several tables
// reference users.id WITHOUT ON DELETE CASCADE (watchlists, alert_rules,
// api_keys, organizations.owner_id) -- a real, active account almost
// always still has at least one of these, so the DELETE will frequently
// fail with a foreign-key violation. That's expected and safe: the row
// holds no PII to begin with by this point, so leaving the anonymised
// tombstone in place indefinitely is not a compliance gap, just a
// physical-storage one. Errors are caught per-row so one un-purgeable
// account never blocks the rest of the batch.
export async function purgeSoftDeletedUsers(
  db: Database,
  olderThan: Date,
): Promise<{ purged: number; retained: number }> {
  const candidates = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(and(lt(schema.users.deletedAt, olderThan)));

  let purged = 0;
  let retained = 0;
  for (const { id } of candidates) {
    try {
      await db.delete(schema.users).where(eq(schema.users.id, id));
      purged += 1;
    } catch {
      // Foreign-key violation (still-referenced by watchlists/alert_rules/
      // api_keys/organizations) -- leave the already-PII-free tombstone.
      retained += 1;
    }
  }
  return { purged, retained };
}

export interface AccountExportData {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    emailVerified: boolean;
    createdAt: Date;
  };
  organizationMemberships: Array<{
    orgId: string;
    orgName: string;
    role: string;
    joinedAt: Date | null;
  }>;
  linkedOAuthAccounts: Array<{ provider: string; linkedAt: Date }>;
  sessions: Array<{
    ipAddress: string | null;
    userAgent: string | null;
    lastUsedAt: Date;
    createdAt: Date;
  }>;
  apiKeys: Array<{
    name: string;
    keyPrefix: string;
    createdAt: Date;
    lastUsedAt: Date | null;
    revokedAt: Date | null;
  }>;
  watchlists: Array<{ name: string; type: string; target: string; createdAt: Date }>;
  alertRules: Array<{ name: string; triggerType: string; createdAt: Date }>;
}

// Scoped to the requester's CURRENT organisation context (the tenant
// passed in, resolved from their JWT) -- this app has no multi-org
// switching yet (TD-011), so in practice a user belongs to exactly one
// organisation at a time today. Documented explicitly rather than silently
// incomplete: if TD-011 ever ships multi-org membership, this export
// should be extended to loop over every org the user belongs to.
export async function getAccountExportData(
  db: Database,
  orgId: string | null,
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    emailVerified: boolean;
    createdAt: Date;
  },
): Promise<AccountExportData> {
  const [oauthAccounts, sessions] = await Promise.all([
    db
      .select({ provider: schema.oauthAccounts.provider, linkedAt: schema.oauthAccounts.createdAt })
      .from(schema.oauthAccounts)
      .where(eq(schema.oauthAccounts.userId, user.id)),
    db
      .select({
        ipAddress: schema.sessions.ipAddress,
        userAgent: schema.sessions.userAgent,
        lastUsedAt: schema.sessions.lastUsedAt,
        createdAt: schema.sessions.createdAt,
      })
      .from(schema.sessions)
      .where(eq(schema.sessions.userId, user.id)),
  ]);

  const orgMembership = orgId
    ? await db
        .select({
          orgId: schema.organizationMembers.orgId,
          orgName: schema.organizations.name,
          role: schema.organizationMembers.role,
          joinedAt: schema.organizationMembers.joinedAt,
        })
        .from(schema.organizationMembers)
        .innerJoin(
          schema.organizations,
          eq(schema.organizations.id, schema.organizationMembers.orgId),
        )
        .where(
          and(
            eq(schema.organizationMembers.userId, user.id),
            eq(schema.organizationMembers.orgId, orgId),
          ),
        )
    : [];

  const [apiKeys, watchlists, alertRules] = orgId
    ? await withTenant(db, { orgId, userId: user.id }, async (tx) => {
        return Promise.all([
          tx
            .select({
              name: schema.apiKeys.name,
              keyPrefix: schema.apiKeys.keyPrefix,
              createdAt: schema.apiKeys.createdAt,
              lastUsedAt: schema.apiKeys.lastUsedAt,
              revokedAt: schema.apiKeys.revokedAt,
            })
            .from(schema.apiKeys)
            .where(eq(schema.apiKeys.createdBy, user.id)),
          tx
            .select({
              name: schema.watchlists.name,
              type: schema.watchlists.type,
              target: schema.watchlists.target,
              createdAt: schema.watchlists.createdAt,
            })
            .from(schema.watchlists)
            .where(
              and(eq(schema.watchlists.createdBy, user.id), isNull(schema.watchlists.deletedAt)),
            ),
          tx
            .select({
              name: schema.alertRules.name,
              triggerType: schema.alertRules.triggerType,
              createdAt: schema.alertRules.createdAt,
            })
            .from(schema.alertRules)
            .where(
              and(eq(schema.alertRules.createdBy, user.id), isNull(schema.alertRules.deletedAt)),
            ),
        ]);
      })
    : [[], [], []];

  return {
    user,
    organizationMemberships: orgMembership,
    linkedOAuthAccounts: oauthAccounts,
    sessions,
    apiKeys,
    watchlists,
    alertRules,
  };
}
