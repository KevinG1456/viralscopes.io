import type { BillingCycle, SelfServeCheckoutPlan } from '@viralscopes/shared';

import { apiRequest } from './client';
import type {
  CheckoutSessionResponse,
  CurrentPlanSummary,
  PlanAndLimits,
  PortalSessionResponse,
} from '../../types/api';

export async function getPlan(): Promise<PlanAndLimits> {
  const { data } = await apiRequest<PlanAndLimits>('/api/v1/billing/plan');
  return data;
}

export async function getSubscription(): Promise<CurrentPlanSummary> {
  const { data } = await apiRequest<CurrentPlanSummary>('/api/v1/billing/subscription');
  return data;
}

export interface CreateCheckoutInput {
  plan: SelfServeCheckoutPlan;
  billingCycle: BillingCycle;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(
  input: CreateCheckoutInput,
): Promise<CheckoutSessionResponse> {
  const { data } = await apiRequest<CheckoutSessionResponse>('/api/v1/billing/checkout', {
    method: 'POST',
    body: input,
  });
  return data;
}

export async function createPortalSession(returnUrl: string): Promise<PortalSessionResponse> {
  const { data } = await apiRequest<PortalSessionResponse>('/api/v1/billing/portal', {
    method: 'POST',
    body: { returnUrl },
  });
  return data;
}
