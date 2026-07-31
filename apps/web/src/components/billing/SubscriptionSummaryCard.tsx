import { PLANS } from '@viralscopes/shared';

import type { CurrentPlanSummary } from '../../types/api';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  active: 'success',
  trialing: 'success',
  past_due: 'warning',
  paused: 'warning',
  canceled: 'error',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Renders exactly what the backend returns (BillingService.getCurrentPlanSummary)
// -- no client-side derivation of plan/status. A free org with no real
// subscription row still gets a coherent summary because the backend
// already synthesizes one (billingProvider: 'manual'); this component
// doesn't need its own "no subscription" branch as a result.
export function SubscriptionSummaryCard({
  summary,
  canManage,
  onManage,
  managePending,
}: {
  summary: CurrentPlanSummary;
  canManage: boolean;
  onManage: () => void;
  managePending: boolean;
}): React.ReactElement {
  const planName = PLANS[summary.plan]?.displayName ?? summary.plan;
  const statusVariant = STATUS_VARIANT[summary.status] ?? 'default';
  const hasBillingAccount = summary.billingProvider !== 'manual';

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle>Current plan</CardTitle>
          <CardDescription>Your organisation&apos;s active subscription.</CardDescription>
        </div>
        {canManage && hasBillingAccount ? (
          <Button variant="outline" onClick={onManage} loading={managePending}>
            Manage subscription
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary">{planName}</Badge>
          <Badge variant={statusVariant}>{summary.status.replace('_', ' ')}</Badge>
          {summary.cancelAtPeriodEnd ? (
            <Badge variant="warning">Cancels at period end</Badge>
          ) : null}
        </div>

        {summary.gracePeriodEndsAt ? (
          <div className="rounded-md border border-warning-border bg-warning-subtle p-3 text-sm text-warning">
            Your last payment failed. Please update your payment method before{' '}
            {formatDate(summary.gracePeriodEndsAt)} to avoid losing access.
          </div>
        ) : null}

        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="flex flex-col gap-0.5">
            <dt className="text-text-tertiary">Billing cycle</dt>
            <dd className="text-text-primary capitalize">{summary.billingCycle ?? 'N/A'}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-text-tertiary">
              {summary.cancelAtPeriodEnd ? 'Access ends' : 'Renews'}
            </dt>
            <dd className="text-text-primary">{formatDate(summary.currentPeriodEnd)}</dd>
          </div>
        </dl>

        {!hasBillingAccount ? (
          <p className="text-xs text-text-tertiary">
            No billing account on file yet -- upgrade below to start a subscription.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
