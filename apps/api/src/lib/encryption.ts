import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

// Phase 10 Milestone 2, finding F-03: Security_Architecture.md §7 documents
// application-level AES-256-GCM encryption for oauth_accounts'
// access_token/refresh_token columns; no such code existed until now. IV
// and auth tag are per-value (never reused), matching the documented
// `iv:authTag:ciphertext` (base64) format exactly.
const ALGORITHM = 'aes-256-gcm';

function loadKey(encryptionKey: Buffer | null): Buffer {
  if (!encryptionKey) {
    throw new Error(
      'DB_ENCRYPTION_KEY is not configured -- cannot encrypt/decrypt a sensitive column value.',
    );
  }
  return encryptionKey;
}

export function encrypt(plaintext: string, encryptionKey: Buffer | null): string {
  const key = loadKey(encryptionKey);
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decrypt(ciphertext: string, encryptionKey: Buffer | null): string {
  const key = loadKey(encryptionKey);
  const [ivB64, authTagB64, dataB64] = ciphertext.split(':');
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error('Malformed ciphertext -- expected "iv:authTag:data" (base64 each).');
  }
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}
