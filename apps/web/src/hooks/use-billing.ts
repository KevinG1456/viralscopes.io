import {
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import * as billingApi from '../lib/api/billing';
import { queryKeys } from '../lib/query-keys';
import type {
  CheckoutSessionResponse,
  CurrentPlanSummary,
  PlanAndLimits,
  PortalSessionResponse,
} from '../types/api';

// Read-only, JWT-derived on the backend (no DB call) -- see
// BillingService.getPlanAndLimits's own comment.
export function usePlan(): UseQueryResult<PlanAndLimits> {
  return useQuery({
    queryKey: queryKeys.billing.plan,
    queryFn: billingApi.getPlan,
    staleTime: 60_000,
  });
}

// Enabled flag lets the caller skip the request entirely for org roles the
// backend would 403 anyway (member) -- see billing/page.tsx's RBAC gate.
export function useSubscription(enabled = true): UseQueryResult<CurrentPlanSummary> {
  return useQuery({
    queryKey: queryKeys.billing.subscription,
    queryFn: billingApi.getSubscription,
    staleTime: 30_000,
    enabled,
  });
}

export function useCreateCheckoutSession(): UseMutationResult<
  CheckoutSessionResponse,
  Error,
  billingApi.CreateCheckoutInput
> {
  return useMutation({ mutationFn: billingApi.createCheckoutSession });
}

export function useCreatePortalSession(): UseMutationResult<PortalSessionResponse, Error, string> {
  return useMutation({ mutationFn: billingApi.createPortalSession });
}
