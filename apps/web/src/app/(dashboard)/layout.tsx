'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { AppShell } from '../../components/layout/AppShell';
import { Spinner } from '../../components/ui/spinner';
import { ROUTES } from '../../lib/routes';
import { useAuth } from '../../providers/AuthProvider';

// The real auth gate (proxy.ts's csrf_token-presence check is only a UX
// heuristic to avoid flashing the shell to a browser with no session at
// all -- see its own comment). This is authoritative on the client: it
// waits for AuthProvider's refresh-on-mount to resolve, then redirects to
// /login if it didn't succeed. The API remains the actual security
// boundary regardless (Frontend_Architecture.md section 8).
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const { status } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(ROUTES.auth.login);
    }
  }, [status, router]);

  if (status !== 'authenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
