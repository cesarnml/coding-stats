#!/usr/bin/env tsx
/**
 * ci:quiet — runs pnpm run ci and emits only failure lines.
 * Silent on success. Passes through the ci exit code.
 */
import { spawnSync } from 'node:child_process';

const result = spawnSync('pnpm', ['run', 'ci'], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ['inherit', 'pipe', 'pipe'],
});

const stdout = result.stdout?.toString() ?? '';
const stderr = result.stderr?.toString() ?? '';
const combined = [stdout, stderr].filter(Boolean).join('\n');
const exitCode = result.status ?? 1;

if (exitCode !== 0) {
  const FAILURE_PATTERN =
    /error:|\bwarn\b|\[warn\]|✗|exit code|\(fail\)|not ok|# fail|AssertionError| tests failed| exited with code /i;
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
