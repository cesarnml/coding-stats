#!/usr/bin/env tsx
/**
 * verify:quiet — runs pnpm run verify and emits only failure lines.
 * Silent on success. Passes through the verify exit code.
 */
import { spawnSync } from 'node:child_process';

const result = spawnSync('pnpm', ['run', 'verify'], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ['inherit', 'pipe', 'pipe'],
});

const stdout = result.stdout?.toString() ?? '';
const stderr = result.stderr?.toString() ?? '';
const combined = [stdout, stderr].filter(Boolean).join('\n');
const exitCode = result.status ?? 1;

if (exitCode !== 0) {
  if (/Code style issues found|prettier --write/i.test(combined)) {
    console.error('hint: run pnpm format to fix formatting issues');
  }
  const FAILURE_PATTERN = /error|warn|\[warn\]|FAIL|✗|exit code/i;
  const failureLines = combined
    .split('\n')
    .filter((line) => FAILURE_PATTERN.test(line));

  if (failureLines.length > 0) {
    console.error(failureLines.join('\n'));
  } else if (result.error) {
    console.error(result.error.message);
  } else {
    console.error(combined.trim());
  }
}

process.exit(exitCode);
