import type { SummariesResult } from '$src/types/wakatime'
import { describe, expect, it } from 'vitest'
import { buildAiActivityOption, extractAiSeriesData } from './AiActivityChartHelpers'

describe('buildAiActivityOption', () => {
  it('maps daily summaries to one stacked human and AI series', () => {
    const result = buildAiActivityOption([
      { date: '2026-05-01', ai_additions: 100, human_additions: 40 },
      { date: '2026-05-02', ai_additions: 200, human_additions: 80 },
    ])
    const series = Array.isArray(result.series) ? result.series : [result.series]

    expect(series).toHaveLength(2)
    expect(series[0]).toMatchObject({
      name: 'Human Additions',
      stack: 'total',
      data: [40, 80],
    })
    expect(series[1]).toMatchObject({
      name: 'AI Additions',
      stack: 'total',
      data: [100, 200],
    })
    expect(result.legend).toMatchObject({ data: ['Human Additions', 'AI Additions'] })
    expect(result.xAxis).toMatchObject({ data: ['2026-05-01', '2026-05-02'] })
  })

  it('returns empty state option when data array is empty', () => {
    const result = buildAiActivityOption([])
    expect(result.graphic).toBeDefined()
  })

  it('handles zero-value days without crashing', () => {
    const result = buildAiActivityOption([
      { date: '2026-05-01', ai_additions: 0, human_additions: 0 },
    ])
    const series = Array.isArray(result.series) ? result.series : [result.series]

    expect(series[0]).toMatchObject({ data: [0] })
    expect(series[1]).toMatchObject({ data: [0] })
  })
})

describe('extractAiSeriesData', () => {
  it('maps summaries data to ai series entries', () => {
    const summaries = {
      data: [
        {
          range: { date: '2026-05-01' },
          grand_total: { ai_additions: 10, human_additions: 5 },
        },
        {
          range: { date: '2026-05-02' },
          grand_total: { ai_additions: 20, human_additions: 15 },
        },
      ],
    } as unknown as SummariesResult

    const result = extractAiSeriesData(summaries)
    expect(result).toEqual([
      { date: '2026-05-01', ai_additions: 10, human_additions: 5 },
      { date: '2026-05-02', ai_additions: 20, human_additions: 15 },
    ])
  })
})
