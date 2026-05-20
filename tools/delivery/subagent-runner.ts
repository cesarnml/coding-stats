import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export type SubagentRunnerOutcome = 'clean' | 'patched' | 'skipped';

export type SubagentRunnerKind =
  | 'claude-cli'
  | 'codex-exec'
  | 'skipped'
  | 'operator-recorder';

export type SubagentRunnerTerminatedReason =
  | 'completed'
  | 'rate_limit'
  | 'sandbox_denied'
  | 'runner_unavailable'
  | 'runner_failed'
  | 'advisory_violation';

export type SubagentRunnerFallbackLevel =
  | 'preferred'
  | 'fallback'
  | 'failed_all'
  | 'not_applicable';

export type SubagentRunnerInvocation = {
  runnerKind: SubagentRunnerKind;
  reviewedHeadSha: string;
  outcome: SubagentRunnerOutcome;
  completedAt: string;
  terminatedReason: SubagentRunnerTerminatedReason;
  /**
   * Repo-relative path to `reviews/<ticket>-subagent-review-outcome.md` (runner
   * prose). Legacy artifacts may still store inline stdout/stderr text.
   */
  rawOutput?: string;
  /**
   * Repo-relative path to `reviews/<ticket>-subagent-adversarial-prompt.md`.
   * Legacy artifacts may still store inline prompt text.
   */
  filledPrompt?: string;
  fallbackLevel?: SubagentRunnerFallbackLevel;
  findings: string[];
  probedSurfaces: string[];
  patches: string[];
};

export type SubagentRunnerArtifact = {
  ticket: string;
  invocations: SubagentRunnerInvocation[];
};

export type SpawnResult = {
  exitCode: number | null;
  timedOut: boolean;
  stdout?: string;
  stderr?: string;
  rawOutput?: string;
  /**
   * Optional honest termination reason flagged by the spawn closure (e.g. a
   * rate-limit signature detected in stdout despite exit code 0). When omitted,
   * tryRunner defaults to `'completed'`.
   */
  terminatedReason?: SubagentRunnerTerminatedReason;
};

export type RunnerAttemptResult =
  | {
      status: 'ran';
      outcome: 'clean' | 'patched';
      terminatedReason: SubagentRunnerTerminatedReason;
      rawOutput?: string;
    }
  | { status: 'unavailable' }
  | { status: 'timeout' };

export function buildRunnerSpawnCommand(
  runner: Extract<SubagentRunnerKind, 'claude-cli' | 'codex-exec'>,
  reviewPrompt: string,
): { bin: string; args: string[] } {
  return runner === 'claude-cli'
    ? { bin: 'claude', args: ['-p', reviewPrompt] }
    : { bin: 'codex', args: ['exec', reviewPrompt] };
}

export const SUBAGENT_REVIEW_OUTCOME_SUFFIX = '-subagent-review-outcome.md';

export function deriveSubagentReviewOutcomePath(
  reviewsDirPath: string,
  ticketId: string,
): string {
  return `${reviewsDirPath}/${ticketId}${SUBAGENT_REVIEW_OUTCOME_SUFFIX}`;
}

export function formatRawRunnerOutput(stdout = '', stderr = ''): string {
  const sections: string[] = [];
  if (stdout.trim() !== '') sections.push(`stdout:\n${stdout.trimEnd()}`);
  if (stderr.trim() !== '') sections.push(`stderr:\n${stderr.trimEnd()}`);
  return sections.join('\n\n');
}

export type SubagentReviewOutcomeWriteResult = {
  absolutePath: string;
  relativePath: string;
};

/**
 * Format runner stdout/stderr and persist under the plan reviews directory.
 * The runner artifact stores `relativePath` in `rawOutput`, not the prose body.
 */
