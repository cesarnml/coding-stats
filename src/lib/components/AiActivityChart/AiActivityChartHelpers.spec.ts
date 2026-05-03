import { describe, expect, it } from 'vitest'
import { buildAiActivityOption, extractAiSeriesData } from './AiActivityChartHelpers'
import type { SummariesResult } from '$src/types/wakatime'

describe('buildAiActivityOption', () => {
  it('maps daily summaries to stacked AI and human series', () => {
    const result = buildAiActivityOption([
      { date: '2026-05-01', ai_additions: 100, human_additions: 40 },
      { date: '2026-05-02', ai_additions: 200, human_additions: 80 },
    ])
    expect(result.series[0].data).toEqual([100, 200])
    expect(result.series[1].data).toEqual([40, 80])
    expect(result.xAxis.data).toEqual(['2026-05-01', '2026-05-02'])
  })

  it('returns empty state option when data array is empty', () => {
    const result = buildAiActivityOption([])
    expect(result.graphic).toBeDefined()
  })

  it('handles zero-value days without crashing', () => {
    const result = buildAiActivityOption([
      { date: '2026-05-01', ai_additions: 0, human_additions: 0 },
    ])
    expect(result.series[0].data).toEqual([0])
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
