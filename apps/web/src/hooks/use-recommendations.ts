import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ApiResult } from '../lib/api/client';
import * as recommendationsApi from '../lib/api/recommendations';
import { queryKeys } from '../lib/query-keys';
import type { Recommendation } from '../types/api';

export function useRecommendations(
  page: number,
  limit: number,
): UseQueryResult<ApiResult<Recommendation[]>> {
  return useQuery({
    queryKey: queryKeys.recommendations.list(page, limit),
    queryFn: () => recommendationsApi.listRecommendations(page, limit),
    staleTime: 60_000,
  });
}
