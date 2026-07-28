import { apiRequest, type ApiResult } from './client';
import type { Watchlist, WatchlistType } from '../../types/api';

export interface CreateWatchlistInput {
  name: string;
  type: WatchlistType;
  target: string;
  targetMetadata?: Record<string, unknown>;
}

export interface UpdateWatchlistInput {
  name?: string;
  target?: string;
  targetMetadata?: Record<string, unknown>;
  isActive?: boolean;
}

export async function listWatchlists(page: number, limit: number): Promise<ApiResult<Watchlist[]>> {
  return apiRequest<Watchlist[]>('/api/v1/watchlists', { query: { page, limit } });
}

export async function createWatchlist(input: CreateWatchlistInput): Promise<Watchlist> {
  const { data } = await apiRequest<Watchlist>('/api/v1/watchlists', {
    method: 'POST',
    body: input,
  });
  return data;
}

export async function updateWatchlist(id: string, input: UpdateWatchlistInput): Promise<Watchlist> {
  const { data } = await apiRequest<Watchlist>(`/api/v1/watchlists/${id}`, {
    method: 'PUT',
    body: input,
  });
  return data;
}

export async function deleteWatchlist(id: string): Promise<void> {
  await apiRequest(`/api/v1/watchlists/${id}`, { method: 'DELETE' });
}
