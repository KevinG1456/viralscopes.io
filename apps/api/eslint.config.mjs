import { baseConfig } from '../../eslint.config.base.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['dist/**'],
  },
  {
    // CLI entrypoint run via `npm run ai:regression` -- console output is
    // the interface here, not a debugging leftover (unlike the rest of
    // apps/api, which logs through Pino). Same pattern as packages/db's
    // eslint.config.mjs for its own CLI scripts.
    files: ['src/scripts/run-ai-regression.ts'],
    rules: {
      'no-console': 'off',
    },
  },
];
