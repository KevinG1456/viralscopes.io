import { createDbClient, type Database } from '@viralscopes/db';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';

import type { AppConfig } from '../config.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}

interface DbPluginOptions extends FastifyPluginOptions {
  config: AppConfig;
}

// Connects via DATABASE_APP_URL -- the restricted app_user role from
// packages/db/src/setup-roles.ts, never the migration/owner role. RLS
// policies only apply to a non-owning, non-superuser role; see DEC-014
// in PROJECT_STATUS.md.
async function dbPluginImpl(fastify: FastifyInstance, opts: DbPluginOptions): Promise<void> {
  const db = createDbClient(opts.config.databaseAppUrl);
  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    await db.$client.end();
  });
}

export const dbPlugin = fp(dbPluginImpl, { name: 'db-plugin' });
