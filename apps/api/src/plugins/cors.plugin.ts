import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';

// Per-environment CORS policy (INFRASTRUCTURE_GROWTH_PLAN.md / PROJECT_RULES.md 4.2):
// locked to allowed origins, no wildcard in production.
export async function registerCors(app: FastifyInstance): Promise<void> {
  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim());

  await app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
  });
}
