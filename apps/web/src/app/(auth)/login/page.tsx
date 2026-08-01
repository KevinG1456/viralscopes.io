'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { ApiClientError } from '../../../lib/api/client';
import { useAuth } from '../../../providers/AuthProvider';

// Phase 10 Milestone 3: `from` is attacker-controlled (a query param, not
// just something proxy.ts itself sets) -- confirmed via next.js's own
// router source (router-reducer/reducers/navigate-reducer.js) that
// `router.push()` on an external URL performs a real MPA (full browser)
// navigation, not merely an internal route transition. `?from=https://
// evil.example` would silently redirect a user straight off the app
// immediately after a successful login -- a real post-login open
// redirect, not a theoretical one. Only same-app relative paths are
// accepted; `//` and `/\` are both rejected too, since browsers can
// normalise either into a protocol-relative external URL, bypassing a
// naive `.startsWith('/')` check.
function safeRedirectTarget(value: string | null): string {
  if (!value || !/^\/(?!\/|\\)/.test(value)) return '/home';
  return value;
}

export default function LoginPage(): React.ReactElement {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push(safeRedirectTarget(searchParams.get('from')));
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Welcome back to ViralScopes.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/reset-password" className="text-xs text-text-link hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-error">{error}</p> : null}
          <Button type="submit" loading={submitting} className="w-full">
            Log in
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-text-link hover:underline">
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
