import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { realpath } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
  getUsage,
  parseCliArgs,
  resolveOptionsForCommand,
  resolveRuntimePolicyOverrides,
} from './cli';
import { ensureEnvReady as ensureEnvReadyImpl } from './env';
import {
  generateRunDeliverInvocation,
  loadOrchestratorConfig,
  resolveOrchestratorConfig,
} from './runtime-config';
import type {
  ResolvedOrchestratorConfig,
  ReviewPolicyStageValue,
  TicketBoundaryMode,
} from './config';
import type {
  DeliveryState,
  InternalReviewPatchCommit,
  OrchestratorOptions,
  ReviewOutcome,
  ReviewResult,
  StandaloneAiReviewResult,
  TicketDefinition,
  TicketState,
} from './types';
import {
  createDeliveryOrchestratorContext,
  type DeliveryOrchestratorContext,
} from './context';
import {
  copyLocalBootstrapFilesIfPresent as copyPlatformBootstrapFilesIfPresent,
  copyLocalEnvIfPresent as copyPlatformEnvIfPresent,
  findPrimaryWorktreePath as findPlatformPrimaryWorktreePath,
  isLocalBranchDocOnly as isPlatformLocalBranchDocOnly,
  type Runtime,
} from './platform';
import {
  createOptions as createOptionsImpl,
  deriveBranchName,
  derivePlanKey as derivePlanKeyImpl,
  deriveWorktreePath,
  findExistingBranch,
  inferPlanPathFromBranch as inferPlanPathFromBranchImpl,
  parsePlan as parsePlanImpl,
  relativeToRepo,
  resolvePlanPathForBranch as resolvePlanPathForBranchImpl,
} from './planning';
import {
  applyRunPolicyToConfig,
  deriveRunPolicyFromConfig,
  detectRunPolicyDivergence,
  formatRunPolicyDivergenceError,
  loadState as loadStateImpl,
  normalizeRunPolicy,
  patchRunPolicyWithFlags,
  repairState as repairStateImpl,
  saveState as saveStateImpl,
  summarizeStateDifferences as summarizeStateDifferencesImpl,
  syncStateFromExisting as syncStateFromExistingImpl,
  syncStateFromScratch as syncStateFromScratchImpl,
} from './state';
import {
  buildRunBlockedEvent,
  buildStandaloneReviewRecordedEvent,
  emitNotificationWarnings,
  eventsForAdvanceCommand,
  eventsForOpenPrCommand,
  eventsForPollReviewCommand,
  eventsForReconcileLateReviewCommand,
  eventsForRecordReviewCommand,
  eventsForStartCommand,
  formatReviewWindowMessage,
  resolveNotifier,
  type DeliveryNotifier,
} from './notifications';
import {
  assertReviewerFacingMarkdown,
  buildPullRequestBody,
  buildPullRequestTitle,
  buildStandaloneReviewStartedEvent,
} from './pr-metadata';
import {
  formatAdvanceBoundaryGuidance,
  formatCurrentTicketStatus,
  formatRepairSummary,
  formatStandaloneAiReviewResult,
  formatStatus,
  resolveNextCommand,
  type RepairStateResult,
} from './format';
import {
  recordTicketReview,
  runReconcileLateTicketReview,
  runStandaloneAiReviewLifecycle,
  runTicketReviewLifecycle,
  type StandaloneAiReviewDependencies,
  type TicketReviewDependencies,
} from './review';
import {
  advanceToNextTicket,
  createWorkflowContractError,
  materializeTicketContext,
  openPullRequest as openPullRequestImpl,
  recordSubagentReview as recordSubagentReviewImpl,
  recordPostRed as recordPostRedImpl,
  recordPostVerify as recordPostVerifyImpl,
  restackTicket as restackTicketImpl,
  startTicket as startTicketImpl,
} from './ticket-flow';
import {
  buildRunnerArtifact,
  tryRunner,
  validateRunnerArtifact,
} from './subagent-runner';

export const WORKTREE_EXEMPT = new Set(['status', 'sync', 'start']);

export function assertWorktreeGuard(
  cwd: string,
  command: string,
  positionals: string[],
  state: DeliveryState,
  config: ResolvedOrchestratorConfig,
): void {
  if (WORKTREE_EXEMPT.has(command)) return;

  const activeTicket =
    state.tickets.find((t) => t.status === 'in_progress') ??
    state.tickets.find((t) => t.status === 'red_complete') ??
    state.tickets.find((t) => t.status === 'verified') ??
    state.tickets.find((t) => t.status === 'subagent_review_complete') ??
    state.tickets.find((t) => t.status === 'in_review') ??
    state.tickets.find((t) => t.status === 'needs_patch') ??
    state.tickets.find((t) => t.status === 'operator_input_needed') ??
    state.tickets.find((t) => t.status === 'reviewed');

  if (!activeTicket) return;

  const resolvedCwd = cwd;
  const expectedPath = (() => {
    try {
      return realpathSync(activeTicket.worktreePath);
    } catch {
      return resolve(activeTicket.worktreePath);
    }
  })();

  if (resolvedCwd !== expectedPath) {
    const invoke = generateRunDeliverInvocation(config.packageManager);
    const recoveryArgs = [command, ...positionals].join(' ');
    const recovery = `cd ${expectedPath} && ${invoke} --plan ${state.planPath} ${recoveryArgs}`;
    const nextCommand = resolveNextCommand(
      activeTicket.status,
      config,
      state.planPath,
      activeTicket.id,
    );
    const nextCommandHint = nextCommand
      ? `\nNext command from worktree: ${nextCommand}`
      : '';
    throw createWorkflowContractError(
      'workflow.worktree_guard.wrong_worktree',
      `Command '${command}' for ticket ${activeTicket.id} must be run from its worktree.\n` +
        `Current directory: ${resolvedCwd}\n` +
        `Expected worktree: ${expectedPath}\n` +
        `Recovery: ${recovery}` +
        nextCommandHint,
    );
  }
}

