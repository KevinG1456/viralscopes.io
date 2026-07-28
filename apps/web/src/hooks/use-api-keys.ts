import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import * as apiKeysApi from '../lib/api/api-keys';
import type { ApiResult } from '../lib/api/client';
import { queryKeys } from '../lib/query-keys';
import type { ApiKey, CreatedApiKey } from '../types/api';

export function useApiKeys(page: number, limit: number): UseQueryResult<ApiResult<ApiKey[]>> {
  return useQuery({
    queryKey: queryKeys.apiKeys.list(page, limit),
    queryFn: () => apiKeysApi.listApiKeys(page, limit),
    staleTime: 30_000,
  });
}

export function useCreateApiKey(): UseMutationResult<
  CreatedApiKey,
  Error,
  apiKeysApi.CreateApiKeyInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiKeysApi.createApiKey,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
    },
  });
}

export function useRevokeApiKey(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiKeysApi.revokeApiKey,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
    },
  });
}
