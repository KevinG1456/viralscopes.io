import bcrypt from 'bcryptjs';

import { isCommonPassword } from './common-passwords.js';
import { AppError } from './errors.js';

// bcryptjs (pure JS), not native `bcrypt`: the Dockerfile.api base image
// (node:22-alpine) has no build toolchain, and native bcrypt needs one to
// compile against musl libc when no prebuilt binary matches. bcryptjs
// implements the identical algorithm and is a drop-in for the cost-12
// requirement in Security_Architecture.md §2.
const BCRYPT_COST = 12;
const MIN_LENGTH = 10;
const MAX_LENGTH = 128;

export function validatePasswordStrength(plaintext: string): void {
  if (plaintext.length < MIN_LENGTH) {
    throw new AppError(
      'PASSWORD_TOO_SHORT',
      `Password must be at least ${MIN_LENGTH} characters.`,
      422,
    );
  }
  if (plaintext.length > MAX_LENGTH) {
    throw new AppError(
      'PASSWORD_TOO_LONG',
      `Password must be at most ${MAX_LENGTH} characters.`,
      422,
    );
  }
  if (isCommonPassword(plaintext)) {
    throw new AppError(
      'PASSWORD_TOO_COMMON',
      'This password is too common. Please choose a different one.',
      422,
    );
  }
}

export async function hashPassword(plaintext: string): Promise<string> {
  validatePasswordStrength(plaintext);
  return bcrypt.hash(plaintext, BCRYPT_COST);
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}
