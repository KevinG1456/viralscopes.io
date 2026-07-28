import { apiRequest, type ApiResult } from './client';
import type { ApiKey, CreatedApiKey } from '../../types/api';

export interface CreateApiKeyInput {
  name: string;
  scopes?: string[];
  expiresAt?: string | null;
}

export async function listApiKeys(page: number, limit: number): Promise<ApiResult<ApiKey[]>> {
  return apiRequest<ApiKey[]>('/api/v1/api-keys', { query: { page, limit } });
}

export async function createApiKey(input: CreateApiKeyInput): Promise<CreatedApiKey> {
  const { data } = await apiRequest<CreatedApiKey>('/api/v1/api-keys', {
    method: 'POST',
    body: input,
  });
  return data;
}

export async function revokeApiKey(id: string): Promise<void> {
  await apiRequest(`/api/v1/api-keys/${id}`, { method: 'DELETE' });
}
