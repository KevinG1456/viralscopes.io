#!/usr/bin/env node
// Production-aware npm audit policy.
//
// Why this exists instead of a bare `npm audit --audit-level=high`: that
// naive gate fails on advisories in devDependencies (ESLint's minimatch
// chain, previously drizzle-kit's esbuild) that ship no risk to what
// actually runs in production, and on advisories with no available fix
// (Next.js's bundled sharp/postcss) that a blanket gate can only "fix" by
// downgrading to a 7-major-version-old release. Neither is an actionable
// signal, and a workflow that fails on unactionable findings gets ignored
// or disabled -- which is worse than not having it.
//
// Policy:
//   1. Only production dependencies are checked (`npm audit --omit=dev`).
//      Dev-only advisories are still reported, never hidden, but don't
//      block the build.
//   2. Any high/critical finding must be either fixed or explicitly
//      allowlisted in .github/security/audit-allowlist.json, with a
//      reason and a review-by date.
//   3. An allowlist entry past its review-by date fails the build --
//      this is a forced periodic re-check, not a silent permanent
//      suppression.

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ALLOWLIST_PATH = path.join(__dirname, '..', 'security', 'audit-allowlist.json');
const BLOCKING_SEVERITIES = ['high', 'critical'];

function runAudit(omitDev) {
  const cmd = `npm audit --audit-level=high ${omitDev ? '--omit=dev' : ''} --json`;
  try {
    return JSON.parse(execSync(cmd, { encoding: 'utf8' }));
  } catch (err) {
    // npm audit exits non-zero when vulnerabilities are found; the JSON
    // report is still on stdout.
    if (err.stdout) return JSON.parse(err.stdout);
    throw err;
  }
}

function extractAdvisoryIds(via) {
  return via
    .filter((entry) => typeof entry === 'object' && typeof entry.url === 'string')
    .map((entry) => entry.url.split('/').pop());
}

function main() {
  const allowlist = JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8'));
  const today = new Date().toISOString().slice(0, 10);

  const expired = allowlist.entries.filter((entry) => entry.reviewBy < today);
  if (expired.length > 0) {
    console.error(
      '\n✖ The following audit allowlist entries are past their review date and must be re-evaluated (fixed, re-dated with justification, or removed if genuinely no longer applicable):\n',
    );
    for (const entry of expired) {
      console.error(`  - ${entry.advisory} (${entry.package}) — review was due ${entry.reviewBy}`);
    }
    process.exitCode = 1;
    return;
  }

  // Informational only — reported in full, including dev dependencies,
  // so nothing is hidden even though it doesn't gate the build.
  const fullAudit = runAudit(false);
  const fullCounts = fullAudit.metadata?.vulnerabilities ?? {};
  console.log('Full dependency audit (informational — includes devDependencies):');
  console.log(
    `  info: ${fullCounts.info ?? 0}  low: ${fullCounts.low ?? 0}  moderate: ${fullCounts.moderate ?? 0}  high: ${fullCounts.high ?? 0}  critical: ${fullCounts.critical ?? 0}`,
  );

  // Blocking check — production dependencies only.
  const prodAudit = runAudit(true);
  const vulnerabilities = prodAudit.vulnerabilities ?? {};

  const unaddressed = [];
  const allowlisted = [];

  for (const [pkgName, vuln] of Object.entries(vulnerabilities)) {
    if (!BLOCKING_SEVERITIES.includes(vuln.severity)) continue;

    // npm audit lists a package as vulnerable "by effect" when a package
    // it depends on has the real advisory (e.g. `next` is listed because
    // its bundled `postcss`/`sharp` are vulnerable) -- its own `via` array
    // is then just a list of dependency names (strings), not advisory
    // objects. That real advisory is evaluated under postcss/sharp's own
    // entry, so skip these pass-through entries here.
    const isEffectOnly = vuln.via.every((entry) => typeof entry === 'string');
    if (isEffectOnly) continue;

    const advisoryIds = extractAdvisoryIds(vuln.via);
    const matchedEntries = advisoryIds
      .map((id) => allowlist.entries.find((entry) => entry.advisory === id))
      .filter(Boolean);

    if (advisoryIds.length > 0 && matchedEntries.length === advisoryIds.length) {
      allowlisted.push({ pkgName, severity: vuln.severity, entries: matchedEntries });
    } else {
      unaddressed.push({ pkgName, severity: vuln.severity, advisoryIds });
    }
  }

  if (allowlisted.length > 0) {
    console.log('\nAccepted (allowlisted, with review dates):');
    for (const item of allowlisted) {
      for (const entry of item.entries) {
        console.log(
          `  - ${entry.advisory} (${item.pkgName}, ${entry.severity}) — review by ${entry.reviewBy}`,
        );
        console.log(`    ${entry.reason}`);
      }
    }
  }

  if (unaddressed.length > 0) {
    console.error(
      '\n✖ Unaddressed high/critical severity vulnerabilities in PRODUCTION dependencies:\n',
    );
    for (const item of unaddressed) {
      console.error(
        `  - ${item.pkgName} (${item.severity}): ${item.advisoryIds.join(', ') || 'no advisory URL'}`,
      );
    }
    console.error(
      '\nEach of these must be fixed, or added to .github/security/audit-allowlist.json with a reason and a review-by date.',
    );
    process.exitCode = 1;
    return;
  }

  console.log('\n✓ No unaddressed high/critical vulnerabilities in production dependencies.');
}

main();
