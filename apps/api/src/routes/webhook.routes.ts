import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

import { createBillingProvider } from '../lib/billing-provider.js';
import { SignatureVerificationError, WebhookService } from '../services/webhook.service.js';

// Unauthenticated by design -- verified by Stripe-Signature HMAC, not a JWT
// or CSRF token (there is no user session on a webhook call). No
// business-rate-limit either: Stripe itself is the only expected caller,
// and rate-limiting a webhook risks dropping a legitimate delivery.
export async function webhookRoutes(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  // Stripe computes its signature over the exact raw request bytes. Fastify's
  // default JSON parser would re-serialise the body, changing byte-for-byte
  // content (key ordering, whitespace) and breaking verification -- so this
  // route needs the body as an untouched Buffer instead. Scoped to this
  // plugin's encapsulation context only (Fastify plugins are isolated by
  // default), so every other route keeps normal JSON parsing.
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (_request, body, done) => {
      done(null, body);
    },
  );

  const billingProvider = createBillingProvider(
    fastify.appConfig.billing.stripeSecretKey,
    fastify.appConfig.billing.stripeWebhookSecret,
  );

  fastify.post('/stripe', async (request, reply) => {
    if (!billingProvider) {
      // No Stripe account configured in this environment -- there is
      // nothing to verify a signature against. Distinct from an invalid
      // signature (400): this is a server-side configuration gap, not a
      // malformed/forged request.
      request.log.warn(
        'Received a Stripe webhook but billing is not configured in this environment',
      );
      return reply
        .code(503)
        .send({
          success: false,
          error: {
            code: 'STRIPE_ERROR',
            message: 'Billing is not configured in this environment.',
          },
        });
    }

    const webhookService = new WebhookService(fastify.db, billingProvider, request.log);
    const signature = request.headers['stripe-signature'];

    try {
      await webhookService.processEvent(
        request.body as Buffer,
        Array.isArray(signature) ? signature[0] : signature,
      );
    } catch (err) {
      if (err instanceof SignatureVerificationError) {
        request.log.warn({ err }, 'Stripe webhook signature verification failed');
        return reply
          .code(400)
          .send({
            success: false,
            error: {
              code: 'INVALID_WEBHOOK_SIGNATURE',
              message: 'Webhook signature verification failed.',
            },
          });
      }
      throw err;
    }

    // Always 200 for a signature-valid event, even if internal processing
    // failed -- WebhookService already recorded the failure (billing_events
    // + dead_letter_jobs) internally. Returning 5xx here would just cause
    // Stripe to retry an event whose failure mode won't resolve itself.
    return reply.code(200).send({ received: true });
  });
}
