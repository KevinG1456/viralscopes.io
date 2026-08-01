'use client';

import type { SelfServeCheckoutPlan } from '@viralscopes/shared';
import { CreditCard, Receipt } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { PlanComparisonTable } from '../../../../components/billing/PlanComparisonTable';
import { SubscriptionSummaryCard } from '../../../../components/billing/SubscriptionSummaryCard';
import { UsageMeter } from '../../../../components/billing/UsageMeter';
import { EmptyState } from '../../../../components/common/EmptyState';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Spinner } from '../../../../components/ui/spinner';
import { usePlan, useSubscription } from '../../../../hooks/use-billing';
import { useOpenBillingPortal, useStartCheckout } from '../../../../hooks/use-billing-actions';
import { useUsageSummary } from '../../../../hooks/use-usage';
import { useAuth } from '../../../../providers/AuthProvider';
import { useToast } from '../../../../providers/ToastProvider';

function SkeletonBlock({ className }: { className?: string }): React.ReactElement {
  return <div className={`animate-pulse rounded-md bg-surface-inset ${className ?? 'h-32'}`} />;
}

export default function BillingPage(): React.ReactElement {
  const { orgId, orgRole } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Security/RBAC: mirrors the backend exactly (billing.routes.ts --
  // GET /subscription is owner/admin only, POST /checkout and /portal are
  // owner only). Gating the query itself (not just the UI) means a member
  // never even issues the request the backend would 403 anyway.
  const canViewSubscription = orgRole === 'owner' || orgRole === 'admin';
  const canManageBilling = orgRole === 'owner';

  const subscriptionQuery = useSubscription(canViewSubscription);
  const planQuery = usePlan();
  const usageQuery = useUsageSummary();
  const { start: startCheckout, isPending: checkoutPending } = useStartCheckout();
  const { open: openPortal, isPending: portalPending } = useOpenBillingPortal();

  // Stripe's own return flow: successUrl/cancelUrl (set in
  // use-billing-actions.ts) both point back here with a `checkout` query
  // param. Frontend never trusts this as proof the plan changed -- it's
  // just a hint to show a toast and refetch; the webhook (Milestone 3) is
  // the only real source of truth, which is why this only refetches
  // rather than optimistically updating anything.
  React.useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout === 'success') {
      showToast({
        title: 'Checkout complete. Your plan will update once payment is confirmed.',
        variant: 'success',
      });
      void subscriptionQuery.refetch();
      router.replace('/settings/billing');
    } else if (checkout === 'cancelled') {
      showToast({ title: 'Checkout cancelled -- no changes were made.' });
      router.replace('/settings/billing');
    }
    // Deliberately depends only on searchParams -- re-running this on every
    // showToast/subscriptionQuery.refetch identity change would re-fire the
    // toast in a loop.
  }, [searchParams]);

  function handleUpgrade(plan: SelfServeCheckoutPlan): void {
    void startCheckout(plan, 'monthly');
  }

  function handleDowngrade(): void {
    void openPortal();
  }

  if (!orgId) {
    return (
      <EmptyState
        icon={CreditCard}
        title="You're not part of an organisation yet"
        description="Organisation creation isn't available in this environment yet (TD-011 in PROJECT_STATUS.md)."
        className="mt-6"
      />
    );
  }

  if (!canViewSubscription) {
    return (
      <EmptyState
        icon={CreditCard}
        title="You don't have access to billing"
        description="Only organisation owners and admins can view billing details. Ask an owner for access."
        className="mt-6"
      />
    );
  }

  const currentPlan = subscriptionQuery.data?.plan ?? planQuery.data?.plan ?? 'free';

  return (
    <div className="flex flex-col gap-6 pt-2">
      {subscriptionQuery.isLoading ? (
        <SkeletonBlock className="h-48" />
      ) : subscriptionQuery.isError ? (
        <EmptyState
          title="Couldn't load your subscription"
          description="Please try refreshing the page."
        />
      ) : subscriptionQuery.data ? (
        <SubscriptionSummaryCard
          summary={subscriptionQuery.data}
          canManage={canManageBilling}
          onManage={handleDowngrade}
          managePending={portalPending}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Usage this period</CardTitle>
          <CardDescription>Reused from the existing usage-tracking API (Phase 5).</CardDescription>
        </CardHeader>
        <CardContent>
          {usageQuery.isLoading || planQuery.isLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : usageQuery.isError || planQuery.isError ? (
            <EmptyState title="Couldn't load usage" description="Please try refreshing the page." />
          ) : usageQuery.data && planQuery.data ? (
            <div className="flex flex-col gap-4">
              <UsageMeter
                label="Videos analyzed"
                used={usageQuery.data.videosAnalyzed.used}
                limit={usageQuery.data.videosAnalyzed.limit}
              />
              <UsageMeter
                label="Exports"
                used={usageQuery.data.usage.export_created ?? 0}
                limit={planQuery.data.limits.exportsPerMonth}
              />
              <UsageMeter
                label="Alerts"
                used={usageQuery.data.usage.alert_triggered ?? 0}
                limit={planQuery.data.limits.alertsPerMonth}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plans</CardTitle>
          <CardDescription>
            {canManageBilling
              ? 'Upgrade for more capacity, or manage your subscription to downgrade or cancel.'
              : 'Only the organisation owner can change plans.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlanComparisonTable
            currentPlan={currentPlan}
            canManageBilling={canManageBilling}
            onUpgrade={handleUpgrade}
            onDowngrade={handleDowngrade}
            checkoutPending={checkoutPending}
            portalPending={portalPending}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing history</CardTitle>
          <CardDescription>Past invoices and receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Receipt}
            title="Not available yet"
            description="Invoice history isn't exposed by the API yet. View and download invoices from the billing portal in the meantime."
          />
        </CardContent>
      </Card>
    </div>
  );
}
