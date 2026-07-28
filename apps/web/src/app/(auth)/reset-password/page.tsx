'use client';

import Link from 'next/link';
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
import * as authApi from '../../../lib/api/auth';

export default function ResetPasswordRequestPage(): React.ReactElement {
  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
    } finally {
      // Always show the same message regardless of outcome -- matches the
      // backend's deliberately generic response, avoiding email enumeration.
      setSubmitting(false);
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>If that email exists, a reset link has been sent.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="text-sm text-text-link hover:underline">
            Back to log in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription>We&apos;ll email you a link to reset your password.</CardDescription>
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
          <Button type="submit" loading={submitting} className="w-full">
            Send reset link
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-text-secondary">
          <Link href="/login" className="text-text-link hover:underline">
            Back to log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
