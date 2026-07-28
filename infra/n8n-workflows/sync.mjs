#!/usr/bin/env node
// Imports/exports n8n workflow JSON between this directory and the running
// n8n container -- via `docker cp` + the n8n CLI, not n8n's REST API
// (which requires an interactively-created owner account on a fresh
// instance, not just N8N_BASIC_AUTH_*; confirmed live during Phase 6
// verification). Requires the n8n container from docker-compose.dev.yml
// (or .prod.yml) to already be running.
//
// Usage:
//   node infra/n8n-workflows/sync.mjs import   (or: npm run workflows:import)
//   node infra/n8n-workflows/sync.mjs export   (or: npm run workflows:export)
//
// After import, workflows are inactive until published + n8n is restarted
// (`docker restart <container>` or `docker compose ... restart n8n`) --
// this script does not restart the container for you, since that would
// interrupt any in-flight executions.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WORKFLOWS_DIR = dirname(fileURLToPath(import.meta.url));
const CONTAINER = process.env.N8N_CONTAINER_NAME ?? 'viralscopesio-n8n-1';

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: 'inherit' });
}

function importWorkflows() {
  const files = readdirSync(WORKFLOWS_DIR).filter((f) => f.endsWith('.json'));
  if (files.length === 0) {
    console.log('No workflow JSON files found in', WORKFLOWS_DIR);
    return;
  }

  for (const file of files) {
    const hostPath = join(WORKFLOWS_DIR, file);
    const containerPath = `/tmp/${file}`;
    console.log(`Importing ${file}...`);
    run('docker', ['cp', hostPath, `${CONTAINER}:${containerPath}`]);
    run('docker', ['exec', CONTAINER, 'n8n', 'import:workflow', `--input=${containerPath}`]);
  }

  console.log(
    '\nImported. Workflows are inactive until published + n8n is restarted:\n' +
      files
        .map((f) => `  docker exec ${CONTAINER} n8n publish:workflow --id=<workflow-id-from-${f}>`)
        .join('\n') +
      `\n  docker restart ${CONTAINER}`,
  );
}

function exportWorkflows() {
  const containerDir = '/tmp/n8n-export';
  run('docker', ['exec', CONTAINER, 'mkdir', '-p', containerDir]);
  run('docker', [
    'exec',
    CONTAINER,
    'n8n',
    'export:workflow',
    '--all',
    '--separate',
    `--output=${containerDir}`,
  ]);

  mkdirSync(WORKFLOWS_DIR, { recursive: true });
  run('docker', ['cp', `${CONTAINER}:${containerDir}/.`, WORKFLOWS_DIR]);
  console.log(`\nExported all workflows to ${WORKFLOWS_DIR}. Review the diff before committing --`);
  console.log(
    'exported files include n8n-internal fields (versionId, etc.) that change on every export.',
  );
}

const mode = process.argv[2];
if (mode === 'import') {
  importWorkflows();
} else if (mode === 'export') {
  exportWorkflows();
} else {
  console.error('Usage: node sync.mjs <import|export>');
  process.exit(1);
}
