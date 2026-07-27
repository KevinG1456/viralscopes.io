import type { Database } from '@viralscopes/db';

import { AppError } from '../lib/errors.js';
import { paginationMeta, type PaginationQuery } from '../lib/pagination.js';
import {
  findChannelById,
  listChannels,
  type ChannelListFilters,
  type ChannelRow,
} from '../repositories/channel.repository.js';

export class ChannelService {
  constructor(private readonly db: Database) {}

  async list(
    filters: ChannelListFilters,
    pagination: PaginationQuery,
  ): Promise<{ rows: ChannelRow[]; meta: ReturnType<typeof paginationMeta> }> {
    const offset = (pagination.page - 1) * pagination.limit;
    const { rows, total } = await listChannels(this.db, filters, pagination.limit, offset);
    return { rows, meta: paginationMeta(pagination.page, pagination.limit, total) };
  }

  async getById(id: string): Promise<ChannelRow> {
    const channel = await findChannelById(this.db, id);
    if (!channel) {
      throw new AppError('CHANNEL_NOT_FOUND', 'Channel not found.', 404);
    }
    return channel;
  }
}
