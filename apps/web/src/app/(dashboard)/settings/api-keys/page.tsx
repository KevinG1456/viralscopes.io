'use client';

import { Check, Copy, KeyRound, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';

import { PlanLimitErrorMessage } from '../../../../components/billing/PlanLimitErrorMessage';
import { UpgradeRequiredNotice } from '../../../../components/billing/UpgradeRequiredNotice';
import { EmptyState } from '../../../../components/common/EmptyState';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Spinner } from '../../../../components/ui/spinner';
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '../../../../hooks/use-api-keys';
import { usePlan } from '../../../../hooks/use-billing';
import { ApiClientError } from '../../../../lib/api/client';
import { useToast } from '../../../../providers/ToastProvider';

const PAGE = 1;
const LIMIT = 50;

export default function ApiKeysPage(): React.ReactElement {
  const { data, isLoading, isError, error } = useApiKeys(PAGE, LIMIT);
  const planQuery = usePlan();
  const revokeKey = useRevokeApiKey();
  const { showToast } = useToast();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [revealedKey, setRevealedKey] = React.useState<string | null>(null);

  // Reads the real apiAccess flag from GET /billing/plan (never hard-coded)
  // -- listing/revoking existing keys stays available either way (the
  // backend only gates creation), so only the create action is hidden.
  const canCreateApiKeys = planQuery.data?.limits.apiAccess ?? true;

  async function handleRevoke(id: string, name: string): Promise<void> {
    if (
      !window.confirm(`Revoke API key "${name}"? Anything using it will stop working immediately.`)
    )
      return;
    try {
      await revokeKey.mutateAsync(id);
      showToast({ title: 'API key revoked.', variant: 'success' });
    } catch (err) {
      showToast({
        title: err instanceof ApiClientError ? err.message : 'Failed to revoke API key.',
        variant: 'error',
      });
    }
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
      {canCreateApiKeys ? (
        <div className="flex justify-end">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> New API key
              </Button>
            </DialogTrigger>
            <CreateApiKeyDialog
              onCreated={(key) => setRevealedKey(key)}
              onDone={() => setCreateOpen(false)}
            />
          </Dialog>
        </div>
      ) : (
        <UpgradeRequiredNotice
          title="API access requires Professional or higher"
          description="Upgrade your plan to create API keys. Existing keys below still work until revoked."
        />
      )}

      <RevealKeyDialog apiKey={revealedKey} onClose={() => setRevealedKey(null)} />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : isError ? (
        <EmptyState
          title="Couldn't load API keys"
          description={
            error instanceof ApiClientError ? error.message : 'Please try refreshing the page.'
          }
        />
      ) : data && data.data.length === 0 ? (
        canCreateApiKeys ? (
          <EmptyState
            icon={KeyRound}
            title="No API keys yet"
            description="Create one to access the ViralScopes API programmatically."
          />
        ) : null
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-tertiary">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Key</th>
                  <th className="p-4 font-medium">Last used</th>
                  <th className="p-4 font-medium">Created</th>
                  <th className="p-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {data?.data.map((key) => (
                  <tr key={key.id} className="border-b border-border last:border-0">
                    <td className="p-4 text-text-primary">{key.name}</td>
                    <td className="p-4">
                      <Badge variant="default">{key.keyPrefix}…</Badge>
                    </td>
                    <td className="p-4 text-text-tertiary">
                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-4 text-text-tertiary">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Revoke ${key.name}`}
                        onClick={() => void handleRevoke(key.id, key.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CreateApiKeyDialog({
  onCreated,
  onDone,
}: {
  onCreated: (key: string) => void;
  onDone: () => void;
}): React.ReactElement {
  const createKey = useCreateApiKey();
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState<unknown>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    try {
      const created = await createKey.mutateAsync({ name });
      setName('');
      onDone();
      onCreated(created.key);
    } catch (err) {
      setError(err);
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New API key</DialogTitle>
      </DialogHeader>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="key-name">Name</Label>
          <Input
            id="key-name"
            required
            placeholder="e.g. Production integration"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <PlanLimitErrorMessage error={error} />
        <DialogFooter>
          <Button type="submit" loading={createKey.isPending}>
            Create
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function RevealKeyDialog({
  apiKey,
  onClose,
}: {
  apiKey: string | null;
  onClose: () => void;
}): React.ReactElement {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy(): Promise<void> {
    if (!apiKey) return;
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={apiKey !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your new API key</DialogTitle>
          <DialogDescription>
            Copy it now -- it won&apos;t be shown again. If you lose it, you&apos;ll need to create
            a new one.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-md border border-border bg-surface-inset p-3">
          <code className="flex-1 overflow-x-auto text-xs text-text-primary">{apiKey}</code>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void handleCopy()}
            aria-label="Copy key"
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