export function writeSubagentReviewOutcome(input: {
  repoRoot: string;
  reviewsDirPath: string;
  ticketId: string;
  stdout?: string;
  stderr?: string;
  /** When set, written as-is (must already be formatRawRunnerOutput-shaped). */
  content?: string;
}): SubagentReviewOutcomeWriteResult {
  const body =
    input.content ??
    formatRawRunnerOutput(input.stdout ?? '', input.stderr ?? '');
  const relativePath = deriveSubagentReviewOutcomePath(
    input.reviewsDirPath,
    input.ticketId,
  );
  const absolutePath = join(input.repoRoot, relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(
    absolutePath,
    body.endsWith('\n') ? body : `${body}\n`,
    'utf-8',
  );
  return { absolutePath, relativePath };
}

export function isSubagentReviewOutcomePath(value: string): boolean {
  return value.endsWith(SUBAGENT_REVIEW_OUTCOME_SUFFIX);
}

export function isSubagentAdversarialPromptReference(value: string): boolean {
  return value.endsWith('-subagent-adversarial-prompt.md');
}

export function classifyRunnerTermination(
  exitCode: number | null,
  stdout = '',
  stderr = '',
): SubagentRunnerTerminatedReason {
  const blob = `${stdout}\n${stderr}`.toLowerCase();
  if (
    /\byou['’]?ve hit your limit\b|\brate[\s_-]?limited\b|\brate[\s_-]?limit\s+(?:exceeded|reached|hit)\b|\b429\s+(too\s+many|rate)|\bquota\s+exceeded\b/.test(
      blob,
    )
  ) {
    return 'rate_limit';
  }
  if (/\bsandbox[\s_-]?(denied|blocked|violation)\b/.test(blob)) {
    return 'sandbox_denied';
  }
  if (exitCode !== 0) return 'runner_failed';
  if (`${stdout}${stderr}`.trim() === '') return 'runner_failed';
  return 'completed';
}

export function isDeliveryDocPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/').replace(/^\.\//, '');
  return (
    normalized === 'docs/product/delivery' ||
    normalized.startsWith('docs/product/delivery/')
  );
}

export function findDeliveryDocPaths(paths: string[]): string[] {
  return paths.filter(isDeliveryDocPath);
}

export function tryRunner(
  spawnProcess: () => SpawnResult,
  checkHasChanges: () => boolean,
): RunnerAttemptResult {
  let result: SpawnResult;
  try {
    // Synchronous spawn — checkHasChanges below is guaranteed post-exit so the
    // porcelain sample never races a runner that finishes its writes at exit.
    result = spawnProcess();
  } catch {
    return { status: 'unavailable' };
  }

  if (result.timedOut) return { status: 'timeout' };

  const hasOutputFields =
    result.stdout !== undefined ||
    result.stderr !== undefined ||
    result.rawOutput !== undefined;
  const terminatedReason =
    result.terminatedReason ??
    (hasOutputFields
      ? classifyRunnerTermination(result.exitCode, result.stdout, result.stderr)
      : 'completed');
  const hasChanges = checkHasChanges();
  return {
    status: 'ran',
    outcome: hasChanges ? 'patched' : 'clean',
    terminatedReason,
    rawOutput:
      result.rawOutput ??
      (hasOutputFields
        ? formatRawRunnerOutput(result.stdout, result.stderr)
        : undefined),
  };
}

/**
 * The narrow set of runner-attempt outcomes that justify falling back to the
 * other runner. Binary-availability failures and timeouts only — never
 * ambiguous output (rate_limit, sandbox_denied, exit-code-0-with-no-work),
 * which should surface honestly through terminatedReason instead.
 */
export function shouldFallbackToOtherRunner(
  result: RunnerAttemptResult,
): boolean {
  return result.status === 'unavailable' || result.status === 'timeout';
}

/**
 * @deprecated Legacy outcome resolver from before the advisory-only contract.
 * Retained only for test compatibility; runner invocation now uses
 * {@link decideAdvisoryRunnerOutcome} which enforces no-write semantics.
 */
export function decideSubagentOutcomeFromRunner(
  result: Extract<RunnerAttemptResult, { status: 'ran' }>,
): {
  outcome: SubagentRunnerOutcome;
  terminatedReason: SubagentRunnerTerminatedReason;
} {
  if (result.terminatedReason !== 'completed' && result.outcome === 'clean') {
    return { outcome: 'skipped', terminatedReason: result.terminatedReason };
  }
  return { outcome: result.outcome, terminatedReason: result.terminatedReason };
}

/**
 * Advisory-only contract for programmatic subagent runners.
 *
 * The runner is allowed to read and reason about the diff, but any file write
 * it performs (tracked or untracked, committed or working-tree) is a contract
 * violation, not a valid review outcome. This is the core P13.03 inversion:
 * `patched` is reserved for primary-agent recorder mode. The runner reports
 * findings; the primary agent applies any patches and records them separately.
 *
 * - runner wrote files → `{ outcome: 'skipped', terminatedReason: 'advisory_violation' }`
 * - runner completed cleanly and made no writes → preserve `clean`
 * - runner reported a non-completed termination reason (rate_limit, etc.) →
 *   collapse to `skipped` with the original terminatedReason preserved
 */
