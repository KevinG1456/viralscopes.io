import type { Database } from '@viralscopes/db';

import { paginationMeta, type PaginationQuery } from '../lib/pagination.js';
import {
  listOpportunities,
  listTrends,
  type TrendListFilters,
  type TrendRow,
} from '../repositories/trend.repository.js';

export class TrendService {
  constructor(private readonly db: Database) {}

  async list(
    filters: TrendListFilters,
    pagination: PaginationQuery,
  ): Promise<{ rows: TrendRow[]; meta: ReturnType<typeof paginationMeta> }> {
    const offset = (pagination.page - 1) * pagination.limit;
    const { rows, total } = await listTrends(this.db, filters, pagination.limit, offset);
    return { rows, meta: paginationMeta(pagination.page, pagination.limit, total) };
  }

  async opportunities(
    filters: Pick<TrendListFilters, 'platform' | 'language'>,
    pagination: PaginationQuery,
  ): Promise<{ rows: TrendRow[]; meta: ReturnType<typeof paginationMeta> }> {
    const offset = (pagination.page - 1) * pagination.limit;
    const { rows, total } = await listOpportunities(this.db, filters, pagination.limit, offset);
    return { rows, meta: paginationMeta(pagination.page, pagination.limit, total) };
  }
}
