import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import * as authApi from '../lib/api/auth';
import { queryKeys } from '../lib/query-keys';
import type { Session } from '../types/api';

export function useSessions(): UseQueryResult<Session[]> {
  return useQuery({
    queryKey: queryKeys.sessions.all,
    queryFn: authApi.listSessions,
    staleTime: 10_000,
  });
}

export function useRevokeSession(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.revokeSession,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });
}

export function useRevokeOtherSessions(): UseMutationResult<{ revokedCount: number }, Error, void> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.revokeOtherSessions,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
    },
  });
}
