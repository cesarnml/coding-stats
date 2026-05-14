import { describe, expect, it } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { parseCliArgs } from '../cli';
import {
  loadOrchestratorConfig,
  resolveOrchestratorConfig,
} from '../runtime-config';
import { formatRunPolicy } from '../format';
import { deriveRunPolicyFromConfig } from '../state';
import {
  buildRunnerArtifact,
  tryRunner,
  validateRunnerArtifact,
} from '../subagent-runner';
import type { ResolvedOrchestratorConfig } from '../runtime-config';
import type { RunPolicy } from '../types';

const baseResolvedConfig: ResolvedOrchestratorConfig = {
  defaultBranch: 'main',
  planRoot: 'docs',
  runtime: 'bun',
  packageManager: 'bun',
  ticketBoundaryMode: 'cook',
  reviewPolicy: {
    subagentReview: 'skip_doc_only',
    prReview: 'skip_doc_only',
  },
};

// ─── Clean-break: retired config keys throw ─────────────────────────────────

describe('P10.01 — retired config keys throw on load', () => {
  it('throws when subagentReviewRunner is present in config', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'p10-01-retired-'));
    try {
      await writeFile(
        join(tempDir, 'orchestrator.config.json'),
        JSON.stringify({ subagentReviewRunner: { kind: 'claude-cli' } }),
      );
      await expect(loadOrchestratorConfig(tempDir)).rejects.toThrow(
        /subagentReviewRunner.*has been removed/,
      );
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });

  it('throws when reviewSubagentOverride is present in config', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'p10-01-retired2-'));
    try {
      await writeFile(
        join(tempDir, 'orchestrator.config.json'),
        JSON.stringify({ reviewSubagentOverride: 'codex:codex-rescue' }),
      );
      await expect(loadOrchestratorConfig(tempDir)).rejects.toThrow(
        /reviewSubagentOverride.*has been removed/,
      );
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });

  it('loads cleanly when neither retired key is present', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'p10-01-clean-'));
    try {
      await writeFile(
        join(tempDir, 'orchestrator.config.json'),
        JSON.stringify({ ticketBoundaryMode: 'cook' }),
      );
      const config = await loadOrchestratorConfig(tempDir);
      expect(config.ticketBoundaryMode).toBe('cook');
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });
});

// ─── resolveOrchestratorConfig ───────────────────────────────────────────────

describe('P10.01 — resolveOrchestratorConfig', () => {
  it('resolves with no subagentReviewRunner field', () => {
    const resolved = resolveOrchestratorConfig({}, '/tmp/test');
    expect(
      (resolved as Record<string, unknown>)['subagentReviewRunner'],
    ).toBeUndefined();
    expect(
      (resolved as Record<string, unknown>)['reviewSubagentOverride'],
    ).toBeUndefined();
  });
});

// ─── deriveRunPolicyFromConfig ───────────────────────────────────────────────

describe('P10.01 — deriveRunPolicyFromConfig', () => {
  it('produces a RunPolicy with three fields (no reviewSubagent)', () => {
    const policy = deriveRunPolicyFromConfig(baseResolvedConfig);
    expect(policy).toEqual({
      ticketBoundaryMode: 'cook',
      subagentReview: 'skip_doc_only',
      prReview: 'skip_doc_only',
    });
    expect(
      (policy as Record<string, unknown>)['reviewSubagent'],
    ).toBeUndefined();
  });
});

// ─── CLI --preferred-runner flag ─────────────────────────────────────────────

describe('P10.01 — CLI --preferred-runner flag', () => {
  const usage = 'Usage: bun run deliver --plan <plan> <cmd>';

  it('parses --preferred-runner claude-cli', () => {
    const parsed = parseCliArgs(
      [
        '--plan',
        'docs/product/delivery/p/impl.md',
        '--preferred-runner',
        'claude-cli',
        'subagent-review',
      ],
      usage,
    );
    expect(parsed.preferredRunner).toBe('claude-cli');
  });

  it('parses --preferred-runner codex-exec', () => {
    const parsed = parseCliArgs(
      [
        '--plan',
        'docs/product/delivery/p/impl.md',
        '--preferred-runner',
        'codex-exec',
        'subagent-review',
      ],
      usage,
    );
    expect(parsed.preferredRunner).toBe('codex-exec');
  });

  it('throws on invalid --preferred-runner value', () => {
    expect(() =>
      parseCliArgs(
        [
          '--plan',
          'docs/product/delivery/p/impl.md',
          '--preferred-runner',
          'gemini-cli',
          'subagent-review',
        ],
        usage,
      ),
    ).toThrow(/preferred-runner/);
  });

  it('throws when --preferred-runner value is missing', () => {
    expect(() =>
      parseCliArgs(
        [
          '--plan',
          'docs/product/delivery/p/impl.md',
          '--preferred-runner',
          'subagent-review',
        ],
        usage,
      ),
    ).toThrow(/preferred-runner/);
  });

  it('leaves preferredRunner undefined when flag is absent', () => {
    const parsed = parseCliArgs(
      ['--plan', 'docs/product/delivery/p/impl.md', 'subagent-review'],
      usage,
    );
    expect(parsed.preferredRunner).toBeUndefined();
  });
});

