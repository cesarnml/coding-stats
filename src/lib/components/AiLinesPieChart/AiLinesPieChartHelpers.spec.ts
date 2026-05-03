import type { SummariesResult } from '$src/types/wakatime'
import { describe, expect, it } from 'vitest'
import { computeAiLinesSlices } from './AiLinesPieChartHelpers'

const makeSummaries = (
  days: Array<{
    ai_additions?: number
    ai_deletions?: number
    human_additions?: number
    human_deletions?: number
  }>,
): SummariesResult =>
  ({
    data: days.map((d, i) => ({
      grand_total: {
        ai_additions: d.ai_additions ?? 0,
        ai_deletions: d.ai_deletions ?? 0,
        human_additions: d.human_additions ?? 0,
        human_deletions: d.human_deletions ?? 0,
        ai_input_tokens: 0,
        ai_output_tokens: 0,
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
      range: { date: `2024-01-0${i + 1}`, end: '', start: '', text: '' },
      categories: [],
      dependencies: [],
      editors: [],
      languages: [],
      machines: [],
      projects: [],
      operating_systems: [],
    })),
  }) as unknown as SummariesResult

describe('computeAiLinesSlices', () => {
  it('slices sum to 100% when totals are non-zero', () => {
    const summaries = makeSummaries([
      { ai_additions: 60, ai_deletions: 10, human_additions: 20, human_deletions: 10 },
    ])
    const slices = computeAiLinesSlices(summaries)
    expect(slices).not.toBeNull()
    const total = slices!.reduce((sum, s) => sum + s.value, 0)
    expect(total).toBeCloseTo(100, 1)
  })

  it('each slice value is proportional to its share of total lines', () => {
    const summaries = makeSummaries([
      { ai_additions: 50, ai_deletions: 0, human_additions: 50, human_deletions: 0 },
    ])
    const slices = computeAiLinesSlices(summaries)!
    const aiAdd = slices.find((s) => s.name === 'AI Additions')!
    const humanAdd = slices.find((s) => s.name === 'Human Additions')!
    expect(aiAdd.value).toBeCloseTo(50, 1)
    expect(humanAdd.value).toBeCloseTo(50, 1)
  })

  it('returns null when all line values are zero', () => {
    const summaries = makeSummaries([{ ai_additions: 0, ai_deletions: 0, human_additions: 0, human_deletions: 0 }])
    expect(computeAiLinesSlices(summaries)).toBeNull()
  })

  it('aggregates across multiple days', () => {
    const summaries = makeSummaries([
      { ai_additions: 30, ai_deletions: 0, human_additions: 0, human_deletions: 0 },
      { ai_additions: 70, ai_deletions: 0, human_additions: 0, human_deletions: 0 },
    ])
    const slices = computeAiLinesSlices(summaries)!
    const aiAdd = slices.find((s) => s.name === 'AI Additions')!
    expect(aiAdd.value).toBeCloseTo(100, 1)
  })
})
