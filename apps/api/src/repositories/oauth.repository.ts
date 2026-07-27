import { type Database, schema } from '@viralscopes/db';
import { and, eq } from 'drizzle-orm';

export type OAuthAccountRow = typeof schema.oauthAccounts.$inferSelect;

export async function findOAuthAccount(
  db: Database,
  provider: string,
  providerUid: string,
): Promise<OAuthAccountRow | undefined> {
  const [row] = await db
    .select()
    .from(schema.oauthAccounts)
    .where(
      and(
        eq(schema.oauthAccounts.provider, provider),
        eq(schema.oauthAccounts.providerUid, providerUid),
      ),
    );
  return row;
}

export async function createOAuthAccount(
  db: Database,
  input: { userId: string; provider: string; providerUid: string },
): Promise<OAuthAccountRow> {
  const [row] = await db.insert(schema.oauthAccounts).values(input).returning();
  return row;
}
