import type { Database, TenantContext } from '@viralscopes/db';

import { AppError } from '../lib/errors.js';
import { paginationMeta, type PaginationQuery } from '../lib/pagination.js';
import { PLAN_LIMITS, type PlanTier } from '../lib/plan-limits.js';
import {
  countActiveWatchlistsForOrg,
  createWatchlist,
  findWatchlistById,
  listWatchlistsForOrg,
  softDeleteWatchlist,
  updateWatchlist,
  type WatchlistRow,
} from '../repositories/watchlist.repository.js';

export interface WatchlistActor {
  tenant: TenantContext;
  orgRole: string | null;
  planTier: string | null;
}

const MANAGE_ROLES = ['owner', 'admin'];

function assertCanManage(actor: WatchlistActor, row: WatchlistRow): void {
  const isCreator = row.createdBy === actor.tenant.userId;
  const isOrgManager = actor.orgRole !== null && MANAGE_ROLES.includes(actor.orgRole);
  if (!isCreator && !isOrgManager) {
    throw new AppError(
      'INSUFFICIENT_PERMISSIONS',
      'Only the creator or an org owner/admin can modify this watchlist.',
      403,
    );
  }
}

export class WatchlistService {
  constructor(private readonly db: Database) {}

  async list(
    tenant: TenantContext,
    pagination: PaginationQuery,
  ): Promise<{ rows: WatchlistRow[]; meta: ReturnType<typeof paginationMeta> }> {
    const offset = (pagination.page - 1) * pagination.limit;
    const { rows, total } = await listWatchlistsForOrg(this.db, tenant, pagination.limit, offset);
    return { rows, meta: paginationMeta(pagination.page, pagination.limit, total) };
  }

  async create(
    actor: WatchlistActor,
    input: {
      workspaceId: string | null;
      name: string;
      type: string;
      target: string;
      targetMetadata: Record<string, unknown>;
    },
  ): Promise<WatchlistRow> {
    // Pricing_Strategy.md §2.6/§3 -- plan-tier watchlist ceiling (FR-37).
    const limit = PLAN_LIMITS[(actor.planTier as PlanTier) ?? 'free'].watchlists;
    if (limit !== null) {
      const current = await countActiveWatchlistsForOrg(this.db, actor.tenant);
      if (current >= limit) {
        throw new AppError(
          'PLAN_LIMIT_EXCEEDED',
          `Your plan allows up to ${limit} watchlist(s). Upgrade to add more.`,
          403,
        );
      }
    }

    return createWatchlist(this.db, actor.tenant, input);
  }

  async update(
    actor: WatchlistActor,
    id: string,
    input: Partial<{
      name: string;
      target: string;
      targetMetadata: Record<string, unknown>;
      isActive: boolean;
    }>,
  ): Promise<WatchlistRow> {
    const existing = await findWatchlistById(this.db, actor.tenant, id);
    if (!existing) {
      throw new AppError('WATCHLIST_NOT_FOUND', 'Watchlist not found.', 404);
    }
    assertCanManage(actor, existing);

    const updated = await updateWatchlist(this.db, actor.tenant, id, input);
    if (!updated) {
      throw new AppError('WATCHLIST_NOT_FOUND', 'Watchlist not found.', 404);
    }
    return updated;
  }

  async remove(actor: WatchlistActor, id: string): Promise<void> {
    const existing = await findWatchlistById(this.db, actor.tenant, id);
    if (!existing) {
      throw new AppError('WATCHLIST_NOT_FOUND', 'Watchlist not found.', 404);
    }
    assertCanManage(actor, existing);

    const removed = await softDeleteWatchlist(this.db, actor.tenant, id);
    if (!removed) {
      throw new AppError('WATCHLIST_NOT_FOUND', 'Watchlist not found.', 404);
    }
  }
}
