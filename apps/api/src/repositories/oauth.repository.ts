import { type Database, schema } from '@viralscopes/db';
import { and, eq } from 'drizzle-orm';

import { decrypt, encrypt } from '../lib/encryption.js';

export type OAuthAccountRow = typeof schema.oauthAccounts.$inferSelect;

// F-03 (Phase 10 Milestone 2): access_token/refresh_token are stored
// encrypted (lib/encryption.ts) -- every caller of this repository reads
// and writes plaintext; the encrypt/decrypt round-trip happens only here,
// at the DB boundary, so no other layer needs to know the column is
// ciphertext.
function decryptRow(row: OAuthAccountRow, encryptionKey: Buffer | null): OAuthAccountRow {
  return {
    ...row,
    accessToken: row.accessToken ? decrypt(row.accessToken, encryptionKey) : row.accessToken,
    refreshToken: row.refreshToken ? decrypt(row.refreshToken, encryptionKey) : row.refreshToken,
  };
}

export async function findOAuthAccount(
  db: Database,
  provider: string,
  providerUid: string,
  encryptionKey: Buffer | null,
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
  return row ? decryptRow(row, encryptionKey) : undefined;
}

export async function createOAuthAccount(
  db: Database,
  input: {
    userId: string;
    provider: string;
    providerUid: string;
    accessToken?: string | null;
    refreshToken?: string | null;
    expiresAt?: Date | null;
  },
  encryptionKey: Buffer | null,
): Promise<OAuthAccountRow> {
  const [row] = await db
    .insert(schema.oauthAccounts)
    .values({
      ...input,
      accessToken: input.accessToken ? encrypt(input.accessToken, encryptionKey) : null,
      refreshToken: input.refreshToken ? encrypt(input.refreshToken, encryptionKey) : null,
    })
    .returning();
  return decryptRow(row, encryptionKey);
}
