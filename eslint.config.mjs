// Root ESLint config — only lints stray top-level files (config scripts, etc.).
// Every package under apps/ and packages/ has its own eslint.config.mjs that
// imports and extends eslint.config.base.mjs; flat config does not cascade
// across directories, so each package must declare its own file.
import baseConfig from './eslint.config.base.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['apps/**', 'packages/**', 'node_modules/**', '.turbo/**'],
  },
];
