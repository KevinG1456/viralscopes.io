import type { Database, TenantContext } from '@viralscopes/db';

import { paginationMeta, type PaginationQuery } from '../lib/pagination.js';
import {
  findRecommendationsForVideo,
  listRecommendationsForOrg,
  type RecommendationRow,
} from '../repositories/recommendation.repository.js';

export class RecommendationService {
  constructor(private readonly db: Database) {}

  async list(
    tenant: TenantContext,
    pagination: PaginationQuery,
  ): Promise<{ rows: RecommendationRow[]; meta: ReturnType<typeof paginationMeta> }> {
    const offset = (pagination.page - 1) * pagination.limit;
    const { rows, total } = await listRecommendationsForOrg(
      this.db,
      tenant,
      pagination.limit,
      offset,
    );
    return { rows, meta: paginationMeta(pagination.page, pagination.limit, total) };
  }

  async forVideo(tenant: TenantContext, videoId: string): Promise<RecommendationRow[]> {
    return findRecommendationsForVideo(this.db, tenant, videoId);
  }
}
