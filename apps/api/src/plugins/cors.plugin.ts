import cors from '@fastify/cors';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

import type { AppConfig } from '../config.js';

interface CorsPluginOptions extends FastifyPluginOptions {
  config: AppConfig;
}

// Phase 8: apps/web (a separate origin/port) needs to call this API from
// the browser -- without this, every fetch is blocked outright by the
// browser's same-origin policy, regardless of the refresh-token cookie
// being same-site. Policy matches Security_Architecture.md's CORS Policy
// section exactly (already specified, just never implemented before now):
// a single allowed origin (config.appUrl, already used for OAuth
// redirects), credentials enabled so the httpOnly refresh-token cookie is
// actually sent cross-port/cross-subdomain, and no wildcard ever.
async function corsPluginImpl(fastify: FastifyInstance, opts: CorsPluginOptions): Promise<void> {
  await fastify.register(cors, {
    origin: [opts.config.appUrl],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Service-Token'],
    maxAge: 86400,
  });
}

export const corsPlugin = fp(corsPluginImpl, { name: 'cors-plugin' });