export function decideAdvisoryRunnerOutcome(
  result: Extract<RunnerAttemptResult, { status: 'ran' }>,
  info: { runnerWroteFiles: boolean },
): {
  outcome: SubagentRunnerOutcome;
  terminatedReason: SubagentRunnerTerminatedReason;
} {
  if (info.runnerWroteFiles) {
    return { outcome: 'skipped', terminatedReason: 'advisory_violation' };
  }
  if (result.terminatedReason !== 'completed') {
    return { outcome: 'skipped', terminatedReason: result.terminatedReason };
  }
  return { outcome: 'clean', terminatedReason: 'completed' };
}

const VALID_RUNNER_KINDS: SubagentRunnerKind[] = [
  'claude-cli',
  'codex-exec',
  'skipped',
  'operator-recorder',
];
const VALID_OUTCOMES: SubagentRunnerOutcome[] = ['clean', 'patched', 'skipped'];
const VALID_TERMINATED_REASONS: SubagentRunnerTerminatedReason[] = [
  'completed',
  'rate_limit',
  'sandbox_denied',
  'runner_unavailable',
  'runner_failed',
  'advisory_violation',
];
const VALID_FALLBACK_LEVELS: SubagentRunnerFallbackLevel[] = [
  'preferred',
  'fallback',
  'failed_all',
  'not_applicable',
];

export type BuildRunnerInvocationOptions = {
  terminatedReason?: SubagentRunnerTerminatedReason;
  rawOutput?: string;
  filledPrompt?: string;
  fallbackLevel?: SubagentRunnerFallbackLevel;
  findings?: string[];
  probedSurfaces?: string[];
  patches?: string[];
  completedAt?: string;
};

export function buildRunnerInvocation(
  runnerKind: SubagentRunnerKind,
  reviewedHeadSha: string,
  outcome: SubagentRunnerOutcome,
  options: BuildRunnerInvocationOptions = {},
): SubagentRunnerInvocation {
  return {
    runnerKind,
    reviewedHeadSha,
    outcome,
    completedAt: options.completedAt ?? new Date().toISOString(),
    terminatedReason: options.terminatedReason ?? 'completed',
    ...(options.rawOutput !== undefined
      ? { rawOutput: options.rawOutput }
      : {}),
    ...(options.filledPrompt !== undefined
      ? { filledPrompt: options.filledPrompt }
      : {}),
    ...(options.fallbackLevel !== undefined
      ? { fallbackLevel: options.fallbackLevel }
      : {}),
    findings: options.findings ?? [],
    probedSurfaces: options.probedSurfaces ?? [],
    patches: options.patches ?? [],
  };
}

export function buildRunnerArtifact(
  ticket: string,
  invocations: SubagentRunnerInvocation[],
): SubagentRunnerArtifact {
  return { ticket, invocations };
}

