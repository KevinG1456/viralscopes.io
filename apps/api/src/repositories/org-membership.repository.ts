import { type Database, schema } from '@viralscopes/db';
import { eq } from 'drizzle-orm';

export interface ActiveOrgContext {
  orgId: string;
  orgRole: string;
  planTier: string;
}

// A user may belong to multiple organisations; picking "the" active one to
// embed in the JWT is an org-switching concern that belongs to
// Organisation & Workspace Management (later phase, out of Phase 4's
// identity/session/access-control scope). This returns the first
// membership found -- correct for a user with exactly one org (true of
// every account this phase can create, since org creation itself is out
// of scope) and a deliberate simplification otherwise.
export async function findActiveOrgContext(
  db: Database,
  userId: string,
): Promise<ActiveOrgContext | null> {
  const [row] = await db
    .select({
      orgId: schema.organizationMembers.orgId,
      orgRole: schema.organizationMembers.role,
      planTier: schema.organizations.plan,
    })
    .from(schema.organizationMembers)
    .innerJoin(schema.organizations, eq(schema.organizations.id, schema.organizationMembers.orgId))
    .where(eq(schema.organizationMembers.userId, userId))
    .limit(1);

  return row ?? null;
}