export async function runDeliveryOrchestrator(
  argv: string[],
  cwd: string,
): Promise<number> {
  let parsed:
    | {
        command: string;
        positionals: string[];
        flags: Set<string>;
        planPath?: string;
        prNumber?: number;
        boundaryMode?: TicketBoundaryMode;
        subagentReviewPolicy?: ReviewPolicyStageValue;
        prReviewPolicy?: ReviewPolicyStageValue;
        preferredRunner?: 'claude-cli' | 'codex-exec';
        redCommitSha?: string;
        baseline?: 'orchestrator' | 'run-policy';
      }
    | undefined;

  try {
    const rawConfig = await loadOrchestratorConfig(cwd);
    const initialConfig = resolveOrchestratorConfig(rawConfig, cwd);
    await ensureEnvReadyImpl(cwd, (worktreePath) =>
      findPrimaryWorktreePath(worktreePath, initialConfig),
    );
    const usage = getUsage(
      generateRunDeliverInvocation(initialConfig.packageManager),
    );
    parsed = parseCliArgs(argv, usage);
    const resolvedConfig = resolveOrchestratorConfig(
      resolveRuntimePolicyOverrides(parsed, rawConfig),
      cwd,
    );
    let context = createDeliveryOrchestratorContext(resolvedConfig);
    const platform = context.platform;
    const notifier = resolveNotifier();
    if (parsed.command === 'ai-review') {
      const result = await runStandaloneAiReview(
        cwd,
        notifier,
        context,
        parsed.prNumber,
      );
      console.log(formatStandaloneAiReviewResult(result));
      await emitNotificationWarnings(notifier, cwd, [
        buildStandaloneReviewRecordedEvent(result),
      ]);
      return 0;
    }
    const options = await resolveOptionsForCommand({
      command: parsed.command,
      createOptions,
      cwd,
      inferPlanPathFromBranch: (worktreePath, branch) =>
        inferPlanPathFromBranch(worktreePath, branch, context.config),
      planPath: parsed.planPath,
      readCurrentBranch: platform.readCurrentBranch,
    });
    parsed = {
      ...parsed,
      planPath: options.planPath,
    };

    if (parsed.command === 'repair-state') {
      const repaired = await repairState(cwd, options, context.config);
      console.log(
        [
          formatStatus(repaired.state, context.config),
          formatRepairSummary(repaired),
        ]
          .filter(Boolean)
          .join('\n\n'),
      );
      return 0;
    }

    const { state: loadedState, hadPersistedRunPolicy }: LoadStateResult =
      await loadState(cwd, options, context.config);

    // Divergence check: when a run is in-progress (runPolicy was already
    // persisted) and the current config has drifted, refuse to continue
    // silently. Skip diagnostic/idempotent commands that do not consume policy.
    const DIVERGENCE_EXEMPT = new Set([
      // Diagnostic / idempotent commands that do not consume runPolicy.
      'status',
      'sync',
      'repair-state',
      'record-review',
      'reconcile-late-review',
      // start: re-stamps runPolicy from current config when explicit flags are
      // present, so blocking it on divergence is counter-productive — let
      // start-time stamping resolve the conflict.
      'start',
    ]);
    let state = loadedState;
    if (
      hadPersistedRunPolicy &&
      !DIVERGENCE_EXEMPT.has(parsed.command) &&
      loadedState.runPolicy != null
    ) {
      const currentRunPolicy = deriveRunPolicyFromConfig(resolvedConfig);
      const divergedFields = detectRunPolicyDivergence(
        loadedState.runPolicy,
        currentRunPolicy,
      );
      if (divergedFields.length > 0) {
        const runDeliverInvocation = generateRunDeliverInvocation(
          context.config.packageManager,
        );
        const commandArgs = [
          '--plan',
          state.planPath,
          parsed.command,
          ...parsed.positionals,
        ].join(' ');
        const recoveryInvocation = `${runDeliverInvocation} ${commandArgs}`;

        if (parsed.baseline === undefined) {
          throw new Error(
            formatRunPolicyDivergenceError(
              loadedState.runPolicy,
              currentRunPolicy,
              divergedFields,
              recoveryInvocation,
            ),
          );
        }

        // Operator provided --baseline: resolve and persist the new runPolicy.
        const resolvedRunPolicy =
          parsed.baseline === 'orchestrator'
            ? deriveRunPolicyFromConfig(resolvedConfig)
            : patchRunPolicyWithFlags(loadedState.runPolicy, parsed);

        state = { ...loadedState, runPolicy: resolvedRunPolicy };
        await saveState(cwd, state);
      }
    }

    // Apply persisted runPolicy so all downstream call sites use the governing
    // policy values from state, not the current config.
    if (hadPersistedRunPolicy && state.runPolicy != null) {
      context = {
        ...context,
        config: applyRunPolicyToConfig(context.config, state.runPolicy),
      };
    }

    const resolvedCwd = await realpath(cwd).catch(() => cwd);
    assertWorktreeGuard(
      resolvedCwd,
      parsed.command,
      parsed.positionals,
      state,
      context.config,
    );

    switch (parsed.command) {
      case 'sync': {
        await saveState(cwd, state);
        console.log(formatStatus(state, context.config));
        return 0;
      }
      case 'status': {
        console.log(formatStatus(state, context.config));
        return 0;
      }
      case 'start': {
        // When explicit policy flags are provided, re-stamp runPolicy from the
        // current resolved config so the persisted state reflects the operator's
        // explicit overrides. Without explicit flags, the existing runPolicy (or
        // normalizeRunPolicy-derived baseline) is preserved.
        const hasExplicitPolicyFlags =
          parsed.boundaryMode !== undefined ||
          parsed.subagentReviewPolicy !== undefined ||
          parsed.prReviewPolicy !== undefined;
        const stateForStart = hasExplicitPolicyFlags
          ? { ...state, runPolicy: deriveRunPolicyFromConfig(resolvedConfig) }
          : state;
        // When explicit flags are provided, stateForStart.runPolicy reflects the
        // new policy derived from CLI flags. Re-anchor context.config to the
        // flag-resolved config so startTicket and status output use the
        // operator's intended values, not the persisted policy stamped by the
        // merge block above.
        if (hasExplicitPolicyFlags) {
          context = { ...context, config: resolvedConfig };
        }
        const nextState = await startTicket(
          stateForStart,
          cwd,
          context,
          parsed.positionals[0],
        );
        await saveState(cwd, nextState);
        console.log(formatStatus(nextState, context.config));
        await emitNotificationWarnings(
          notifier,
          cwd,
          eventsForStartCommand(nextState, parsed.positionals[0]),
        );
        return 0;
      }
      case 'post-verify': {
        const { auditOutcome, auditTicketId, auditPatchCommitArgs } =
          parsePostVerifyArgs(parsed.positionals);
        if (auditOutcome !== 'patched' && auditPatchCommitArgs.length > 0) {
          throw new Error(
            'Post-verify patch commits are only allowed when outcome is `patched`.',
          );
        }
        const auditPatchCommits =
          auditOutcome === 'patched'
            ? resolveInternalReviewPatchCommits(
                (
                  state.tickets.find((ticket) => ticket.id === auditTicketId) ??
                  state.tickets.find(
                    (ticket) => ticket.status === 'in_progress',
                  ) ??
                  state.tickets[0]
                )?.worktreePath ?? cwd,
                context,
                auditPatchCommitArgs,
                '[post-verify]',
                'Post-verify',
              )
            : undefined;
        const nextState = await recordPostVerify(
          state,
          auditTicketId,
          auditOutcome,
          context.config,
          {
            getWorkingTreeStatus: context.platform.getWorkingTreeStatus,
            hasLocalBranchCommits: context.platform.hasLocalBranchCommits,
            hasUncommittedChanges: context.platform.hasUncommittedChanges,
            warn: (message: string) => console.log(message),
          },
          auditPatchCommits,
        );
        await saveState(cwd, nextState);
        console.log(formatStatus(nextState, context.config));
        return 0;
      }
      case 'post-red': {
        const nextState = await recordPostRed(
          state,
          parsed.positionals[0],
          context,
          {},
          parsed.redCommitSha,
        );
        await saveState(cwd, nextState);
        console.log(formatStatus(nextState, context.config));
        return 0;
      }
      case 'subagent-review': {
        const subagentTicketId = parsed.positionals[0];
        const subagentTarget =
          (subagentTicketId
            ? state.tickets.find((t) => t.id === subagentTicketId)
            : state.tickets.find((t) => t.status === 'verified')) ?? undefined;

        if (!subagentTarget) {
          throw new Error(
            subagentTicketId
              ? `Unknown ticket ${subagentTicketId}.`
              : 'No ticket at verified status found.',
          );
        }

        const isDocOnly = isPlatformLocalBranchDocOnly(
          subagentTarget.worktreePath,
          subagentTarget.baseBranch,
          context.config.runtime,
        );
        const policy = context.config.reviewPolicy.subagentReview;

        // Auto-skip doc-only tickets under skip_doc_only policy.
        if (policy === 'skip_doc_only' && isDocOnly) {
          const nextState = recordSubagentReview(
            state,
            'skipped',
            true,
            policy,
            undefined,
            undefined,
            undefined,
            subagentTarget.id,
          );
          console.log('Doc-only ticket — subagent review auto-skipped.');
          await saveState(cwd, nextState);
          console.log(formatStatus(nextState, context.config));
          return 0;
        }

        // Build runner order: preferred first, other second.
        const preferredRunner = parsed.preferredRunner;
        const runnerOrder: Array<'claude-cli' | 'codex-exec'> =
          preferredRunner === 'codex-exec'
            ? ['codex-exec', 'claude-cli']
            : ['claude-cli', 'codex-exec'];

        const worktreePath = subagentTarget.worktreePath;
        const headSha = context.platform.readCurrentBranch
          ? (() => {
              try {
                return spawnSync('git', ['rev-parse', 'HEAD'], {
                  cwd: worktreePath,
                  encoding: 'utf-8',
                }).stdout.trim();
              } catch {
                return 'unknown';
              }
            })()
          : 'unknown';

        const reviewPrompt =
          `Assume this implementation has holes — find them. ` +
          `Review all code changes introduced in the current branch versus its base branch (${subagentTarget.baseBranch}). ` +
          `Make any fixes you judge necessary. Commit all fixes with messages ending with " [subagent-review]". ` +
          `Skip ticket doc files under docs/product/delivery/. ` +
          `Do not rationalize away anything you notice — flag it and let the human decide.`;

        const RUNNER_TIMEOUT_MS = 10 * 60 * 1000;

        let outcome: 'clean' | 'patched' | 'skipped' = 'skipped';
        let usedRunner: 'claude-cli' | 'codex-exec' | 'skipped' = 'skipped';

        for (const runner of runnerOrder) {
          const result = tryRunner(
            () => {
              const args =
                runner === 'claude-cli'
                  ? ['--print', reviewPrompt, '--output-format', 'text']
                  : [reviewPrompt];
              const bin = runner === 'claude-cli' ? 'claude' : 'codex';
              const spawned = spawnSync(bin, args, {
                cwd: worktreePath,
                timeout: RUNNER_TIMEOUT_MS,
                encoding: 'utf-8',
              });
              return {
                exitCode: spawned.status,
                timedOut:
                  spawned.signal === 'SIGTERM' ||
                  spawned.error?.message?.includes('timed out') ||
                  false,
              };
            },
            () => {
              const status = spawnSync('git', ['status', '--porcelain'], {
                cwd: worktreePath,
                encoding: 'utf-8',
              });
              return (status.stdout ?? '').trim().length > 0;
            },
          );

          if (result.status === 'ran') {
            outcome = result.outcome;
            usedRunner = runner;
            break;
          }

          console.log(
            `Runner ${runner} unavailable${result.status === 'timeout' ? ' (timed out)' : ''}, trying fallback...`,
          );
        }

        // Write runner artifact.
        const artifact = buildRunnerArtifact(usedRunner, headSha, outcome);
        const artifactRelPath = `${state.reviewsDirPath}/${subagentTarget.id}-subagent-runner.json`;
        const artifactAbsPath = resolve(cwd, artifactRelPath);
        mkdirSync(dirname(artifactAbsPath), { recursive: true });
        writeFileSync(
          artifactAbsPath,
          JSON.stringify(artifact, null, 2) + '\n',
          'utf-8',
        );

        const nextState = recordSubagentReview(
          state,
          outcome,
          isDocOnly,
          policy,
          undefined,
          undefined,
          undefined,
          subagentTarget.id,
          artifactRelPath,
        );

        if (outcome === 'skipped') {
          console.log(
            'All runners unavailable — subagent review honestly skipped.',
          );
        }
        await saveState(cwd, nextState);
        console.log(formatStatus(nextState, context.config));
        return 0;
      }
      case 'open-pr': {
        const nextState = await openPullRequest(
          state,
          cwd,
          context,
          parsed.positionals[0],
        );
        await saveState(cwd, nextState);
        console.log(
          [
            formatStatus(nextState, context.config),
            formatReviewWindowMessage(nextState, parsed.positionals[0]),
          ]
            .filter(Boolean)
            .join('\n\n'),
        );
        await emitNotificationWarnings(
          notifier,
          cwd,
          eventsForOpenPrCommand(nextState, parsed.positionals[0]),
        );
        return 0;
      }
      case 'poll-review': {
        const pollTicketId = parsed.positionals[0];
        const pollTarget = pollTicketId
          ? state.tickets.find((t) => t.id === pollTicketId)
          : state.tickets.find((t) => t.status === 'in_review');

        if (
          pollTarget &&
          shouldAutoRecordReviewSkippedForPollReview(
            context.config.reviewPolicy.prReview,
            pollTarget,
          )
        ) {
          const skipNote =
            context.config.reviewPolicy.prReview === 'disabled'
              ? 'PR review disabled by policy'
              : 'doc-only PR; PR review skipped by policy';
          console.log(
            context.config.reviewPolicy.prReview === 'disabled'
              ? `prReview=disabled for ${pollTarget.id}: skipping AI review window, recording skipped`
              : `doc_only=true for ${pollTarget.id} under prReview=skip_doc_only: skipping AI review window, recording skipped`,
          );
          const docOnlyState = await recordReview(
            state,
            cwd,
            context,
            pollTarget.id,
            'skipped',
            skipNote,
          );
          await saveState(cwd, docOnlyState);
          console.log(
            formatCurrentTicketStatus(
              docOnlyState,
              context.config,
              pollTicketId,
            ),
          );
          await emitNotificationWarnings(
            notifier,
            cwd,
            eventsForPollReviewCommand(docOnlyState, pollTicketId),
          );
          return 0;
        }

        const nextState = await pollReview(state, cwd, context, pollTicketId);
        await saveState(cwd, nextState);
        console.log(
          formatCurrentTicketStatus(nextState, context.config, pollTicketId),
        );
        await emitNotificationWarnings(
          notifier,
          cwd,
          eventsForPollReviewCommand(nextState, pollTicketId),
        );
        return 0;
      }
      case 'reconcile-late-review': {
        const ticketId = parsed.positionals[0];

        if (!ticketId) {
          throw new Error(
            `Usage: ${context.invocation} --plan <plan-path> reconcile-late-review <ticket-id>`,
          );
        }

        const nextState = await reconcileLateReview(
          state,
          cwd,
          context,
          ticketId,
        );
        await saveState(cwd, nextState);
        console.log(formatStatus(nextState, context.config));
        await emitNotificationWarnings(
          notifier,
          cwd,
          eventsForReconcileLateReviewCommand(nextState, ticketId),
        );
        return 0;
      }
      case 'record-review': {
        const [ticketId, outcome, ...noteParts] = parsed.positionals;

        if (
          !ticketId ||
          (outcome !== 'clean' &&
            outcome !== 'patched' &&
            outcome !== 'operator_input_needed')
        ) {
          throw new Error(
            `Usage: ${context.invocation} --plan <plan-path> record-review <ticket-id> <clean|patched|operator_input_needed> [note]`,
          );
        }

        const nextState = await recordReview(
          state,
          cwd,
          context,
          ticketId,
          outcome,
          noteParts.join(' ').trim() || undefined,
        );
        await saveState(cwd, nextState);
        console.log(formatStatus(nextState, context.config));
        await emitNotificationWarnings(
          notifier,
          cwd,
          eventsForRecordReviewCommand(nextState, ticketId),
        );
        return 0;
      }
      case 'advance': {
        const advancedState = await advanceToNextTicketImpl(
          state,
          cwd,
          context,
        );
        const nextState = await applyAdvanceBoundaryMode(
          state,
          advancedState,
          cwd,
          context,
        );
        await saveState(cwd, nextState);
        await syncStateToPrimaryIfNeeded(cwd, nextState, (wt) =>
          findPrimaryWorktreePath(wt, context.config),
        );
        console.log(formatStatus(nextState, context.config));
        const boundaryGuidance = formatAdvanceBoundaryGuidance(
          state,
          advancedState,
          nextState,
          context.config,
        );

        if (boundaryGuidance) {
          console.log('');
          console.log(boundaryGuidance);
        }

        await emitNotificationWarnings(
          notifier,
          cwd,
          eventsForAdvanceCommand(state, nextState),
        );
        return 0;
      }
      case 'restack': {
        const nextState = await restackTicket(
          state,
          cwd,
          context,
          parsed.positionals[0],
        );
        await saveState(cwd, nextState);
        console.log(formatStatus(nextState, context.config));
        return 0;
      }
      default: {
        console.error(usage);
        return 1;
      }
    }
  } catch (error) {
    const notifier = resolveNotifier();
    await emitNotificationWarnings(notifier, cwd, [
      buildRunBlockedEvent(
        parsed?.planPath ? derivePlanKey(parsed.planPath) : undefined,
        parsed?.command,
        formatError(error),
      ),
    ]);
    console.error(formatError(error));
    return 1;
  }
}