function validateInvocation(value: unknown): SubagentRunnerInvocation | null {
  if (typeof value !== 'object' || value === null) return null;
  const obj = value as Record<string, unknown>;

  if (
    typeof obj['runnerKind'] !== 'string' ||
    !(VALID_RUNNER_KINDS as string[]).includes(obj['runnerKind'])
  ) {
    return null;
  }
  if (
    typeof obj['reviewedHeadSha'] !== 'string' ||
    obj['reviewedHeadSha'] === ''
  ) {
    return null;
  }
  if (
    typeof obj['outcome'] !== 'string' ||
    !(VALID_OUTCOMES as string[]).includes(obj['outcome'])
  ) {
    return null;
  }
  if (typeof obj['completedAt'] !== 'string' || obj['completedAt'] === '') {
    return null;
  }
  if (
    typeof obj['terminatedReason'] !== 'string' ||
    !(VALID_TERMINATED_REASONS as string[]).includes(obj['terminatedReason'])
  ) {
    return null;
  }
  const findings = validateStringArray(obj['findings']);
  if (findings === null) return null;
  const probedSurfaces = validateStringArray(obj['probedSurfaces']);
  if (probedSurfaces === null) return null;
  const patches = validateStringArray(obj['patches']);
  if (patches === null) return null;
  if (obj['rawOutput'] !== undefined && typeof obj['rawOutput'] !== 'string') {
    return null;
  }
  if (
    obj['filledPrompt'] !== undefined &&
    typeof obj['filledPrompt'] !== 'string'
  ) {
    return null;
  }
  if (
    obj['fallbackLevel'] !== undefined &&
    (typeof obj['fallbackLevel'] !== 'string' ||
      !(VALID_FALLBACK_LEVELS as string[]).includes(obj['fallbackLevel']))
  ) {
    return null;
  }

  return {
    runnerKind: obj['runnerKind'] as SubagentRunnerKind,
    reviewedHeadSha: obj['reviewedHeadSha'] as string,
    outcome: obj['outcome'] as SubagentRunnerOutcome,
    completedAt: obj['completedAt'] as string,
    terminatedReason: obj['terminatedReason'] as SubagentRunnerTerminatedReason,
    ...(obj['rawOutput'] !== undefined
      ? { rawOutput: obj['rawOutput'] as string }
      : {}),
    ...(obj['filledPrompt'] !== undefined
      ? { filledPrompt: obj['filledPrompt'] as string }
      : {}),
    ...(obj['fallbackLevel'] !== undefined
      ? { fallbackLevel: obj['fallbackLevel'] as SubagentRunnerFallbackLevel }
      : {}),
    findings,
    probedSurfaces,
    patches,
  };
}

function validateStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  for (const entry of value) {
    if (typeof entry !== 'string') return null;
  }
  return value as string[];
}

export function validateRunnerArtifact(
  value: unknown,
): SubagentRunnerArtifact | null {
  if (typeof value !== 'object' || value === null) return null;
  const obj = value as Record<string, unknown>;

  if (typeof obj['ticket'] !== 'string' || obj['ticket'] === '') return null;
  if (!Array.isArray(obj['invocations'])) return null;

  const invocations: SubagentRunnerInvocation[] = [];
  for (const raw of obj['invocations']) {
    const validated = validateInvocation(raw);
    if (!validated) return null;
    invocations.push(validated);
  }
  if (invocations.length === 0) return null;

  return { ticket: obj['ticket'] as string, invocations };
}

function isLegacyShape(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return !('invocations' in obj) && !('ticket' in obj) && 'runnerKind' in obj;
}

function liftLegacyArtifact(
  raw: Record<string, unknown>,
  ticket: string,
  sourcePath: string,
): SubagentRunnerArtifact {
  if (
    typeof raw['reviewedHeadSha'] !== 'string' ||
    raw['reviewedHeadSha'] === ''
  ) {
    throw new Error(
      `Legacy subagent runner artifact at ${sourcePath} is missing required field: reviewedHeadSha.`,
    );
  }
  if (
    typeof raw['outcome'] !== 'string' ||
    !(VALID_OUTCOMES as string[]).includes(raw['outcome'] as string)
  ) {
    throw new Error(
      `Legacy subagent runner artifact at ${sourcePath} is missing required field: outcome.`,
    );
  }
  if (typeof raw['completedAt'] !== 'string' || raw['completedAt'] === '') {
    throw new Error(
      `Legacy subagent runner artifact at ${sourcePath} is missing required field: completedAt.`,
    );
  }
  if (!(VALID_RUNNER_KINDS as string[]).includes(raw['runnerKind'] as string)) {
    throw new Error(
      `Legacy subagent runner artifact at ${sourcePath} has invalid runnerKind: ${String(raw['runnerKind'])}.`,
    );
  }

  const invocation: SubagentRunnerInvocation = {
    runnerKind: raw['runnerKind'] as SubagentRunnerKind,
    reviewedHeadSha: raw['reviewedHeadSha'],
    outcome: raw['outcome'] as SubagentRunnerOutcome,
    completedAt: raw['completedAt'],
    terminatedReason: 'completed',
    findings: [],
    probedSurfaces: [],
    patches: [],
  };
  return { ticket, invocations: [invocation] };
}

export function readSubagentRunnerArtifact(
  path: string,
  ticket: string,
): SubagentRunnerArtifact {
  const raw = JSON.parse(readFileSync(path, 'utf-8')) as unknown;

  if (isLegacyShape(raw)) {
    return liftLegacyArtifact(raw as Record<string, unknown>, ticket, path);
  }

  const validated = validateRunnerArtifact(raw);
  if (!validated) {
    throw new Error(
      `Subagent runner artifact at ${path} is not a valid structured SubagentRunnerArtifact.`,
    );
  }
  return validated;
}

