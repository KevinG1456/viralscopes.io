import type { Database, TenantContext } from '@viralscopes/db';

import { PLAN_LIMITS, type PlanTier } from '../lib/plan-limits.js';
import { sumUsageSince } from '../repositories/usage.repository.js';

export interface UsageSummary {
  periodStart: string;
  periodEnd: string;
  usage: Record<string, number>;
  videosAnalyzed: {
    used: number;
    limit: number | null;
    remaining: number | null;
  };
}

function currentMonthBounds(now: Date): { start: Date; end: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

export class UsageService {
  constructor(private readonly db: Database) {}

  async currentPeriod(tenant: TenantContext, planTier: string | null): Promise<UsageSummary> {
    const { start, end } = currentMonthBounds(new Date());
    const rows = await sumUsageSince(this.db, tenant, start);

    const usage: Record<string, number> = {};
    for (const row of rows) {
      usage[row.eventType] = row.quantity;
    }

    const videosLimit = PLAN_LIMITS[(planTier as PlanTier) ?? 'free'].videosPerMonth;
    const videosUsed = usage.video_analyzed ?? 0;

    return {
      periodStart: start.toISOString(),
      periodEnd: end.toISOString(),
      usage,
      videosAnalyzed: {
        used: videosUsed,
        limit: videosLimit,
        remaining: videosLimit !== null ? Math.max(0, videosLimit - videosUsed) : null,
      },
    };
  }
}
