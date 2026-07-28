import { apiRequest } from './client';
import type { AnalyticsOverview } from '../../types/api';

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const { data } = await apiRequest<AnalyticsOverview>('/api/v1/analytics/overview');
  return data;
}
