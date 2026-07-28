import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import * as analyticsApi from '../lib/api/analytics';
import { queryKeys } from '../lib/query-keys';
import type { AnalyticsOverview } from '../types/api';

// Analytics/KPIs: 5-minute staleTime (Frontend_Architecture.md section 5's
// cache-strategy table) -- summary data, frequent refresh not needed.
export function useAnalyticsOverview(): UseQueryResult<AnalyticsOverview> {
  return useQuery({
    queryKey: queryKeys.analytics.overview,
    queryFn: analyticsApi.getAnalyticsOverview,
    staleTime: 5 * 60_000,
  });
}