export function findPrimaryWorktreePath(
  cwd: string,
  config: ResolvedOrchestratorConfig,
): string | undefined {
  return findPlatformPrimaryWorktreePath(
    cwd,
    config.defaultBranch,
    config.runtime,
  );
}

export function parsePlan(
  markdown: string,
  planPath: string,
  cwd?: string,
): TicketDefinition[] {
  return parsePlanImpl(markdown, planPath, cwd);
}

export function syncStateFromScratch(
  ticketDefinitions: TicketDefinition[],
  cwd: string,
  options: OrchestratorOptions,
  config: ResolvedOrchestratorConfig,
  inferred?: DeliveryState,
): DeliveryState {
  return syncStateFromScratchImpl(ticketDefinitions, options, inferred, {
    cwd,
    defaultBranch: config.defaultBranch,
    deriveBranchName,
    deriveWorktreePath,
  });
}

export function syncStateFromExisting(
  existing: DeliveryState,
  ticketDefinitions: TicketDefinition[],
  cwd: string,
  options: OrchestratorOptions,
  config: ResolvedOrchestratorConfig,
  inferred?: DeliveryState,
): DeliveryState {
  return syncStateFromExistingImpl(
    existing,
    ticketDefinitions,
    options,
    inferred,
    {
      cwd,
      defaultBranch: config.defaultBranch,
      deriveBranchName,
      deriveWorktreePath,
    },
  );
}

