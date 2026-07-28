import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import * as alertsApi from '../lib/api/alerts';
import type { ApiResult } from '../lib/api/client';
import { queryKeys } from '../lib/query-keys';
import type { AlertEvent, AlertRule } from '../types/api';

export function useAlertRules(page: number, limit: number): UseQueryResult<ApiResult<AlertRule[]>> {
  return useQuery({
    queryKey: queryKeys.alerts.rules(page, limit),
    queryFn: () => alertsApi.listAlertRules(page, limit),
    staleTime: 30_000,
  });
}

export function useAlertEvents(
  page: number,
  limit: number,
): UseQueryResult<ApiResult<AlertEvent[]>> {
  return useQuery({
    queryKey: queryKeys.alerts.events(page, limit),
    queryFn: () => alertsApi.listAlertEvents(page, limit),
    staleTime: 30_000,
  });
}

export function useCreateAlertRule(): UseMutationResult<
  AlertRule,
  Error,
  alertsApi.CreateAlertRuleInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: alertsApi.createAlertRule,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.alerts.rulesAll });
    },
  });
}

export function useUpdateAlertRule(): UseMutationResult<
  AlertRule,
  Error,
  { id: string; input: alertsApi.UpdateAlertRuleInput }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: alertsApi.UpdateAlertRuleInput }) =>
      alertsApi.updateAlertRule(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.alerts.rulesAll });
    },
  });
}

export function useDeleteAlertRule(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: alertsApi.deleteAlertRule,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.alerts.rulesAll });
    },
  });
}
