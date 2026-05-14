import { describe, expect, it } from 'bun:test';

import type { OrchestratorConfig } from '../config';
import { parseCliArgs, resolveRuntimePolicyOverrides } from '../cli';

const DUMMY_USAGE = 'Usage: bun run deliver --plan <plan> <command>';

const baseRawConfig: OrchestratorConfig = {
  defaultBranch: 'main',
  planRoot: 'docs',
  runtime: 'bun',
  packageManager: 'bun',
  ticketBoundaryMode: 'cook',
  reviewPolicy: { subagentReview: 'skip_doc_only', prReview: 'skip_doc_only' },
};

describe('P7.02 runtime policy override parsing and resolution', () => {
  describe('parseCliArgs — new policy flags', () => {
    it('parses --subagent-review-policy required', () => {
      const result = parseCliArgs(
        [
          '--plan',
          'docs/product/delivery/phase-07/implementation-plan.md',
          'start',
          '--subagent-review-policy',
          'required',
        ],
        DUMMY_USAGE,
      );
      expect(result.subagentReviewPolicy).toBe('required');
    });

    it('parses --subagent-review-policy disabled', () => {
      const result = parseCliArgs(
        ['--plan', 'x.md', 'start', '--subagent-review-policy', 'disabled'],
        DUMMY_USAGE,
      );
      expect(result.subagentReviewPolicy).toBe('disabled');
    });

    it('parses --pr-review-policy skip_doc_only', () => {
      const result = parseCliArgs(
        ['--plan', 'x.md', 'start', '--pr-review-policy', 'skip_doc_only'],
        DUMMY_USAGE,
      );
      expect(result.prReviewPolicy).toBe('skip_doc_only');
    });

    it('parses --preferred-runner claude-cli', () => {
      const result = parseCliArgs(
        [
          '--plan',
          'x.md',
          'subagent-review',
          '--preferred-runner',
          'claude-cli',
        ],
        DUMMY_USAGE,
      );
      expect(result.preferredRunner).toBe('claude-cli');
    });

    it('parses --preferred-runner codex-exec', () => {
      const result = parseCliArgs(
        [
          '--plan',
          'x.md',
          'subagent-review',
          '--preferred-runner',
          'codex-exec',
        ],
        DUMMY_USAGE,
      );
      expect(result.preferredRunner).toBe('codex-exec');
    });

    it('throws on invalid --preferred-runner value', () => {
      expect(() =>
        parseCliArgs(
          ['--plan', 'x.md', 'subagent-review', '--preferred-runner', 'gemini'],
          DUMMY_USAGE,
        ),
      ).toThrow('--preferred-runner');
    });

    it('throws when --preferred-runner value is missing', () => {
      expect(() =>
        parseCliArgs(
          ['--plan', 'x.md', 'subagent-review', '--preferred-runner'],
          DUMMY_USAGE,
        ),
      ).toThrow('--preferred-runner');
    });

    it('throws on invalid --subagent-review-policy value', () => {
      expect(() =>
        parseCliArgs(
          ['--plan', 'x.md', 'start', '--subagent-review-policy', 'bogus'],
          DUMMY_USAGE,
        ),
      ).toThrow('--subagent-review-policy');
    });

    it('throws on invalid --pr-review-policy value', () => {
      expect(() =>
        parseCliArgs(
          ['--plan', 'x.md', 'start', '--pr-review-policy', 'bogus'],
          DUMMY_USAGE,
        ),
      ).toThrow('--pr-review-policy');
    });

    it('leaves policy fields undefined when flags are absent', () => {
      const result = parseCliArgs(['--plan', 'x.md', 'status'], DUMMY_USAGE);
      expect(result.subagentReviewPolicy).toBeUndefined();
      expect(result.prReviewPolicy).toBeUndefined();
      expect(result.preferredRunner).toBeUndefined();
    });
  });

  describe('resolveRuntimePolicyOverrides', () => {
    it('throws when --pr-review-policy is non-disabled and prReviewAgents absent', () => {
      const configNoAgents: OrchestratorConfig = {
        ...baseRawConfig,
        prReviewAgents: undefined,
      };
      expect(() =>
        resolveRuntimePolicyOverrides(
          { prReviewPolicy: 'required' },
          configNoAgents,
        ),
      ).toThrow('prReviewAgents');
    });

    it('allows --pr-review-policy disabled even when prReviewAgents absent', () => {
      const configNoAgents: OrchestratorConfig = {
        ...baseRawConfig,
        prReviewAgents: undefined,
      };
      expect(() =>
        resolveRuntimePolicyOverrides(
          { prReviewPolicy: 'disabled' },
          configNoAgents,
        ),
      ).not.toThrow();
    });

    it('patches subagentReview when --subagent-review-policy provided', () => {
      const patched = resolveRuntimePolicyOverrides(
        { subagentReviewPolicy: 'required' },
        baseRawConfig,
      );
      expect(patched.reviewPolicy?.subagentReview).toBe('required');
      expect(patched.reviewPolicy?.prReview).toBe('skip_doc_only');
    });

    it('patches prReview when --pr-review-policy provided', () => {
      const patched = resolveRuntimePolicyOverrides(
        { prReviewPolicy: 'disabled' },
        baseRawConfig,
      );
      expect(patched.reviewPolicy?.prReview).toBe('disabled');
    });

    it('patches ticketBoundaryMode when --boundary-mode provided', () => {
      const patched = resolveRuntimePolicyOverrides(
        { boundaryMode: 'gated' },
        baseRawConfig,
      );
      expect(patched.ticketBoundaryMode).toBe('gated');
    });

    it('returns config unchanged when no flags provided', () => {
      const patched = resolveRuntimePolicyOverrides({}, baseRawConfig);
      expect(patched.ticketBoundaryMode).toBe('cook');
      expect(patched.reviewPolicy?.subagentReview).toBe('skip_doc_only');
    });
  });
});