export function resolveReviewFetcher(): string {
  if (process.env.AI_CODE_REVIEW_FETCHER) {
    return process.env.AI_CODE_REVIEW_FETCHER;
  }

  return resolveSonOfAntonSkillScript(
    'pr-review/scripts/fetch_pr_review_comments.sh',
  );
}

export function resolveReviewTriager(): string {
  if (process.env.AI_CODE_REVIEW_TRIAGER) {
    return process.env.AI_CODE_REVIEW_TRIAGER;
  }

  return resolveSonOfAntonSkillScript('pr-review/scripts/triage_pr_review.sh');
}

function resolveSonOfAntonSkillScript(scriptPath: string): string {
  const subtreePath = `.son-of-anton/.agents/skills/${scriptPath}`;
  if (existsSync(resolve(process.cwd(), subtreePath))) {
    return subtreePath;
  }

  return `.agents/skills/${scriptPath}`;
}

export function createOptions(input: {
  planPath?: string;
}): OrchestratorOptions {
  return createOptionsImpl(input);
}

export type LoadStateResult = {
  state: DeliveryState;
  hadPersistedRunPolicy: boolean;
};

export async function loadState(
  cwd: string,
  options: OrchestratorOptions,
  config: ResolvedOrchestratorConfig,
): Promise<LoadStateResult> {
  const raw = await loadStateImpl(cwd, options, {
    cwd,
    defaultBranch: config.defaultBranch,
    runtime: config.runtime,
    deriveBranchName,
    deriveWorktreePath,
    findExistingBranch,
  });
  const hadPersistedRunPolicy = raw.runPolicy != null;
  return { state: normalizeRunPolicy(raw, config), hadPersistedRunPolicy };
}

