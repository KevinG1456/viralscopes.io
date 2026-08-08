import { apiRequest } from './client';
import type { AccountExportData } from '../../types/api';

export async function exportAccountData(): Promise<AccountExportData> {
  const { data } = await apiRequest<AccountExportData>('/api/v1/account/export');
  return data;
}

export async function deleteAccount(): Promise<void> {
  await apiRequest('/api/v1/account', { method: 'DELETE', csrf: true });
}
