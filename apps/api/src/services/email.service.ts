import type { FastifyBaseLogger } from 'fastify';

import type { AppEnv } from '../config.js';

// Real transactional email (SendGrid/Resend, 7 templates, SPF/DKIM/DMARC)
// is its own ROADMAP.md Phase 4 deliverable, separate from "Authentication"
// -- and needs a provider account that doesn't exist yet, same category as
// the Coolify/PagerDuty accounts TD-006 already tracks. Logged as TD (see
// PROJECT_STATUS.md) -- not a hidden gap.
export interface EmailService {
  sendVerificationEmail(to: string, verificationUrl: string): Promise<void>;
  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>;
}

// The verification/reset URL contains a single-use bearer token -- logging
// it is logging a secret. This implementation only exists because no real
// email provider is wired in yet, so it deliberately refuses to log the
// token outside development/test, where there is no real provider to fall
// back to and no other way to exercise the flow end-to-end. It must never
// be the EmailService used in staging/production.
export function createLoggingEmailService(logger: FastifyBaseLogger, env: AppEnv): EmailService {
  if (env === 'production' || env === 'staging') {
    throw new Error(
      'createLoggingEmailService must not be used in staging/production — it logs bearer tokens. ' +
        'Wire in a real provider (SendGrid/Resend) before deploying past development/test.',
    );
  }

  return {
    async sendVerificationEmail(to, verificationUrl) {
      logger.warn(
        { to, verificationUrl },
        'EMAIL NOT SENT (no email provider configured — dev/test-only log): verification email',
      );
    },
    async sendPasswordResetEmail(to, resetUrl) {
      logger.warn(
        { to, resetUrl },
        'EMAIL NOT SENT (no email provider configured — dev/test-only log): password reset email',
      );
    },
  };
}