async function repairState(
  cwd: string,
  options: OrchestratorOptions,
  config: ResolvedOrchestratorConfig,
): Promise<RepairStateResult> {
  const result = await repairStateImpl(cwd, options, {
    cwd,
    defaultBranch: config.defaultBranch,
    runtime: config.runtime,
    deriveBranchName,
    deriveWorktreePath,
    findExistingBranch,
  });
  const normalized = normalizeRunPolicy(result.state, config);

  if (normalized !== result.state) {
    await saveState(cwd, normalized);
  }

  return { ...result, state: normalized };
}

export async function inferPlanPathFromBranch(
  cwd: string,
  branch: string,
  config: ResolvedOrchestratorConfig,
): Promise<string> {
  return inferPlanPathFromBranchImpl(
    cwd,
    branch,
    config.planRoot,
    findExistingBranch,
  );
}

export function resolvePlanPathForBranch(
  planIndex: Array<{ planPath: string; tickets: TicketDefinition[] }>,
  branch: string,
): string {
  return resolvePlanPathForBranchImpl(planIndex, branch, findExistingBranch);
}

export async function saveState(
  cwd: string,
  state: DeliveryState,
): Promise<void> {
  await saveStateImpl(cwd, state);
}

export async function syncStateToPrimaryIfNeeded(
  cwd: string,
  state: DeliveryState,
  findPrimaryPath: (cwd: string) => string | undefined,
): Promise<void> {
  const primaryPath = findPrimaryPath(cwd);
  if (!primaryPath) {
    return;
  }

  const canonicalizePath = async (path: string): Promise<string> => {
    try {
      return await realpath(path);
    } catch {
      return resolve(path);
    }
  };

  const [primaryCanonicalPath, cwdCanonicalPath] = await Promise.all([
    canonicalizePath(primaryPath),
    canonicalizePath(cwd),
  ]);

  if (primaryCanonicalPath !== cwdCanonicalPath) {
    await saveState(primaryPath, state);
  }
}

export function summarizeStateDifferences(
  existing: DeliveryState,
  repaired: DeliveryState,
): string[] {
  return summarizeStateDifferencesImpl(existing, repaired);
}

async function startTicket(
  state: DeliveryState,
  cwd: string,
  context: DeliveryOrchestratorContext,
  ticketId?: string,
): Promise<DeliveryState> {
  const platform = context.platform;
  return startTicketImpl(state, cwd, ticketId, {
    addWorktree: platform.addWorktree,
    bootstrapWorktreeIfNeeded: platform.bootstrapWorktreeIfNeeded,
    copyLocalBootstrapFilesIfPresent,
    materializeTicketContext,
    relativeToRepo,
    subagentReviewPolicy: context.config.reviewPolicy.subagentReview,
    ticketBoundaryMode: context.config.ticketBoundaryMode,
  });
}

export async function copyLocalBootstrapFilesIfPresent(
  sourceWorktreePath: string,
  targetWorktreePath: string,
): Promise<void> {
  await copyPlatformBootstrapFilesIfPresent(
    sourceWorktreePath,
    targetWorktreePath,
  );
}

export async function copyLocalEnvIfPresent(
  sourceWorktreePath: string,
  targetWorktreePath: string,
): Promise<void> {
  await copyPlatformEnvIfPresent(sourceWorktreePath, targetWorktreePath);
}

