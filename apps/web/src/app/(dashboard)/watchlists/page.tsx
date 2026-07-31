'use client';

import { ListChecks, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';

import { PlanLimitErrorMessage } from '../../../components/billing/PlanLimitErrorMessage';
import { EmptyState } from '../../../components/common/EmptyState';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Spinner } from '../../../components/ui/spinner';
import {
  useCreateWatchlist,
  useDeleteWatchlist,
  useWatchlists,
} from '../../../hooks/use-watchlists';
import { ApiClientError } from '../../../lib/api/client';
import { useToast } from '../../../providers/ToastProvider';
import type { WatchlistType } from '../../../types/api';

const PAGE = 1;
const LIMIT = 50;
const WATCHLIST_TYPES: WatchlistType[] = ['channel', 'keyword', 'niche', 'competitor'];

export default function WatchlistsPage(): React.ReactElement {
  const { data, isLoading, isError, error } = useWatchlists(PAGE, LIMIT);
  const deleteWatchlist = useDeleteWatchlist(PAGE, LIMIT);
  const { showToast } = useToast();
  const [createOpen, setCreateOpen] = React.useState(false);

  async function handleDelete(id: string, name: string): Promise<void> {
    if (!window.confirm(`Delete watchlist "${name}"? This can't be undone.`)) return;
    try {
      await deleteWatchlist.mutateAsync(id);
      showToast({ title: 'Watchlist deleted.', variant: 'success' });
    } catch (err) {
      showToast({
        title: err instanceof ApiClientError ? err.message : 'Failed to delete watchlist.',
        variant: 'error',
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Watchlists</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> New watchlist
            </Button>
          </DialogTrigger>
          <CreateWatchlistDialog onDone={() => setCreateOpen(false)} />
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : isError ? (
        <EmptyState
          title="Couldn't load watchlists"
          description={
            error instanceof ApiClientError ? error.message : 'Please try refreshing the page.'
          }
        />
      ) : data && data.data.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No watchlists yet"
          description="Create one to start monitoring a channel, keyword, niche, or competitor."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-tertiary">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Target</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {data?.data.map((w) => (
                  <tr key={w.id} className="border-b border-border last:border-0">
                    <td className="p-4 text-text-primary">{w.name}</td>
                    <td className="p-4">
                      <Badge>{w.type}</Badge>
                    </td>
                    <td className="p-4 text-text-secondary">{w.target}</td>
                    <td className="p-4">
                      <Badge variant={w.isActive ? 'success' : 'default'}>
                        {w.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${w.name}`}
                        onClick={() => void handleDelete(w.id, w.name)}
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

function CreateWatchlistDialog({ onDone }: { onDone: () => void }): React.ReactElement {
  const createWatchlist = useCreateWatchlist();
  const { showToast } = useToast();
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<WatchlistType>('keyword');
  const [target, setTarget] = React.useState('');
  const [error, setError] = React.useState<unknown>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    try {
      await createWatchlist.mutateAsync({ name, type, target });
      showToast({ title: 'Watchlist created.', variant: 'success' });
      setName('');
      setTarget('');
      onDone();
    } catch (err) {
      setError(err);
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New watchlist</DialogTitle>
      </DialogHeader>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="wl-name">Name</Label>
          <Input id="wl-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="wl-type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as WatchlistType)}>
            <SelectTrigger id="wl-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WATCHLIST_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="wl-target">Target</Label>
          <Input
            id="wl-target"
            required
            placeholder="Channel URL, keyword, or niche name"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>
        <PlanLimitErrorMessage error={error} />
        <DialogFooter>
          <Button type="submit" loading={createWatchlist.isPending}>
            Create
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
