import type { Database } from '@viralscopes/db';

import { AppError } from '../lib/errors.js';
import { paginationMeta, type PaginationQuery } from '../lib/pagination.js';
import {
  findVideoById,
  listVideos,
  type VideoDetail,
  type VideoListFilters,
  type VideoRow,
} from '../repositories/video.repository.js';

export class VideoService {
  constructor(private readonly db: Database) {}

  async list(
    filters: VideoListFilters,
    pagination: PaginationQuery,
  ): Promise<{ rows: VideoRow[]; meta: ReturnType<typeof paginationMeta> }> {
    const offset = (pagination.page - 1) * pagination.limit;
    const { rows, total } = await listVideos(this.db, filters, pagination.limit, offset);
    return { rows, meta: paginationMeta(pagination.page, pagination.limit, total) };
  }

  async getById(id: string): Promise<VideoDetail> {
    const detail = await findVideoById(this.db, id);
    if (!detail) {
      throw new AppError('VIDEO_NOT_FOUND', 'Video not found.', 404);
    }
    return detail;
  }
}