export async function recordPostVerify(
  state: DeliveryState,
  ticketId?: string,
  outcome?: ReviewOutcome,
  config?: ResolvedOrchestratorConfig,
  dependencies: {
    isLocalBranchDocOnly?: (
      cwd: string,
      baseBranch: string,
      runtime: Runtime,
    ) => boolean;
    hasLocalBranchCommits?: (cwd: string, baseBranch: string) => boolean;
    hasUncommittedChanges?: (cwd: string) => boolean;
    getWorkingTreeStatus?: (cwd: string) => string;
    postVerifyPolicy?: ReviewPolicyStageValue;
    warn?: (message: string) => void;
  } = {},
  patchCommits?: InternalReviewPatchCommit[],
): Promise<DeliveryState> {
  if (!config) {
    throw new Error('recordPostVerify requires explicit config.');
  }

  const target =
    (ticketId
      ? state.tickets.find((ticket) => ticket.id === ticketId)
      : (state.tickets.find((ticket) => ticket.status === 'red_complete') ??
        state.tickets.find((ticket) => ticket.status === 'in_progress'))) ??
    undefined;
  const subagentReviewPolicy =
    dependencies.postVerifyPolicy ?? config.reviewPolicy.subagentReview;
  const isDocOnly =
    target &&
    subagentReviewPolicy !== 'disabled' &&
    (dependencies.isLocalBranchDocOnly ?? isPlatformLocalBranchDocOnly)(
      target.worktreePath,
      target.baseBranch,
      config.runtime,
    );

  if (target) {
    try {
      if (dependencies.hasUncommittedChanges?.(target.worktreePath) === true) {
        let statusOutput = '';

        try {
          statusOutput =
            dependencies.getWorkingTreeStatus?.(target.worktreePath) ?? '';
        } catch {
          // Keep post-verify non-blocking if status lookup fails.
        }

        const warningLines = [
          'Warning: working tree has uncommitted changes.',
          'Confirm these are intentional before recording post-verify clean.',
        ];

        if (statusOutput.trim().length > 0) {
          warningLines.push(
            'Uncommitted files:',
            ...statusOutput.split('\n').map((line) => `  ${line}`),
          );
        }

        dependencies.warn?.(warningLines.join('\n'));
      }
    } catch {
      // Keep post-verify non-blocking if dirty-worktree inspection fails.
    }
  }

  if (isDocOnly && target && dependencies.hasLocalBranchCommits !== undefined) {
    const hasCommits = dependencies.hasLocalBranchCommits(
      target.worktreePath,
      target.baseBranch,
    );
    if (!hasCommits) {
      throw new Error(
        `No commits on branch for doc-only ticket ${target.id}. Add or update documentation files before continuing.`,
      );
    }
  }

  if (subagentReviewPolicy === 'skip_doc_only' && isDocOnly) {
    return recordPostVerifyImpl(state, ticketId, 'skipped', undefined);
  }

  if (
    subagentReviewPolicy === 'required' &&
    isDocOnly &&
    outcome === undefined
  ) {
    throw new Error(
      `Ticket ${target.id} requires an explicit post-verify outcome. Pass \`clean\` or \`patched\`.`,
    );
  }

  if (
    outcome === 'skipped' &&
    (!isDocOnly || subagentReviewPolicy === 'required')
  ) {
    throw new Error(
      isDocOnly
        ? `Ticket ${target.id} requires an explicit post-verify outcome. Pass \`clean\` or \`patched\`.`
        : `Ticket ${target.id} cannot record \`skipped\` for post-verify on a code ticket. Pass \`clean\` or \`patched\`.`,
    );
  }

  if (target?.status === 'in_progress' && !isDocOnly) {
    throw createWorkflowContractError(
      'workflow.post_verify.requires_post_red',
      `Ticket ${target.id} is at status in_progress. Run \`bun run deliver --plan ${state.planPath} post-red ${target.id}\` before post-verify on a code ticket.`,
    );
  }

  return recordPostVerifyImpl(state, ticketId, outcome, patchCommits);
}

export async function recordPostRed(
  state: DeliveryState,
  ticketId: string | undefined,
  context: DeliveryOrchestratorContext,
  dependencies: {
    isLocalBranchDocOnly?: (
      cwd: string,
      baseBranch: string,
      runtime: Runtime,
    ) => boolean;
    readHeadSha?: (cwd: string) => string;
    readLatestCommitSubject?: (cwd: string) => string;
    runVerify?: (cwd: string) => {
      exitCode: number;
      stderr: string;
      stdout: string;
    };
  } = {},
  redCommitSha?: string,
): Promise<DeliveryState> {
  const target =
    (ticketId
      ? state.tickets.find((ticket) => ticket.id === ticketId)
      : state.tickets.find((ticket) => ticket.status === 'in_progress')) ??
    undefined;

  if (!target) {
    throw new Error('No in-progress ticket found to mark red_complete.');
  }

  if (target.status === 'red_complete') {
    console.log(`Ticket ${target.id} is already red_complete.`);
    return state;
  }

  const isDocOnly = (
    dependencies.isLocalBranchDocOnly ?? isPlatformLocalBranchDocOnly
  )(target.worktreePath, target.baseBranch, context.config.runtime);

  if (isDocOnly) {
    console.log('Doc-only branch — post-red skipped.');
    return state;
  }

  // When --red-commit-sha is provided the operator is asserting that the named
  // commit was the red commit. Skip the HEAD subject check and CI check — both
  // are designed for the sequential red-then-green workflow where HEAD is still
  // the red commit. With a named SHA the red evidence is already in history.
  if (redCommitSha !== undefined) {
    console.log(
      `post-red: recording against named red commit ${redCommitSha} (skipping HEAD and CI checks).`,
    );
    return recordPostRedImpl(state, {
      headSha: redCommitSha,
      latestCommitSubject: '[red]',
      ticketId,
      verifyExitCode: 1,
    });
  }

  const latestCommitSubject =
    dependencies.readLatestCommitSubject ??
    context.platform.readLatestCommitSubject;
  const readHeadSha = dependencies.readHeadSha ?? context.platform.readHeadSha;
  const runVerify =
    dependencies.runVerify ??
    ((cwd: string) =>
      context.platform.runProcessResult(cwd, [
        context.config.packageManager,
        'run',
        'ci',
      ]));

  const verifyResult = runVerify(target.worktreePath);

  if (verifyResult.exitCode === 0) {
    throw new Error(
      `Ticket ${target.id} post-red requires a failing verification run before delivery can advance.`,
    );
  }

  return recordPostRedImpl(state, {
    headSha: readHeadSha(target.worktreePath),
    latestCommitSubject: latestCommitSubject(target.worktreePath),
    ticketId,
    verifyExitCode: verifyResult.exitCode,
  });
}

