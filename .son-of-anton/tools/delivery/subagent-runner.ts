export type SubagentRunnerOutcome = 'clean' | 'patched' | 'skipped';

export type SubagentRunnerArtifact = {
  runnerKind: 'claude-cli' | 'codex-exec' | 'skipped';
  reviewedHeadSha: string;
  outcome: SubagentRunnerOutcome;
  completedAt: string;
};

export type SpawnResult = {
  exitCode: number | null;
  timedOut: boolean;
};

export type RunnerAttemptResult =
  | { status: 'ran'; outcome: 'clean' | 'patched' }
  | { status: 'unavailable' }
  | { status: 'timeout' };

export function tryRunner(
  spawnProcess: () => SpawnResult,
  checkHasChanges: () => boolean,
): RunnerAttemptResult {
  let result: SpawnResult;
  try {
    result = spawnProcess();
  } catch {
    return { status: 'unavailable' };
  }

  if (result.timedOut) return { status: 'timeout' };

  const hasChanges = checkHasChanges();
  return { status: 'ran', outcome: hasChanges ? 'patched' : 'clean' };
}

export function buildRunnerArtifact(
  runnerKind: SubagentRunnerArtifact['runnerKind'],
  reviewedHeadSha: string,
  outcome: SubagentRunnerOutcome,
): SubagentRunnerArtifact {
  return {
    runnerKind,
    reviewedHeadSha,
    outcome,
    completedAt: new Date().toISOString(),
  };
}

const VALID_RUNNER_KINDS: SubagentRunnerArtifact['runnerKind'][] = [
  'claude-cli',
  'codex-exec',
  'skipped',
];
const VALID_OUTCOMES: SubagentRunnerOutcome[] = ['clean', 'patched', 'skipped'];

export function validateRunnerArtifact(
  value: unknown,
): SubagentRunnerArtifact | null {
  if (typeof value !== 'object' || value === null) return null;

  const obj = value as Record<string, unknown>;

  if (
    typeof obj['runnerKind'] !== 'string' ||
    !(VALID_RUNNER_KINDS as string[]).includes(obj['runnerKind'])
  ) {
    return null;
  }

  if (typeof obj['reviewedHeadSha'] !== 'string') return null;

  if (
    typeof obj['outcome'] !== 'string' ||
    !(VALID_OUTCOMES as string[]).includes(obj['outcome'])
  ) {
    return null;
  }

  if (typeof obj['completedAt'] !== 'string') return null;

  return {
    runnerKind: obj['runnerKind'] as SubagentRunnerArtifact['runnerKind'],
    reviewedHeadSha: obj['reviewedHeadSha'] as string,
    outcome: obj['outcome'] as SubagentRunnerOutcome,
    completedAt: obj['completedAt'] as string,
  };
}
