'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { Spinner } from '../components/ui/spinner';
import { ROUTES } from '../lib/routes';
import { useAuth } from '../providers/AuthProvider';

// Instant redirect, never a landing page of its own -- mirrors
// (dashboard)/layout.tsx's own auth-gate pattern. Waits for AuthProvider's
// refresh-on-mount (the httpOnly refresh-token cookie) to resolve, then
// sends the user to /home if it succeeded or /login if it didn't. Previously
// this was the unmodified Phase 1 scaffold splash screen -- never wired up
// once real pages existed from Phase 4 onward.
export default function RootPage(): React.ReactElement {
  const { status } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'authenticated') {
      router.replace(ROUTES.home);
    } else if (status === 'unauthenticated') {
      router.replace(ROUTES.auth.login);
    }
  }, [status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner />
    </div>
  );
}