export function recordSubagentReview(
  state: DeliveryState,
  outcome?: 'clean' | 'patched',
  isDocOnly?: boolean,
  policy?: ReviewPolicyStageValue,
  patchCommits?: InternalReviewPatchCommit[],
  agentName?: string,
  ticketId?: string,
): DeliveryState {
  if (!policy) {
    throw new Error('recordSubagentReview requires an explicit policy.');
  }

  return recordSubagentReviewImpl(
    state,
    outcome,
    isDocOnly,
    policy,
    patchCommits,
    agentName,
    undefined,
    ticketId,
  );
}

export function shouldAutoRecordReviewSkippedForPollReview(
  policy: ReviewPolicyStageValue,
  ticket?: Pick<TicketState, 'docOnly'>,
): boolean {
  return (
    policy === 'disabled' ||
    (policy === 'skip_doc_only' && ticket?.docOnly === true)
  );
}

function normalizeUniquePatchCommitShas(rawShas: string[]): string[] {
  return [...new Set(rawShas.map((sha) => sha.trim()).filter(Boolean))];
}

function parsePostVerifyArgs(positionals: string[]): {
  auditOutcome?: ReviewOutcome;
  auditPatchCommitArgs: string[];
  auditTicketId?: string;
} {
  const positional0 = positionals[0];
  const positional1 = positionals[1];
  const isOutcome = (s: string | undefined): s is ReviewOutcome =>
    s === 'clean' || s === 'patched' || s === 'skipped';
  const auditOutcome: ReviewOutcome | undefined = isOutcome(positional0)
    ? positional0
    : isOutcome(positional1)
      ? positional1
      : undefined;
  const auditTicketId = !isOutcome(positional0) ? positional0 : undefined;
  const auditPatchCommitArgs = auditTicketId
    ? positionals.slice(2)
    : positionals.slice(1);
  return { auditOutcome, auditTicketId, auditPatchCommitArgs };
}

function resolveInternalReviewPatchCommits(
  cwd: string,
  context: DeliveryOrchestratorContext,
  rawShas: string[],
  suffix: '[post-verify]' | '[subagent-review]',
  stageLabel: string,
): InternalReviewPatchCommit[] {
  const platform = context.platform;
  return normalizeUniquePatchCommitShas(rawShas).map((sha) => {
    const subject = platform.readCommitSubject(cwd, sha);
    if (!subject.endsWith(` ${suffix}`)) {
      throw new Error(
        `${stageLabel} patch commit ${sha.slice(0, 12)} must end with " ${suffix}" (note the space).`,
      );
    }
    return { sha, subject };
  });
}

export async function openPullRequest(
  state: DeliveryState,
  cwd: string,
  context: DeliveryOrchestratorContext,
  ticketId?: string,
): Promise<DeliveryState> {
  const resolvedTicketId = ticketId;

  if (context.config.reviewPolicy.subagentReview !== 'disabled') {
    const targetTicket = resolvedTicketId
      ? state.tickets.find((t) => t.id === resolvedTicketId)
      : (state.tickets.find((t) => t.status === 'subagent_review_complete') ??
        state.tickets.find((t) => t.status === 'verified') ??
        state.tickets.find((t) => t.status === 'in_review'));

    if (
      targetTicket !== undefined &&
      targetTicket.subagentReviewOutcome != null &&
      targetTicket.subagentReviewOutcome !== 'skipped'
    ) {
      const rawArtifactPath = targetTicket.subagentRunnerArtifactPath;
      const artifactPath = rawArtifactPath
        ? resolve(cwd, rawArtifactPath)
        : undefined;
      const artifactExists =
        artifactPath !== undefined && existsSync(artifactPath);
      const artifact = artifactExists
        ? (() => {
            try {
              return validateRunnerArtifact(
                JSON.parse(readFileSync(artifactPath, 'utf-8')),
              );
            } catch {
              return null;
            }
          })()
        : null;
      if (!artifact) {
        throw createWorkflowContractError(
          'workflow.open_pr.requires_runner_review',
          `Ticket ${targetTicket.id} requires a valid runner review artifact before opening a PR. subagentReviewOutcome="${targetTicket.subagentReviewOutcome}" but no artifact found at ${rawArtifactPath ?? '(path not set)'}. Re-run subagent-review to regenerate the artifact.`,
        );
      }
    }
  }

  const platform = context.platform;
  const nextState = openPullRequestImpl(state, cwd, resolvedTicketId, {
    assertReviewerFacingMarkdown,
    buildPullRequestBody,
    buildPullRequestTitle,
    subagentReviewPolicy: context.config.reviewPolicy.subagentReview,
    createPullRequest: platform.createPullRequest,
    editPullRequest: platform.editPullRequest,
    ensureBranchPushed: platform.ensureBranchPushed,
    findOpenPullRequest: platform.findOpenPullRequest,
    reportProgress: (message: string) => console.log(message),
    resolveGitHubRepo: platform.resolveGitHubRepoForOrchestrator,
  });

  // Detect doc-only PRs to skip the external AI review window.
  // Recompute on every open-pr call so that a PR that gains code changes
  // after an initial docs-only push has its docOnly flag cleared.
  const reviewTicket =
    (resolvedTicketId
      ? nextState.tickets.find((t) => t.id === resolvedTicketId)
      : nextState.tickets.find((t) => t.status === 'in_review')) ?? undefined;

  if (reviewTicket) {
    const docOnly = isPlatformLocalBranchDocOnly(
      reviewTicket.worktreePath,
      reviewTicket.baseBranch,
      context.config.runtime,
    );

    return {
      ...nextState,
      tickets: nextState.tickets.map((t) =>
        t.id === reviewTicket.id ? { ...t, docOnly: docOnly || undefined } : t,
      ),
    };
  }

  return nextState;
}

export async function pollReview(
  state: DeliveryState,
  cwd: string,
  context: DeliveryOrchestratorContext,
  ticketId?: string,
  maybeDependencies?: Partial<TicketReviewDependencies>,
  dependencies: Partial<TicketReviewDependencies> = {},
): Promise<DeliveryState> {
  const resolvedDependencies =
    typeof maybeDependencies === 'object' ? maybeDependencies : dependencies;
  const platform = context.platform;
  return runTicketReviewLifecycle(state, cwd, ticketId, {
    ...resolvedDependencies,
    relativeToRepo,
    replyToReviewThread:
      resolvedDependencies.replyToReviewThread ??
      platform.replyToReviewThreadForOrchestrator,
    resolveReviewFetcher,
    resolveReviewThread: platform.resolveReviewThread,
    resolveReviewTriager,
    runProcess: platform.runProcess,
    updatePullRequestBody:
      resolvedDependencies.updatePullRequestBody ??
      platform.updatePullRequestBody,
  });
}

