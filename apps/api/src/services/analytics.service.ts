import type { Database, TenantContext } from '@viralscopes/db';

import { UsageService } from './usage.service.js';
import { countAlertEventsByStatusSince } from '../repositories/alert-event.repository.js';
import { countActiveAlertRulesForOrg } from '../repositories/alert-rule.repository.js';
import { listApiKeysForOrg } from '../repositories/api-key.repository.js';
import { countActiveWatchlistsForOrg } from '../repositories/watchlist.repository.js';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface AnalyticsOverview {
  watchlists: { active: number };
  alertRules: { active: number };
  alertEvents: { last30Days: Record<string, number> };
  apiKeys: { active: number };
  usage: Awaited<ReturnType<UsageService['currentPeriod']>>;
}

// Org-level KPIs built only from data unambiguously scoped to the caller's
// org (watchlists/alerts/api-keys/usage). Deliberately excludes the
// "viral-scores"/"engagement" breakdowns ROADMAP.md also lists under
// Endpoints — Analytics: videos/channels are global, shared-across-tenants
// content (see videos.ts/channels.ts), and attributing them to a specific
// org's KPIs would require a defined join (e.g. via watchlisted channels)
// that isn't specified anywhere in Database_Schema.md -- building it now
// would mean guessing a product decision rather than implementing one.
// Logged as TD-019, not silently dropped.
export class AnalyticsService {
  private readonly usageService: UsageService;

  constructor(private readonly db: Database) {
    this.usageService = new UsageService(db);
  }

  async overview(tenant: TenantContext, planTier: string | null): Promise<AnalyticsOverview> {
    const since30d = new Date(Date.now() - THIRTY_DAYS_MS);

    const [watchlistsTotal, alertRulesActive, alertEvents30d, apiKeys, usage] = await Promise.all([
      countActiveWatchlistsForOrg(this.db, tenant),
      countActiveAlertRulesForOrg(this.db, tenant),
      countAlertEventsByStatusSince(this.db, tenant, since30d),
      listApiKeysForOrg(this.db, tenant, 1, 0),
      this.usageService.currentPeriod(tenant, planTier),
    ]);

    return {
      watchlists: { active: watchlistsTotal },
      alertRules: { active: alertRulesActive },
      alertEvents: { last30Days: alertEvents30d },
      apiKeys: { active: apiKeys.total },
      usage,
    };
  }
}
