import { baseConfig } from '../../eslint.config.base.mjs';

export default [
  ...baseConfig,
  {
    // CLI entrypoints run via `npm run db:*` -- console output is the
    // interface here, not a debugging leftover (unlike apps/api, which
    // logs through Pino -- see apps/api/src/plugins/logger.plugin.ts).
    files: ['src/migrate.ts', 'src/reset.ts', 'src/setup-roles.ts', 'src/seeds/run.ts'],
    rules: {
      'no-console': 'off',
    },
  },
];
