import { apiRequest } from './client';
import type { UsageSummary } from '../../types/api';

// Phase 5's existing quota endpoint -- reused as-is for the billing
// dashboard's Usage & Limits section (Phase 9 Milestone 4), not
// duplicated. Distinct from GET /analytics/overview, which embeds a
// smaller usage subset alongside unrelated org KPIs for the Home page.
export async function getUsageSummary(): Promise<UsageSummary> {
  const { data } = await apiRequest<UsageSummary>('/api/v1/usage');
  return data;
}
