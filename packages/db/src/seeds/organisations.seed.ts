import { and, eq, isNull, sql, type InferSelectModel } from 'drizzle-orm';

import type { Database } from '../client.js';
import { organizations, organizationMembers, workspaces } from '../schema/index.js';
import type { users } from '../schema/index.js';

type SeededUsers = {
  admin?: InferSelectModel<typeof users>;
  member?: InferSelectModel<typeof users>;
};

/** One dev organisation, owned by the seeded admin, with the seeded member attached. */
export async function seedOrganisations(
  db: Database,
  seededUsers: SeededUsers,
): Promise<InferSelectModel<typeof organizations>> {
  if (!seededUsers.admin) {
    throw new Error('seedUsers must run before seedOrganisations');
  }

  const [inserted] = await db
    .insert(organizations)
    .values({
      name: 'Dev Organisation',
      slug: 'dev-organisation',
      ownerId: seededUsers.admin.id,
      plan: 'professional',
    })
    .onConflictDoNothing({
      target: organizations.slug,
      where: sql`${organizations.deletedAt} IS NULL`,
    })
    .returning();

  const org =
    inserted ??
    (
      await db
        .select()
        .from(organizations)
        .where(and(eq(organizations.slug, 'dev-organisation'), isNull(organizations.deletedAt)))
    )[0];

  if (!org) {
    throw new Error(
      'Seed insert for dev-organisation conflicted, but no active row was found on fallback lookup.',
    );
  }

  if (seededUsers.member) {
    await db
      .insert(organizationMembers)
      .values([
        { orgId: org.id, userId: seededUsers.admin.id, role: 'owner', joinedAt: new Date() },
        { orgId: org.id, userId: seededUsers.member.id, role: 'member', joinedAt: new Date() },
      ])
      .onConflictDoNothing();

    await db
      .insert(workspaces)
      .values({ orgId: org.id, name: 'Default Workspace' })
      .onConflictDoNothing({
        target: [workspaces.orgId, workspaces.name],
        where: sql`${workspaces.deletedAt} IS NULL`,
      });
  }

  return org;
}
