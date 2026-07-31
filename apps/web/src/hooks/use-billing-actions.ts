import type { BillingCycle, SelfServeCheckoutPlan } from '@viralscopes/shared';
import * as React from 'react';

import { useCreateCheckoutSession, useCreatePortalSession } from './use-billing';
import { ApiClientError } from '../lib/api/client';
import { useToast } from '../providers/ToastProvider';

// Shared redirect-to-Stripe pattern for both checkout and the billing
// portal: create the session server-side, then hand the whole tab over to
// Stripe's own hosted page. No payment logic lives here or anywhere in the
// frontend -- this only ever forwards a URL the backend already validated
// and created (Architecture Rules: "Never duplicate backend business logic").
export interface StartCheckout {
  start: (plan: SelfServeCheckoutPlan, billingCycle: BillingCycle) => Promise<void>;
  isPending: boolean;
}

export function useStartCheckout(): StartCheckout {
  const mutation = useCreateCheckoutSession();
  const { showToast } = useToast();

  const start = React.useCallback(
    async (plan: SelfServeCheckoutPlan, billingCycle: BillingCycle) => {
      const origin = window.location.origin;
      try {
        const result = await mutation.mutateAsync({
          plan,
          billingCycle,
          successUrl: `${origin}/settings/billing?checkout=success`,
          cancelUrl: `${origin}/settings/billing?checkout=cancelled`,
        });
        window.location.href = result.checkoutUrl;
      } catch (err) {
        showToast({
          title: err instanceof ApiClientError ? err.message : 'Failed to start checkout.',
          variant: 'error',
        });
      }
    },
    [mutation, showToast],
  );

  return { start, isPending: mutation.isPending };
}

export interface OpenBillingPortal {
  open: () => Promise<void>;
  isPending: boolean;
}

export function useOpenBillingPortal(): OpenBillingPortal {
  const mutation = useCreatePortalSession();
  const { showToast } = useToast();

  const open = React.useCallback(async () => {
    const origin = window.location.origin;
    try {
      const result = await mutation.mutateAsync(`${origin}/settings/billing`);
      window.location.href = result.portalUrl;
    } catch (err) {
      showToast({
        title: err instanceof ApiClientError ? err.message : 'Failed to open the billing portal.',
        variant: 'error',
      });
    }
  }, [mutation, showToast]);

  return { open, isPending: mutation.isPending };
}
