import type { Database, TenantContext } from '@viralscopes/db';

import { AppError } from '../lib/errors.js';
import { paginationMeta, type PaginationQuery } from '../lib/pagination.js';
import { PLAN_LIMITS, type PlanTier } from '../lib/plan-limits.js';
import { generateOpaqueToken, hashOpaqueToken } from '../lib/tokens.js';
import {
  createApiKey,
  findApiKeyById,
  listApiKeysForOrg,
  revokeApiKey,
  type ApiKeyRow,
} from '../repositories/api-key.repository.js';

const KEY_PREFIX = 'vs_live_';

export class ApiKeyService {
  constructor(private readonly db: Database) {}

  async list(
    tenant: TenantContext,
    pagination: PaginationQuery,
  ): Promise<{ rows: ApiKeyRow[]; meta: ReturnType<typeof paginationMeta> }> {
    const offset = (pagination.page - 1) * pagination.limit;
    const { rows, total } = await listApiKeysForOrg(this.db, tenant, pagination.limit, offset);
    return { rows, meta: paginationMeta(pagination.page, pagination.limit, total) };
  }

  /** Returns the created row plus the plaintext key -- shown exactly once, never persisted or logged. */
  async create(
    tenant: TenantContext,
    planTier: string | null,
    input: { name: string; scopes: string[]; expiresAt: Date | null },
  ): Promise<{ row: ApiKeyRow; plaintextKey: string }> {
    // Pricing_Strategy.md §2.6 -- "API access: No" on Free/Starter (FR-37).
    if (!PLAN_LIMITS[(planTier as PlanTier) ?? 'free'].apiAccess) {
      throw new AppError(
        'PLAN_LIMIT_EXCEEDED',
        'API access is not included on your current plan. Upgrade to Professional or higher.',
        403,
      );
    }

    const { token } = generateOpaqueToken();
    const plaintextKey = `${KEY_PREFIX}${token}`;
    const keyHash = hashOpaqueToken(plaintextKey);
    const keyPrefix = plaintextKey.slice(0, KEY_PREFIX.length + 8);

    const row = await createApiKey(this.db, tenant, {
      name: input.name,
      keyHash,
      keyPrefix,
      scopes: input.scopes,
      expiresAt: input.expiresAt,
    });

    return { row, plaintextKey };
  }

  async revoke(tenant: TenantContext, id: string): Promise<void> {
    const existing = await findApiKeyById(this.db, tenant, id);
    if (!existing) {
      throw new AppError('API_KEY_NOT_FOUND', 'API key not found.', 404);
    }
    const revoked = await revokeApiKey(this.db, tenant, id);
    if (!revoked) {
      throw new AppError('API_KEY_ALREADY_REVOKED', 'This API key has already been revoked.', 409);
    }
  }
}
