import type { Database, TenantContext } from '@viralscopes/db';
import { PLAN_LIMITS, type PlanTier } from '@viralscopes/shared';

import { AppError } from '../lib/errors.js';
import { paginationMeta, type PaginationQuery } from '../lib/pagination.js';
import {
  listAlertEventsForOrg,
  type AlertEventListFilters,
  type AlertEventRow,
} from '../repositories/alert-event.repository.js';
import {
  countActiveAlertRulesForOrg,
  createAlertRule,
  findAlertRuleById,
  listAlertRulesForOrg,
  softDeleteAlertRule,
  updateAlertRule,
  type AlertRuleRow,
} from '../repositories/alert-rule.repository.js';

export interface AlertActor {
  tenant: TenantContext;
  orgRole: string | null;
  planTier: string | null;
}

const MANAGE_ROLES = ['owner', 'admin'];

function assertCanManage(actor: AlertActor, row: AlertRuleRow): void {
  const isCreator = row.createdBy === actor.tenant.userId;
  const isOrgManager = actor.orgRole !== null && MANAGE_ROLES.includes(actor.orgRole);
  if (!isCreator && !isOrgManager) {
    throw new AppError(
      'INSUFFICIENT_PERMISSIONS',
      'Only the creator or an org owner/admin can modify this alert rule.',
      403,
    );
  }
}

export class AlertService {
  constructor(private readonly db: Database) {}

  async listRules(
    tenant: TenantContext,
    pagination: PaginationQuery,
  ): Promise<{ rows: AlertRuleRow[]; meta: ReturnType<typeof paginationMeta> }> {
    const offset = (pagination.page - 1) * pagination.limit;
    const { rows, total } = await listAlertRulesForOrg(this.db, tenant, pagination.limit, offset);
    return { rows, meta: paginationMeta(pagination.page, pagination.limit, total) };
  }

  async createRule(
    actor: AlertActor,
    input: {
      watchlistId: string | null;
      name: string;
      triggerType: string;
      thresholdValue: number | null;
      deliveryChannels: unknown[];
    },
  ): Promise<AlertRuleRow> {
    // Pricing_Strategy.md §2.6/§3 -- plan-tier alert-rule ceiling (FR-37).
    const limit = PLAN_LIMITS[(actor.planTier as PlanTier) ?? 'free'].alertRules;
    if (limit !== null) {
      const current = await countActiveAlertRulesForOrg(this.db, actor.tenant);
      if (current >= limit) {
        throw new AppError(
          'PLAN_LIMIT_EXCEEDED',
          `Your plan allows up to ${limit} alert rule(s). Upgrade to add more.`,
          403,
        );
      }
    }

    return createAlertRule(this.db, actor.tenant, input);
  }

  async updateRule(
    actor: AlertActor,
    id: string,
    input: Partial<{
      name: string;
      thresholdValue: number | null;
      deliveryChannels: unknown[];
      isActive: boolean;
    }>,
  ): Promise<AlertRuleRow> {
    const existing = await findAlertRuleById(this.db, actor.tenant, id);
    if (!existing) {
      throw new AppError('ALERT_RULE_NOT_FOUND', 'Alert rule not found.', 404);
    }
    assertCanManage(actor, existing);

    const updated = await updateAlertRule(this.db, actor.tenant, id, input);
    if (!updated) {
      throw new AppError('ALERT_RULE_NOT_FOUND', 'Alert rule not found.', 404);
    }
    return updated;
  }

  async removeRule(actor: AlertActor, id: string): Promise<void> {
    const existing = await findAlertRuleById(this.db, actor.tenant, id);
    if (!existing) {
      throw new AppError('ALERT_RULE_NOT_FOUND', 'Alert rule not found.', 404);
    }
    assertCanManage(actor, existing);

    const removed = await softDeleteAlertRule(this.db, actor.tenant, id);
    if (!removed) {
      throw new AppError('ALERT_RULE_NOT_FOUND', 'Alert rule not found.', 404);
    }
  }

  async listEvents(
    tenant: TenantContext,
    filters: AlertEventListFilters,
    pagination: PaginationQuery,
  ): Promise<{ rows: AlertEventRow[]; meta: ReturnType<typeof paginationMeta> }> {
    const offset = (pagination.page - 1) * pagination.limit;
    const { rows, total } = await listAlertEventsForOrg(
      this.db,
      tenant,
      filters,
      pagination.limit,
      offset,
    );
    return { rows, meta: paginationMeta(pagination.page, pagination.limit, total) };
  }
}
