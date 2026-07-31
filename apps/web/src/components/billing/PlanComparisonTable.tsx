import {
  PLAN_HIERARCHY,
  PLANS,
  SELF_SERVE_CHECKOUT_PLANS,
  type PlanTier,
  type SelfServeCheckoutPlan,
} from '@viralscopes/shared';
import { Check } from 'lucide-react';

import { cn } from '../../lib/utils/cn';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const PLAN_ORDER: PlanTier[] = ['free', 'starter', 'professional', 'business', 'enterprise'];

function formatPrice(pence: number | null): string {
  if (pence === null) return 'Custom';
  if (pence === 0) return '£0';
  return `£${(pence / 100).toFixed(0)}/mo`;
}

function isSelfServe(plan: PlanTier): plan is SelfServeCheckoutPlan {
  return (SELF_SERVE_CHECKOUT_PLANS as readonly string[]).includes(plan);
}

// Every price/limit shown here comes straight from @viralscopes/shared's
// PLANS/PLAN_LIMITS constants -- Pricing_Strategy.md's actual source of
// truth, the same one apps/api's billing.service.ts reads from. This is
// static marketing content (what each tier costs and includes), not
// subscription *state* -- the current-plan indicator is the one piece that
// comes from the backend (the `currentPlan` prop, sourced from
// GET /billing/subscription), never guessed at here.
export function PlanComparisonTable({
  currentPlan,
  canManageBilling,
  onUpgrade,
  onDowngrade,
  checkoutPending,
  portalPending,
}: {
  currentPlan: PlanTier;
  canManageBilling: boolean;
  onUpgrade: (plan: SelfServeCheckoutPlan) => void;
  onDowngrade: () => void;
  checkoutPending: boolean;
  portalPending: boolean;
}): React.ReactElement {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {PLAN_ORDER.map((tier) => {
        const plan = PLANS[tier];
        const isCurrent = tier === currentPlan;
        const isUpgrade = PLAN_HIERARCHY[tier] > PLAN_HIERARCHY[currentPlan];
        const isDowngrade = PLAN_HIERARCHY[tier] < PLAN_HIERARCHY[currentPlan];

        return (
          <Card
            key={tier}
            className={cn('flex flex-col', isCurrent && 'border-primary ring-1 ring-primary')}
          >
            <CardContent className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-primary">{plan.displayName}</span>
                {isCurrent ? <Badge variant="primary">Current plan</Badge> : null}
              </div>
              <span className="text-xl font-semibold text-text-primary">
                {formatPrice(plan.monthlyPricePence)}
              </span>

              <ul className="flex flex-1 flex-col gap-1.5 text-xs text-text-secondary">
                <PlanFeature
                  text={
                    plan.limits.videosPerMonth === null
                      ? 'Unlimited videos/mo'
                      : `${plan.limits.videosPerMonth.toLocaleString()} videos/mo`
                  }
                />
                <PlanFeature
                  text={
                    plan.limits.watchlists === null
                      ? 'Unlimited watchlists'
                      : `${plan.limits.watchlists} watchlist${plan.limits.watchlists === 1 ? '' : 's'}`
                  }
                />
                <PlanFeature
                  text={
                    plan.limits.alertRules === null
                      ? 'Unlimited alert rules'
                      : `${plan.limits.alertRules} alert rules`
                  }
                />
                <PlanFeature text={plan.limits.apiAccess ? 'API access' : 'No API access'} />
                <PlanFeature text={`${plan.limits.dataRetentionDays ?? 'Custom'} day retention`} />
              </ul>

              {!canManageBilling ? (
                <span className="text-xs text-text-tertiary">Owner only</span>
              ) : isCurrent ? (
                <Button variant="outline" size="sm" disabled>
                  Current plan
                </Button>
              ) : tier === 'enterprise' ? (
                <Button variant="outline" size="sm" disabled>
                  Contact sales
                </Button>
              ) : isUpgrade && isSelfServe(tier) ? (
                <Button size="sm" onClick={() => onUpgrade(tier)} loading={checkoutPending}>
                  Upgrade
                </Button>
              ) : isDowngrade ? (
                <Button variant="outline" size="sm" onClick={onDowngrade} loading={portalPending}>
                  Downgrade
                </Button>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function PlanFeature({ text }: { text: string }): React.ReactElement {
  return (
    <li className="flex items-center gap-1.5">
      <Check className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
      {text}
    </li>
  );
}