export async function reconcileLateReview(
  state: DeliveryState,
  cwd: string,
  context: DeliveryOrchestratorContext,
  ticketId: string,
  maybeDependencies?: Partial<TicketReviewDependencies>,
  dependencies: Partial<TicketReviewDependencies> = {},
): Promise<DeliveryState> {
  const resolvedDependencies =
    typeof maybeDependencies === 'object' ? maybeDependencies : dependencies;
  if (!ticketId) {
    throw new Error('Missing ticket id for reconcile-late-review.');
  }
  const platform = context.platform;
  return runReconcileLateTicketReview(state, cwd, ticketId, {
    ...resolvedDependencies,
    relativeToRepo,
    replyToReviewThread:
      resolvedDependencies.replyToReviewThread ??
      platform.replyToReviewThreadForOrchestrator,
    resolveReviewFetcher,
    resolveReviewThread: platform.resolveReviewThread,
    resolveReviewTriager,
    runProcess: platform.runProcess,
    updatePullRequestBody:
      resolvedDependencies.updatePullRequestBody ??
      platform.updatePullRequestBody,
  });
}

export async function runStandaloneAiReview(
  cwd: string,
  notifier: DeliveryNotifier,
  context: DeliveryOrchestratorContext,
  prNumber?: number,
  maybeDependencies?: Partial<StandaloneAiReviewDependencies>,
  dependencies: Partial<StandaloneAiReviewDependencies> = {},
): Promise<StandaloneAiReviewResult> {
  const resolvedDependencies =
    typeof maybeDependencies === 'object' ? maybeDependencies : dependencies;
  const platform = context.platform;
  const pullRequest =
    resolvedDependencies.pullRequest ??
    platform.resolveStandalonePullRequest(cwd, prNumber);

  await emitNotificationWarnings(notifier, cwd, [
    buildStandaloneReviewStartedEvent(pullRequest.number, pullRequest.url),
  ]);

  return runStandaloneAiReviewLifecycle(cwd, prNumber, {
    ...resolvedDependencies,
    pullRequest,
    relativeToRepo,
    replyToReviewThread:
      resolvedDependencies.replyToReviewThread ??
      platform.replyToReviewThreadForOrchestrator,
    resolveReviewFetcher,
    resolveReviewThread: platform.resolveReviewThread,
    resolveReviewTriager,
    resolveStandalonePullRequest: platform.resolveStandalonePullRequest,
    runProcess: platform.runProcess,
    updatePullRequestBody:
      resolvedDependencies.updatePullRequestBody ??
      platform.updateStandalonePullRequestBody,
  });
}

export async function recordReview(
  state: DeliveryState,
  cwd: string,
  context: DeliveryOrchestratorContext,
  ticketId: string,
  outcome: ReviewResult,
  note?: string,
  maybeDependencies?: Partial<TicketReviewDependencies>,
  dependencies: Partial<TicketReviewDependencies> = {},
): Promise<DeliveryState> {
  const resolvedDependencies =
    typeof maybeDependencies === 'object' ? maybeDependencies : dependencies;
  const platform = context.platform;
  return recordTicketReview(state, cwd, ticketId, outcome, note, {
    ...(resolvedDependencies as Partial<TicketReviewDependencies>),
    relativeToRepo,
    replyToReviewThread:
      resolvedDependencies.replyToReviewThread ??
      platform.replyToReviewThreadForOrchestrator,
    resolveReviewFetcher,
    resolveReviewThread: platform.resolveReviewThread,
    resolveReviewTriager,
    runProcess: platform.runProcess,
    updatePullRequestBody:
      resolvedDependencies.updatePullRequestBody ??
      platform.updatePullRequestBody,
  });
}

async function advanceToNextTicketImpl(
  state: DeliveryState,
  cwd: string,
  context: DeliveryOrchestratorContext,
): Promise<DeliveryState> {
  const platform = context.platform;
  return advanceToNextTicket(state, cwd, {
    updatePullRequestBody: platform.updatePullRequestBody,
  });
}

export async function applyAdvanceBoundaryMode(
  state: DeliveryState,
  advancedState: DeliveryState,
  cwd: string,
  context: DeliveryOrchestratorContext,
  dependencies: {
    startTicket: (
      state: DeliveryState,
      cwd: string,
      ticketId?: string,
    ) => Promise<DeliveryState>;
  } = {
    startTicket: (state, cwd, ticketId) =>
      startTicket(state, cwd, context, ticketId),
  },
): Promise<DeliveryState> {
  const nextPending = advancedState.tickets.find(
    (ticket) =>
      ticket.status === 'pending' &&
      state.tickets.find((previous) => previous.id === ticket.id)?.status ===
        'pending',
  );

  if (!nextPending) {
    return advancedState;
  }

  if (context.config.ticketBoundaryMode !== 'cook') {
    return advancedState;
  }

  return dependencies.startTicket(advancedState, cwd, nextPending.id);
}

async function restackTicket(
  state: DeliveryState,
  cwd: string,
  context: DeliveryOrchestratorContext,
  ticketId?: string,
): Promise<DeliveryState> {
  const platform = context.platform;
  return restackTicketImpl(state, cwd, ticketId, {
    buildPullRequestBody,
    defaultBranch: context.config.defaultBranch,
    editPullRequest: platform.editPullRequest,
    ensureCleanWorktree: platform.ensureCleanWorktree,
    fetchOrigin: platform.fetchOrigin,
    findOpenPullRequest: platform.findOpenPullRequest,
    hasMergedPullRequestForBranch: platform.hasMergedPullRequestForBranch,
    readCurrentBranch: platform.readCurrentBranch,
    readMergeBase: platform.readMergeBase,
    rebaseOnto: platform.rebaseOnto,
    rebaseOntoDefaultBranch: platform.rebaseOntoDefaultBranch,
    resolveGitHubRepo: platform.resolveGitHubRepoForOrchestrator,
  });
}

export function derivePlanKey(planPath: string): string {
  return derivePlanKeyImpl(planPath);
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
