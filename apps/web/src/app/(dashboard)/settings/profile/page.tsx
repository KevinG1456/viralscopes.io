'use client';

import { Laptop, LogOut } from 'lucide-react';

import { EmptyState } from '../../../../components/common/EmptyState';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Spinner } from '../../../../components/ui/spinner';
import { useDeleteAccount, useExportAccount } from '../../../../hooks/use-account';
import {
  useRevokeOtherSessions,
  useRevokeSession,
  useSessions,
} from '../../../../hooks/use-sessions';
import { ApiClientError } from '../../../../lib/api/client';
import { useAuth } from '../../../../providers/AuthProvider';
import { useToast } from '../../../../providers/ToastProvider';

export default function ProfilePage(): React.ReactElement {
  const { user } = useAuth();
  const { data: sessions, isLoading, isError } = useSessions();
  const revokeSession = useRevokeSession();
  const revokeOthers = useRevokeOtherSessions();
  const exportAccount = useExportAccount();
  const deleteAccount = useDeleteAccount();
  const { showToast } = useToast();

  async function handleRevoke(id: string): Promise<void> {
    try {
      await revokeSession.mutateAsync(id);
      showToast({ title: 'Session revoked.', variant: 'success' });
    } catch (err) {
      showToast({
        title: err instanceof ApiClientError ? err.message : 'Failed to revoke session.',
        variant: 'error',
      });
    }
  }

  async function handleRevokeOthers(): Promise<void> {
    if (!window.confirm('Sign out of all other devices?')) return;
    try {
      const result = await revokeOthers.mutateAsync();
      showToast({
        title: `Signed out of ${result.revokedCount} other session(s).`,
        variant: 'success',
      });
    } catch (err) {
      showToast({
        title: err instanceof ApiClientError ? err.message : 'Failed to sign out other sessions.',
        variant: 'error',
      });
    }
  }

  async function handleExport(): Promise<void> {
    try {
      const data = await exportAccount.mutateAsync();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'viralscopes-account-export.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast({ title: 'Your data export has started downloading.', variant: 'success' });
    } catch (err) {
      showToast({
        title: err instanceof ApiClientError ? err.message : 'Failed to export your data.',
        variant: 'error',
      });
    }
  }

  async function handleDeleteAccount(): Promise<void> {
    if (
      !window.confirm(
        'Delete your account? This immediately removes your personal data and cannot be undone.',
      )
    ) {
      return;
    }
    try {
      await deleteAccount.mutateAsync();
      window.location.href = '/login';
    } catch (err) {
      showToast({
        title: err instanceof ApiClientError ? err.message : 'Failed to delete account.',
        variant: 'error',
      });
    }
  }

  return (
    <div className="flex flex-col gap-6 pt-2">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Name</span>
            <span className="text-text-primary">{user?.name ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Email</span>
            <span className="text-text-primary">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Email verified</span>
            <Badge variant={user?.emailVerified ? 'success' : 'warning'}>
              {user?.emailVerified ? 'Verified' : 'Unverified'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Active sessions</CardTitle>
            <CardDescription>Devices currently signed in to your account.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void handleRevokeOthers()}>
            <LogOut className="h-4 w-4" /> Sign out other devices
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : isError || !sessions || sessions.length === 0 ? (
            <EmptyState icon={Laptop} title="No active sessions found" />
          ) : (
            <ul className="flex flex-col gap-3">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="text-text-primary">
                      {s.userAgent ?? 'Unknown device'}{' '}
                      {s.isCurrent ? <Badge variant="primary">This device</Badge> : null}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {s.ipAddress ?? 'Unknown IP'} · last used{' '}
                      {new Date(s.lastUsedAt).toLocaleString()}
                    </span>
                  </div>
                  {!s.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void handleRevoke(s.id)}
                      aria-label="Revoke session"
                    >
                      Revoke
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy &amp; data</CardTitle>
          <CardDescription>
            Download a copy of your personal data, or permanently delete your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => void handleExport()}
            loading={exportAccount.isPending}
          >
            Download my data
          </Button>
          <Button
            variant="outline"
            className="text-error hover:bg-error/10"
            onClick={() => void handleDeleteAccount()}
            loading={deleteAccount.isPending}
          >
            Delete my account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
