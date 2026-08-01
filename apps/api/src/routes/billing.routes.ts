import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { createBillingProvider } from '../lib/billing-provider.js';
import { ok } from '../lib/response.js';
import { authenticate } from '../middleware/authenticate.js';
import { businessRateLimit } from '../middleware/business-rate-limit.js';
import { requireOrgContext } from '../middleware/require-org-context.js';
import { requireRole } from '../middleware/require-role.js';
import { BillingService } from '../services/billing.service.js';

const checkoutSchema = z.object({
  plan: z.enum(['starter', 'professional', 'business']),
  billingCycle: z.enum(['monthly', 'annual']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

const portalSchema = z.object({
  returnUrl: z.string().url(),
});

function tenantFrom(request: FastifyRequest): { orgId: string; userId: string } {
  return { orgId: request.user!.orgId!, userId: request.user!.userId };
}

// Billing-mutation RBAC (docs/architecture/billing/09-security.md, sourced
// directly from Security_Architecture.md's Role Permissions Matrix): Owner
// can initiate checkout/portal; Owner+Admin can view. This is the first
// route in the codebase to actually call requireRole() -- it was built in
// Phase 4, exercised in isolation, but never wired to a real route (see
// TD-012 in PROJECT_STATUS.md, "a pure org-role allowlist with no ownership
// component" is exactly this case).
export async function billingRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  const billingProvider = createBillingProvider(
    fastify.appConfig.billing.stripeSecretKey,
    fastify.appConfig.billing.stripeWebhookSecret,
  );
  const billingService = new BillingService(
    fastify.db,
    billingProvider,
    fastify.appConfig.billing.stripePriceIds,
  );

  // Any authenticated org member -- plan/limits are not financial data, and
  // this endpoint makes no DB call (see BillingService.getPlanAndLimits).
  fastify.get(
    '/plan',
    { preHandler: [authenticate, requireOrgContext, businessRateLimit] },
    async (request, reply) => {
      const result = billingService.getPlanAndLimits(request.user!.planTier);
      return reply.code(200).send(ok(result));
    },
  );

  // Owner + Admin: view-only (Security_Architecture.md's "View billing and
  // invoices" row). Folds in billing status (the `status` field) rather
  // than a separate endpoint -- it's one row, not a distinct concern.
  fastify.get(
    '/subscription',
    {
      preHandler: [
        authenticate,
        requireOrgContext,
        requireRole('owner', 'admin'),
        businessRateLimit,
      ],
    },
    async (request, reply) => {
      const summary = await billingService.getCurrentPlanSummary(
        tenantFrom(request),
        request.user!.planTier,
      );
      return reply.code(200).send(ok(summary));
    },
  );

  // Owner only: initiating a plan change is a mutation, not a view.
  fastify.post(
    '/checkout',
    { preHandler: [authenticate, requireOrgContext, requireRole('owner'), businessRateLimit] },
    async (request, reply) => {
      const body = checkoutSchema.parse(request.body);
      const result = await billingService.createCheckoutSession(tenantFrom(request), body);
      return reply.code(200).send(ok(result));
    },
  );

  // Owner only: the portal allows plan changes and cancellation.
  fastify.post(
    '/portal',
    { preHandler: [authenticate, requireOrgContext, requireRole('owner'), businessRateLimit] },
    async (request, reply) => {
      const body = portalSchema.parse(request.body);
      const result = await billingService.createPortalSession(tenantFrom(request), body);
      return reply.code(200).send(ok(result));
    },
  );
}
