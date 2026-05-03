import type { SummariesResult } from '$src/types/wakatime'
import { describe, expect, it } from 'vitest'
import { buildAiTokenBarSeries } from './AiTokenBarChartHelpers'

const makeSummaries = (
  days: Array<{ ai_input_tokens?: number; ai_output_tokens?: number; date?: string }>,
): SummariesResult =>
  ({
    data: days.map((d, i) => ({
      grand_total: {
        ai_additions: 0,
        ai_deletions: 0,
        human_additions: 0,
        human_deletions: 0,
        ai_input_tokens: d.ai_input_tokens ?? 0,
        ai_output_tokens: d.ai_output_tokens ?? 0,
        total_seconds: 0,
        hours: 0,
        minutes: 0,
        decimal: '0',
        digital: '0',
        text: '0',
        ai_prompt_length_avg: 0,
        ai_prompt_length_sum: 0,
        ai_prompt_events: 0,
      },
      range: { date: d.date ?? `2024-01-0${i + 1}`, end: '', start: '', text: '' },
      categories: [],
      dependencies: [],
      editors: [],
      languages: [],
      machines: [],
      projects: [],
      operating_systems: [],
    })),
  }) as unknown as SummariesResult

describe('buildAiTokenBarSeries', () => {
  it('returns per-day series when data has 7 or fewer days', () => {
    const summaries = makeSummaries(
      Array.from({ length: 7 }, (_, i) => ({
        ai_input_tokens: (i + 1) * 100,
        ai_output_tokens: (i + 1) * 50,
      })),
    )
    const result = buildAiTokenBarSeries(summaries)
    expect(result.isPerDay).toBe(true)
    expect(result.hasData).toBe(true)
    expect(result.aiInput).toHaveLength(7)
    expect(result.aiOutput).toHaveLength(7)
  })

  it('returns two-bar totals when data has more than 7 days', () => {
    const summaries = makeSummaries(
      Array.from({ length: 30 }, (_, i) => ({
        ai_input_tokens: 100,
        ai_output_tokens: 50,
      })),
    )
    const result = buildAiTokenBarSeries(summaries)
    expect(result.isPerDay).toBe(false)
    expect(result.hasData).toBe(true)
    expect(result.aiInput).toHaveLength(1)
    expect(result.aiInput[0]).toBe(3000)
    expect(result.aiOutput[0]).toBe(1500)
  })

  it('marks hasData false when all token values are zero', () => {
    const summaries = makeSummaries([
      { ai_input_tokens: 0, ai_output_tokens: 0 },
      { ai_input_tokens: 0, ai_output_tokens: 0 },
    ])
    const result = buildAiTokenBarSeries(summaries)
    expect(result.hasData).toBe(false)
  })

  it('adaptive threshold is based on data length not range string', () => {
    // Exactly 7 days → per-day
    const seven = makeSummaries(Array.from({ length: 7 }, () => ({ ai_input_tokens: 10 })))
    expect(buildAiTokenBarSeries(seven).isPerDay).toBe(true)

    // 8 days → totals
    const eight = makeSummaries(Array.from({ length: 8 }, () => ({ ai_input_tokens: 10 })))
    expect(buildAiTokenBarSeries(eight).isPerDay).toBe(false)
  })
})
