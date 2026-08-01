import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { ZodError } from 'zod';

import { AppError, toErrorEnvelope } from '../lib/errors.js';

// Single place every error becomes the standard envelope
// (URL_and_API_Structure.md §20: { success: false, error: { code,
// message, details } }). AppError carries its own status/code; anything
// else (a Zod validation failure, an unexpected exception) is normalised
// here rather than each route handler improvising its own try/catch.
async function errorHandlerPluginImpl(
  fastify: FastifyInstance,
  _opts: FastifyPluginOptions,
): Promise<void> {
  fastify.setErrorHandler((err, request, reply) => {
    if (err instanceof AppError) {
      // A 5xx AppError (e.g. STRIPE_ERROR, OAUTH_PROFILE_FETCH_FAILED) is
      // still a genuine operational failure worth seeing in logs, same as
      // any other unhandled 500 -- found during Phase 9 Milestone 6's
      // hardening review: this branch previously never logged anything,
      // silently hiding every 5xx AppError from server-side observability
      // codebase-wide, not just for billing.
      if (err.statusCode >= 500) {
        request.log.error({ err }, 'Unhandled 5xx AppError');
      }
      return reply.code(err.statusCode).send(toErrorEnvelope(err));
    }

    if (err instanceof ZodError) {
      return reply.code(422).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed.',
          details: { issues: err.issues },
        },
      });
    }

    // Fastify's own validation (route-level JSON schema, if any) and rate
    // limit errors already carry a statusCode; anything without one is a
    // genuine unexpected failure and must never leak internals.
    const hasStatusCode =
      typeof err === 'object' &&
      err !== null &&
      'statusCode' in err &&
      typeof (err as { statusCode: unknown }).statusCode === 'number';
    const statusCode = hasStatusCode ? (err as { statusCode: number }).statusCode : 500;
    if (statusCode >= 500) {
      request.log.error({ err }, 'Unhandled error');
    }

    return reply.code(statusCode).send({
      success: false,
      error: {
        code: statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
        message:
          statusCode >= 500
            ? 'An unexpected error occurred.'
            : err instanceof Error
              ? err.message
              : 'Request failed.',
      },
    });
  });
}

export const errorHandlerPlugin = fp(errorHandlerPluginImpl, { name: 'error-handler-plugin' });
