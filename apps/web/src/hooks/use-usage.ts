import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import * as usageApi from '../lib/api/usage';
import { queryKeys } from '../lib/query-keys';
import type { UsageSummary } from '../types/api';

export function useUsageSummary(enabled = true): UseQueryResult<UsageSummary> {
  return useQuery({
    queryKey: queryKeys.usage.summary,
    queryFn: usageApi.getUsageSummary,
    staleTime: 60_000,
    enabled,
  });
}
