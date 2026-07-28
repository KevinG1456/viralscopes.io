'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Spinner } from '../../../components/ui/spinner';
import * as authApi from '../../../lib/api/auth';
import { ApiClientError } from '../../../lib/api/client';

type Status = 'verifying' | 'success' | 'error';

export default function VerifyEmailPage(): React.ReactElement {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = React.useState<Status>('verifying');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('This verification link is missing a token.');
      return;
    }
    void authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err: unknown) => {
        setStatus('error');
        setError(
          err instanceof ApiClientError ? err.message : 'This link is invalid or has expired.',
        );
      });
  }, [token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email verification</CardTitle>
        {status === 'verifying' ? <CardDescription>Verifying your email...</CardDescription> : null}
        {status === 'success' ? <CardDescription>Your email is verified.</CardDescription> : null}
        {status === 'error' ? <CardDescription>{error}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {status === 'verifying' ? <Spinner /> : null}
        {status === 'success' ? (
          <Link href="/login" className="text-sm text-text-link hover:underline">
            Continue to log in
          </Link>
        ) : null}
        {status === 'error' ? (
          <Link href="/register" className="text-sm text-text-link hover:underline">
            Back to registration
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