export type ParsedSubagentReviewArgs = {
  ticketId?: string;
  outcome?: 'clean' | 'patched';
  reviewedHeadSha?: string;
  patchCommitArgs: string[];
  force: boolean;
};

export function parseSubagentReviewArgs(
  positionals: string[],
  flags: Set<string>,
): ParsedSubagentReviewArgs {
  const isOutcome = (value: string | undefined): value is 'clean' | 'patched' =>
    value === 'clean' || value === 'patched';

  let cursor = 0;
  let ticketId: string | undefined;

  if (positionals[cursor] !== undefined && !isOutcome(positionals[cursor])) {
    ticketId = positionals[cursor];
    cursor += 1;
  }

  let outcome: 'clean' | 'patched' | undefined;
  if (isOutcome(positionals[cursor])) {
    outcome = positionals[cursor] as 'clean' | 'patched';
    cursor += 1;
  }

  let reviewedHeadSha: string | undefined;
  if (outcome) {
    const sha = positionals[cursor];
    if (sha === undefined || sha.trim() === '') {
      throw new Error(
        'subagent-review recorder mode requires a HEAD SHA after the outcome: `subagent-review [ticket-id] <clean|patched> <sha> [patch-commit-sha ...]`.',
      );
    }
    reviewedHeadSha = sha;
    cursor += 1;
  }

  const patchCommitArgs = positionals.slice(cursor);
  if (!outcome && patchCommitArgs.length > 0) {
    throw new Error(
      `Unexpected positional argument: \`${patchCommitArgs[0]}\`. Usage: \`subagent-review [ticket-id] [clean|patched <sha> [patch-commit-sha ...]] [--force]\`.`,
    );
  }
  if (outcome === 'clean' && patchCommitArgs.length > 0) {
    throw new Error(
      'subagent-review patch commits are only allowed when outcome is `patched`.',
    );
  }

  return {
    ticketId,
    outcome,
    reviewedHeadSha,
    patchCommitArgs,
    force: flags.has('force'),
  };
}

export type SubagentReviewModeDecision =
  | {
      kind: 'recorder';
      reviewedHeadSha: string;
      outcome: 'clean' | 'patched';
    }
  | {
      kind: 'no-op';
      reviewedHeadSha: string;
      existingInvocationIndex: number;
    }
  | { kind: 'invoke-runner' };

export function decideSubagentReviewMode(
  args: {
    outcome?: 'clean' | 'patched';
    reviewedHeadSha?: string;
    force: boolean;
  },
  artifact: SubagentRunnerArtifact | null,
  currentHeadSha: string,
): SubagentReviewModeDecision {
  if (args.outcome && args.reviewedHeadSha) {
    return {
      kind: 'recorder',
      reviewedHeadSha: args.reviewedHeadSha,
      outcome: args.outcome,
    };
  }

  if (!args.force && artifact && currentHeadSha) {
    const idx = artifact.invocations.findIndex(
      (invocation) =>
        invocation.reviewedHeadSha === currentHeadSha &&
        invocation.outcome !== 'skipped',
    );
    if (idx >= 0) {
      return {
        kind: 'no-op',
        reviewedHeadSha: currentHeadSha,
        existingInvocationIndex: idx,
      };
    }
  }

  return { kind: 'invoke-runner' };
}

export function tryReadSubagentRunnerArtifact(
  path: string,
  ticket: string,
): SubagentRunnerArtifact | null {
  if (!existsSync(path)) return null;
  return readSubagentRunnerArtifact(path, ticket);
}

export function appendInvocationToArtifact(
  path: string,
  ticket: string,
  invocation: SubagentRunnerInvocation,
): SubagentRunnerArtifact {
  let existing: SubagentRunnerArtifact | null = null;
  if (existsSync(path)) {
    existing = readSubagentRunnerArtifact(path, ticket);
  }
  const invocations = existing
    ? [...existing.invocations, invocation]
    : [invocation];
  const artifact: SubagentRunnerArtifact = { ticket, invocations };

  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(artifact, null, 2) + '\n', 'utf-8');
  return artifact;
}
