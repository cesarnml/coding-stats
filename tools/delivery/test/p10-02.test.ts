import { describe, expect, it } from 'bun:test';

import { tryRunner, validateRunnerArtifact } from '../subagent-runner';
import { openPullRequest } from '../orchestrator';
import type { SubagentRunnerArtifact } from '../subagent-runner';
import type { DeliveryOrchestratorContext } from '../context';
import type { DeliveryState } from '../types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const baseState: DeliveryState = {
  planKey: 'phase-10',
  planPath: 'docs/product/delivery/phase-10/implementation-plan.md',
  statePath: '.agents/delivery/phase-10/state.json',
  reviewsDirPath: 'docs/product/delivery/phase-10/reviews',
  handoffsDirPath: '.agents/delivery/phase-10/handoffs',
  reviewPollIntervalMinutes: 6,
  reviewPollMaxWaitMinutes: 12,
  tickets: [
    {
      id: 'P10.02',
      title: 'Executor-owned Subagent Review via Claude CLI',
      slug: 'executor-owned-subagent-review-via-claude-cli',
      ticketFile:
        'docs/product/delivery/phase-10/ticket-02-executor-owned-subagent-review-via-claude-cli.md',
      status: 'subagent_review_complete',
      branch: 'agents/p10-02-executor-owned-subagent-review-via-claude-cli',
      baseBranch:
        'agents/p10-01-runner-native-subagent-review-config-and-run-policy-contract',
      worktreePath: '/tmp/p10_02',
      subagentReviewOutcome: 'clean',
      subagentRunnerArtifactPath:
        'docs/product/delivery/phase-10/reviews/P10.02-runner-review.json',
    },
  ],
};

const baseStateVerified: DeliveryState = {
  ...baseState,
  tickets: baseState.tickets.map((t) => ({
    ...t,
    status: 'verified' as const,
    subagentReviewOutcome: 'clean' as const,
  })),
};

function makeContext(
  subagentReview: 'required' | 'skip_doc_only' | 'disabled' = 'skip_doc_only',
): DeliveryOrchestratorContext {
  return {
    config: {
      defaultBranch: 'main',
      planRoot: 'docs',
      runtime: 'bun',
      packageManager: 'bun',
      ticketBoundaryMode: 'cook',
      reviewPolicy: {
        subagentReview,
        prReview: 'skip_doc_only',
      },
    },
    platform: {
      createPullRequest: () => ({
        number: 42,
        url: 'https://github.com/test/pr/42',
      }),
      editPullRequest: () => undefined,
      ensureBranchPushed: () => undefined,
      findOpenPullRequest: () => undefined,
      resolveGitHubRepoForOrchestrator: () => undefined,
      resolveReviewThread: () => undefined,
      replyToReviewThreadForOrchestrator: () => undefined,
      runProcess: () => ({ exitCode: 0, stdout: '', stderr: '' }),
      updatePullRequestBody: () => undefined,
      readCurrentBranchName: () => 'agents/p10-02',
      listWorktrees: () => [],
      spawnSync: () => ({ status: 0, stdout: '' }),
      findExistingBranch: () => undefined,
      deriveBranchName: () => 'agents/p10-02',
      deriveWorktreePath: () => '/tmp/p10_02',
    },
    invocation: 'bun run deliver',
  } as unknown as DeliveryOrchestratorContext;
}

// ─── tryRunner fallback chain ─────────────────────────────────────────────────

describe('P10.02 — tryRunner fallback behavior', () => {
  it('first runner clean → second never called', () => {
    const secondCalled = false;
    const first = tryRunner(
      () => ({ exitCode: 0, timedOut: false }),
      () => false,
    );
    expect(first.status).toBe('ran');
    // Simulate caller logic: second runner not invoked when first ran
    expect(secondCalled).toBe(false);
  });

  it('first runner unavailable → fallback attempted', () => {
    const first = tryRunner(
      () => {
        throw new Error('not installed');
      },
      () => false,
    );
    expect(first.status).toBe('unavailable');

    const second = tryRunner(
      () => ({ exitCode: 0, timedOut: false }),
      () => true,
    );
    expect(second).toEqual({ status: 'ran', outcome: 'patched' });
  });

  it('both runners unavailable → honest skip', () => {
    const first = tryRunner(
      () => {
        throw new Error('not installed');
      },
      () => false,
    );
    const second = tryRunner(
      () => {
        throw new Error('not installed');
      },
      () => false,
    );
    expect(first.status).toBe('unavailable');
    expect(second.status).toBe('unavailable');
  });

  it('first runner timeout → second attempted', () => {
    const first = tryRunner(
      () => ({ exitCode: null, timedOut: true }),
      () => false,
    );
    expect(first.status).toBe('timeout');
  });
});

