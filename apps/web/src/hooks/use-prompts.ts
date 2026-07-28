import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import * as promptsApi from '../lib/api/prompts';
import { queryKeys } from '../lib/query-keys';
import type {
  JobLog,
  PromptDiff,
  PromptSummary,
  PromptTestResult,
  PromptVersion,
} from '../types/api';

export function usePrompts(): UseQueryResult<PromptSummary[]> {
  return useQuery({
    queryKey: queryKeys.prompts.all,
    queryFn: promptsApi.listPrompts,
    staleTime: 30_000,
  });
}

export function usePromptVersions(name: string): UseQueryResult<PromptVersion[]> {
  return useQuery({
    queryKey: queryKeys.prompts.versions(name),
    queryFn: () => promptsApi.listVersions(name),
    staleTime: 30_000,
  });
}

export function usePromptDiff(
  name: string,
  from: number | null,
  to: number | null,
): UseQueryResult<PromptDiff> {
  return useQuery({
    queryKey: queryKeys.prompts.diff(name, from ?? 0, to ?? 0),
    queryFn: () => promptsApi.diffVersions(name, from!, to!),
    enabled: from !== null && to !== null && from !== to,
  });
}

export function useActivateVersion(): UseMutationResult<
  PromptVersion,
  Error,
  { name: string; version: number }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, version }) => promptsApi.activateVersion(name, version),
    onSuccess: (_data, { name }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.prompts.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.prompts.versions(name) });
    },
  });
}

export function useTestFixtures(): UseQueryResult<string[]> {
  return useQuery({
    queryKey: queryKeys.prompts.fixtures,
    queryFn: promptsApi.listTestFixtures,
    staleTime: Infinity,
  });
}

export function useRunPromptTest(): UseMutationResult<
  PromptTestResult,
  Error,
  { name: string; version: number; fixtureId: string }
> {
  return useMutation({
    mutationFn: ({ name, version, fixtureId }) => promptsApi.runTest(name, version, fixtureId),
  });
}

const TERMINAL_STATUSES = new Set(['completed', 'failed']);

export function usePromptTestResult(name: string, jobId: string | null): UseQueryResult<JobLog> {
  return useQuery({
    queryKey: queryKeys.prompts.testResult(name, jobId ?? ''),
    queryFn: () => promptsApi.getTestResult(name, jobId!),
    enabled: jobId !== null,
    // Poll while the job is still in flight -- it will end up PENDING for
    // a while without AI credentials (TD-023), same as the CLI regression
    // runner; this stops polling once it reaches a terminal status rather
    // than forever.
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && TERMINAL_STATUSES.has(status) ? false : 3000;
    },
  });
}
