import { apiRequest, type ApiResult } from './client';
import type { AlertEvent, AlertRule, AlertTriggerType } from '../../types/api';

export interface CreateAlertRuleInput {
  name: string;
  triggerType: AlertTriggerType;
  thresholdValue?: number | null;
  deliveryChannels?: unknown[];
  watchlistId?: string | null;
}

export interface UpdateAlertRuleInput {
  name?: string;
  thresholdValue?: number | null;
  deliveryChannels?: unknown[];
  isActive?: boolean;
}

export async function listAlertRules(page: number, limit: number): Promise<ApiResult<AlertRule[]>> {
  return apiRequest<AlertRule[]>('/api/v1/alerts/rules', { query: { page, limit } });
}

export async function createAlertRule(input: CreateAlertRuleInput): Promise<AlertRule> {
  const { data } = await apiRequest<AlertRule>('/api/v1/alerts/rules', {
    method: 'POST',
    body: input,
  });
  return data;
}

export async function updateAlertRule(id: string, input: UpdateAlertRuleInput): Promise<AlertRule> {
  const { data } = await apiRequest<AlertRule>(`/api/v1/alerts/rules/${id}`, {
    method: 'PUT',
    body: input,
  });
  return data;
}

export async function deleteAlertRule(id: string): Promise<void> {
  await apiRequest(`/api/v1/alerts/rules/${id}`, { method: 'DELETE' });
}

export async function listAlertEvents(
  page: number,
  limit: number,
): Promise<ApiResult<AlertEvent[]>> {
  return apiRequest<AlertEvent[]>('/api/v1/alerts/events', { query: { page, limit } });
}
