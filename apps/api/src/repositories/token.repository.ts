import { type Database, schema } from '@viralscopes/db';
import { and, eq, isNull } from 'drizzle-orm';

export async function createEmailVerificationToken(
  db: Database,
  input: { userId: string; tokenHash: string; expiresAt: Date },
): Promise<void> {
  await db.insert(schema.emailVerificationTokens).values(input);
}

export type EmailVerificationTokenRow = typeof schema.emailVerificationTokens.$inferSelect;
export type PasswordResetTokenRow = typeof schema.passwordResetTokens.$inferSelect;

export async function findUnusedEmailVerificationToken(
  db: Database,
  tokenHash: string,
): Promise<EmailVerificationTokenRow | undefined> {
  const [row] = await db
    .select()
    .from(schema.emailVerificationTokens)
    .where(
      and(
        eq(schema.emailVerificationTokens.tokenHash, tokenHash),
        isNull(schema.emailVerificationTokens.usedAt),
      ),
    );
  return row;
}

export async function markEmailVerificationTokenUsed(db: Database, id: string): Promise<void> {
  await db
    .update(schema.emailVerificationTokens)
    .set({ usedAt: new Date() })
    .where(eq(schema.emailVerificationTokens.id, id));
}

export async function createPasswordResetToken(
  db: Database,
  input: { userId: string; tokenHash: string; expiresAt: Date },
): Promise<void> {
  await db.insert(schema.passwordResetTokens).values(input);
}

export async function findUnusedPasswordResetToken(
  db: Database,
  tokenHash: string,
): Promise<PasswordResetTokenRow | undefined> {
  const [row] = await db
    .select()
    .from(schema.passwordResetTokens)
    .where(
      and(
        eq(schema.passwordResetTokens.tokenHash, tokenHash),
        isNull(schema.passwordResetTokens.usedAt),
      ),
    );
  return row;
}

export async function markPasswordResetTokenUsed(db: Database, id: string): Promise<void> {
  await db
    .update(schema.passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(schema.passwordResetTokens.id, id));
}
