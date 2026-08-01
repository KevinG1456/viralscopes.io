'use client';

import { Bell, Plus, Trash2 } from 'lucide-react';
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
import { Switch } from '../../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  useAlertEvents,
  useAlertRules,
  useCreateAlertRule,
  useDeleteAlertRule,
  useUpdateAlertRule,
} from '../../../hooks/use-alerts';
import { useWatchlists } from '../../../hooks/use-watchlists';
import { ApiClientError } from '../../../lib/api/client';
import { useToast } from '../../../providers/ToastProvider';
import type { AlertEventStatus, AlertTriggerType } from '../../../types/api';

const PAGE = 1;
const LIMIT = 50;
const TRIGGER_TYPES: AlertTriggerType[] = [
  'viral_score_threshold',
  'trend_spike',
  'channel_upload',
  'breakout_prediction',
];

const EVENT_BADGE_VARIANT: Record<AlertEventStatus, 'success' | 'error' | 'warning'> = {
  sent: 'success',
  failed: 'error',
  throttled: 'warning',
};

export default function AlertsPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-text-primary">Alerts</h1>
      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="rules">
          <RulesTab />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RulesTab(): React.ReactElement {
  const { data, isLoading, isError, error } = useAlertRules(PAGE, LIMIT);
  const updateRule = useUpdateAlertRule();
  const deleteRule = useDeleteAlertRule();
  const { showToast } = useToast();
  const [createOpen, setCreateOpen] = React.useState(false);

  async function handleToggle(id: string, isActive: boolean): Promise<void> {
    try {
      await updateRule.mutateAsync({ id, input: { isActive } });
    } catch (err) {
      showToast({
        title: err instanceof ApiClientError ? err.message : 'Failed to update rule.',
        variant: 'error',
      });
    }
  }

  async function handleDelete(id: string, name: string): Promise<void> {
    if (!window.confirm(`Delete alert rule "${name}"? This can't be undone.`)) return;
    try {
      await deleteRule.mutateAsync(id);
      showToast({ title: 'Alert rule deleted.', variant: 'success' });
    } catch (err) {
      showToast({
        title: err instanceof ApiClientError ? err.message : 'Failed to delete rule.',
        variant: 'error',
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> New rule
            </Button>
          </DialogTrigger>
          <CreateAlertRuleDialog onDone={() => setCreateOpen(false)} />
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : isError ? (
        <EmptyState
          title="Couldn't load alert rules"
          description={
            error instanceof ApiClientError ? error.message : 'Please try refreshing the page.'
          }
        />
      ) : data && data.data.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No alert rules yet"
          description="Create one to get notified automatically."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-tertiary">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Trigger</th>
                  <th className="p-4 font-medium">Threshold</th>
                  <th className="p-4 font-medium">Active</th>
                  <th className="p-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {data?.data.map((rule) => (
                  <tr key={rule.id} className="border-b border-border last:border-0">
                    <td className="p-4 text-text-primary">{rule.name}</td>
                    <td className="p-4">
                      <Badge>{rule.triggerType}</Badge>
                    </td>
                    <td className="p-4 text-text-secondary">{rule.thresholdValue ?? '—'}</td>
                    <td className="p-4">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(checked) => void handleToggle(rule.id, checked)}
                        aria-label={`Toggle ${rule.name}`}
                      />
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${rule.name}`}
                        onClick={() => void handleDelete(rule.id, rule.name)}
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

function HistoryTab(): React.ReactElement {
  const { data, isLoading, isError } = useAlertEvents(PAGE, LIMIT);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }
  if (isError || !data || data.data.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No alert history yet"
        description="Dispatched alerts will appear here."
      />
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-tertiary">
              <th className="p-4 font-medium">Trigger</th>
              <th className="p-4 font-medium">Channel</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((event) => (
              <tr key={event.id} className="border-b border-border last:border-0">
                <td className="p-4 text-text-primary">{event.triggerType}</td>
                <td className="p-4 text-text-secondary">{event.deliveryChannel}</td>
                <td className="p-4">
                  <Badge variant={EVENT_BADGE_VARIANT[event.status]}>{event.status}</Badge>
                </td>
                <td className="p-4 text-text-tertiary">
                  {new Date(event.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function CreateAlertRuleDialog({ onDone }: { onDone: () => void }): React.ReactElement {
  const createRule = useCreateAlertRule();
  const { data: watchlists } = useWatchlists(1, 100);
  const { showToast } = useToast();
  const [name, setName] = React.useState('');
  const [triggerType, setTriggerType] = React.useState<AlertTriggerType>('viral_score_threshold');
  const [thresholdValue, setThresholdValue] = React.useState('');
  const [watchlistId, setWatchlistId] = React.useState<string>('');
  const [error, setError] = React.useState<unknown>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    try {
      await createRule.mutateAsync({
        name,
        triggerType,
        thresholdValue: thresholdValue ? Number(thresholdValue) : null,
        watchlistId: watchlistId || null,
      });
      showToast({ title: 'Alert rule created.', variant: 'success' });
      setName('');
      setThresholdValue('');
      onDone();
    } catch (err) {
      setError(err);
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>New alert rule</DialogTitle>
      </DialogHeader>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rule-name">Name</Label>
          <Input id="rule-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rule-trigger">Trigger</Label>
          <Select value={triggerType} onValueChange={(v) => setTriggerType(v as AlertTriggerType)}>
            <SelectTrigger id="rule-trigger">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRIGGER_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rule-threshold">Threshold (optional)</Label>
          <Input
            id="rule-threshold"
            type="number"
            min={0}
            max={100}
            value={thresholdValue}
            onChange={(e) => setThresholdValue(e.target.value)}
          />
        </div>
        {watchlists && watchlists.data.length > 0 ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="rule-watchlist">Watchlist (optional)</Label>
            <Select value={watchlistId} onValueChange={setWatchlistId}>
              <SelectTrigger id="rule-watchlist">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {watchlists.data.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        <PlanLimitErrorMessage error={error} />
        <DialogFooter>
          <Button type="submit" loading={createRule.isPending}>
            Create
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
