import { apiRequest, type ApiResult } from './client';
import type { Recommendation } from '../../types/api';

export async function listRecommendations(
  page: number,
  limit: number,
): Promise<ApiResult<Recommendation[]>> {
  return apiRequest<Recommendation[]>('/api/v1/recommendations', { query: { page, limit } });
}
