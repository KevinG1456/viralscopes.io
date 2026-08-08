'use client';

import Link from 'next/link';
import * as React from 'react';

import { Button } from '../ui/button';

// Phase 10 Milestone 5 -- Security_Architecture.md §19's documented
// "Consent" row: a cookie consent banner, but no non-essential cookies
// exist anywhere in this app yet (`refresh_token`/`csrf_token` are
// strictly necessary; no analytics cookie has ever been added). This
// banner is therefore disclosure, not a technical gate on anything real --
// there is nothing non-essential to block. Accept/Reject both simply
// record the visitor's expressed preference in `cookie_consent`; neither
// choice currently changes any app behaviour, since there's nothing to
// turn on or off yet.
const CONSENT_COOKIE_NAME = 'cookie_consent';
const CONSENT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year, matches Security_Architecture.md's cookie table

function readConsentCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeConsentCookie(value: 'accepted' | 'rejected'): void {
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function CookieConsentBanner(): React.ReactElement | null {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    setVisible(readConsentCookie() === null);
  }, []);

  if (!visible) return null;

  function respond(choice: 'accepted' | 'rejected'): void {
    writeConsentCookie(choice);
    setVisible(false);
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface-elevated p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          We use strictly necessary cookies to keep you signed in and to protect your account. We
          don&apos;t use any analytics or advertising cookies today. See our{' '}
          <Link href="/privacy" className="text-text-link hover:underline">
            Privacy Policy
          </Link>{' '}
          for details.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => respond('rejected')}>
            Reject
          </Button>
          <Button size="sm" onClick={() => respond('accepted')}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