// ─── tryRunner unit tests ─────────────────────────────────────────────────────

describe('P10.01 — tryRunner', () => {
  it('returns ran+clean when spawn succeeds and no changes', () => {
    const result = tryRunner(
      () => ({ exitCode: 0, timedOut: false }),
      () => false,
    );
    expect(result).toEqual({ status: 'ran', outcome: 'clean' });
  });

  it('returns ran+patched when spawn succeeds and changes detected', () => {
    const result = tryRunner(
      () => ({ exitCode: 0, timedOut: false }),
      () => true,
    );
    expect(result).toEqual({ status: 'ran', outcome: 'patched' });
  });

  it('returns unavailable when spawn throws', () => {
    const result = tryRunner(
      () => {
        throw new Error('not found');
      },
      () => false,
    );
    expect(result).toEqual({ status: 'unavailable' });
  });

  it('returns timeout when spawn times out', () => {
    const result = tryRunner(
      () => ({ exitCode: null, timedOut: true }),
      () => false,
    );
    expect(result).toEqual({ status: 'timeout' });
  });

  it('does not call checkHasChanges when spawned process timed out', () => {
    let checked = false;
    tryRunner(
      () => ({ exitCode: null, timedOut: true }),
      () => {
        checked = true;
        return false;
      },
    );
    expect(checked).toBe(false);
  });
});

// ─── validateRunnerArtifact ───────────────────────────────────────────────────

describe('P10.01 — validateRunnerArtifact', () => {
  it('validates a valid claude-cli artifact', () => {
    const artifact = buildRunnerArtifact('claude-cli', 'abc123', 'clean');
    expect(validateRunnerArtifact(artifact)).toEqual(artifact);
  });

  it('validates a valid codex-exec artifact', () => {
    const artifact = buildRunnerArtifact('codex-exec', 'def456', 'patched');
    expect(validateRunnerArtifact(artifact)).toEqual(artifact);
  });

  it('validates a skipped artifact', () => {
    const artifact = buildRunnerArtifact('skipped', 'ghi789', 'skipped');
    expect(validateRunnerArtifact(artifact)).toEqual(artifact);
  });

  it('returns null for missing runnerKind', () => {
    expect(
      validateRunnerArtifact({
        reviewedHeadSha: 'abc',
        outcome: 'clean',
        completedAt: 'x',
      }),
    ).toBeNull();
  });

  it('returns null for invalid outcome', () => {
    expect(
      validateRunnerArtifact({
        runnerKind: 'claude-cli',
        reviewedHeadSha: 'abc',
        outcome: 'bad',
        completedAt: 'x',
      }),
    ).toBeNull();
  });

  it('returns null for non-object input', () => {
    expect(validateRunnerArtifact(null)).toBeNull();
    expect(validateRunnerArtifact('string')).toBeNull();
    expect(validateRunnerArtifact(42)).toBeNull();
  });
});

// ─── formatRunPolicy (no reviewSubagent) ─────────────────────────────────────

describe('P10.01 — formatRunPolicy without reviewSubagent', () => {
  it('formats policy with three fields only', () => {
    const policy: RunPolicy = {
      ticketBoundaryMode: 'cook',
      subagentReview: 'skip_doc_only',
      prReview: 'skip_doc_only',
    };
    const formatted = formatRunPolicy(policy);
    expect(formatted).toContain('boundary_mode=cook');
    expect(formatted).toContain('subagentReview:skip_doc_only');
    expect(formatted).toContain('prReview:skip_doc_only');
    expect(formatted).not.toContain('reviewSubagent');
  });
});
