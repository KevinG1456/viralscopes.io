import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import type { ApiResult } from '../lib/api/client';
import * as watchlistsApi from '../lib/api/watchlists';
import { queryKeys } from '../lib/query-keys';
import type { Watchlist } from '../types/api';

// Watchlists: 30s staleTime (Frontend_Architecture.md's cache-strategy
// table) -- users modify these frequently.
export function useWatchlists(page: number, limit: number): UseQueryResult<ApiResult<Watchlist[]>> {
  return useQuery({
    queryKey: queryKeys.watchlists.list(page, limit),
    queryFn: () => watchlistsApi.listWatchlists(page, limit),
    staleTime: 30_000,
  });
}

export function useCreateWatchlist(): UseMutationResult<
  Watchlist,
  Error,
  watchlistsApi.CreateWatchlistInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: watchlistsApi.createWatchlist,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.watchlists.all });
    },
  });
}

export function useUpdateWatchlist(): UseMutationResult<
  Watchlist,
  Error,
  { id: string; input: watchlistsApi.UpdateWatchlistInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: watchlistsApi.UpdateWatchlistInput }) =>
      watchlistsApi.updateWatchlist(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.watchlists.all });
    },
  });
}

interface DeleteContext {
  previous: ApiResult<Watchlist[]> | undefined;
}

// Optimistic delete (Frontend_Architecture.md section 5's documented
// example) -- one of the few mutations worth it here: deleting a row the
// user is looking at should feel instant, and reverting on failure is
// simple (put the row back).
export function useDeleteWatchlist(
  page: number,
  limit: number,
): UseMutationResult<void, Error, string, DeleteContext> {
  const queryClient = useQueryClient();
  const listKey = queryKeys.watchlists.list(page, limit);

  return useMutation({
    mutationFn: watchlistsApi.deleteWatchlist,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<ApiResult<Watchlist[]>>(listKey);
      queryClient.setQueryData<ApiResult<Watchlist[]> | undefined>(listKey, (old) =>
        old ? { ...old, data: old.data.filter((w) => w.id !== id) } : old,
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(listKey, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.watchlists.all });
    },
  });
}