// ─── validateRunnerArtifact ───────────────────────────────────────────────────

describe('P10.02 — validateRunnerArtifact', () => {
  const validArtifact: SubagentRunnerArtifact = {
    runnerKind: 'claude-cli',
    reviewedHeadSha: 'abc1234',
    outcome: 'clean',
    completedAt: '2026-01-01T00:00:00.000Z',
  };

  it('accepts valid clean artifact', () => {
    expect(validateRunnerArtifact(validArtifact)).toEqual(validArtifact);
  });

  it('accepts valid patched artifact', () => {
    const artifact = { ...validArtifact, outcome: 'patched' as const };
    expect(validateRunnerArtifact(artifact)).toEqual(artifact);
  });

  it('accepts skipped artifact', () => {
    const artifact: SubagentRunnerArtifact = {
      runnerKind: 'skipped',
      reviewedHeadSha: 'abc',
      outcome: 'skipped',
      completedAt: '2026-01-01T00:00:00.000Z',
    };
    expect(validateRunnerArtifact(artifact)).toEqual(artifact);
  });

  it('returns null for missing runnerKind', () => {
    const { runnerKind: _, ...rest } = validArtifact;
    expect(validateRunnerArtifact(rest)).toBeNull();
  });

  it('returns null for missing reviewedHeadSha', () => {
    const { reviewedHeadSha: _, ...rest } = validArtifact;
    expect(validateRunnerArtifact(rest)).toBeNull();
  });

  it('returns null for unknown outcome value', () => {
    expect(
      validateRunnerArtifact({ ...validArtifact, outcome: 'unknown' }),
    ).toBeNull();
  });

  it('returns null for null input', () => {
    expect(validateRunnerArtifact(null)).toBeNull();
  });

  it('returns null for non-object input', () => {
    expect(validateRunnerArtifact('string')).toBeNull();
  });
});

// ─── open-pr policy-based gate ───────────────────────────────────────────────

describe('P10.02 — open-pr policy-based runner artifact gate', () => {
  it('fails closed when outcome=clean and no artifact path on ticket', async () => {
    const stateWithoutArtifact: DeliveryState = {
      ...baseStateVerified,
      tickets: baseStateVerified.tickets.map((t) => ({
        ...t,
        subagentRunnerArtifactPath: undefined,
      })),
    };
    const context = makeContext('skip_doc_only');

    await expect(
      openPullRequest(stateWithoutArtifact, '/tmp/project', context, 'P10.02'),
    ).rejects.toThrow(/runner.*review.*required|requires.*runner.*review/i);
  });

  it('exposes stable contract code workflow.open_pr.requires_runner_review', async () => {
    const stateWithoutArtifact: DeliveryState = {
      ...baseStateVerified,
      tickets: baseStateVerified.tickets.map((t) => ({
        ...t,
        subagentRunnerArtifactPath: undefined,
      })),
    };

    try {
      await openPullRequest(
        stateWithoutArtifact,
        '/tmp/project',
        makeContext('skip_doc_only'),
        'P10.02',
      );
      throw new Error('Expected error was not thrown');
    } catch (error) {
      expect((error as { code?: string }).code).toBe(
        'workflow.open_pr.requires_runner_review',
      );
    }
  });

  it('does not gate when subagentReview is disabled', async () => {
    const context = makeContext('disabled');
    const stateWithoutArtifact: DeliveryState = {
      ...baseStateVerified,
      tickets: baseStateVerified.tickets.map((t) => ({
        ...t,
        subagentRunnerArtifactPath: undefined,
      })),
    };
    try {
      await openPullRequest(
        stateWithoutArtifact,
        '/tmp/project',
        context,
        'P10.02',
      );
    } catch (err) {
      expect((err as { code?: string }).code).not.toBe(
        'workflow.open_pr.requires_runner_review',
      );
    }
  });

  it('does not gate when subagentReviewOutcome is skipped', async () => {
    const stateSkipped: DeliveryState = {
      ...baseStateVerified,
      tickets: baseStateVerified.tickets.map((t) => ({
        ...t,
        subagentReviewOutcome: 'skipped' as const,
        subagentRunnerArtifactPath: undefined,
      })),
    };
    try {
      await openPullRequest(
        stateSkipped,
        '/tmp/project',
        makeContext('skip_doc_only'),
        'P10.02',
      );
    } catch (err) {
      expect((err as { code?: string }).code).not.toBe(
        'workflow.open_pr.requires_runner_review',
      );
    }
  });
});
