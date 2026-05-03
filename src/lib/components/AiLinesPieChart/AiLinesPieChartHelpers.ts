import type { SummariesResult } from '$src/types/wakatime'
import type { ComposeOption, PieSeriesOption, TooltipComponentOption } from 'echarts/types/dist/echarts'

export type AiLinesSlice = {
  name: string
  value: number
}

export type AiLinesPieOption = ComposeOption<TooltipComponentOption | PieSeriesOption>

export function computeAiLinesSlices(summaries: SummariesResult): AiLinesSlice[] | null {
  const totals = summaries.data.reduce(
    (acc, day) => {
      acc.ai_additions += day.grand_total.ai_additions ?? 0
      acc.ai_deletions += day.grand_total.ai_deletions ?? 0
      acc.human_additions += day.grand_total.human_additions ?? 0
      acc.human_deletions += day.grand_total.human_deletions ?? 0
      return acc
    },
    { ai_additions: 0, ai_deletions: 0, human_additions: 0, human_deletions: 0 },
  )

  const total =
    totals.ai_additions + totals.ai_deletions + totals.human_additions + totals.human_deletions

  if (total === 0) return null

  const pct = (n: number) => Math.round((n / total) * 10000) / 100

  const raw = [
    { name: 'AI Additions', value: pct(totals.ai_additions) },
    { name: 'AI Deletions', value: pct(totals.ai_deletions) },
    { name: 'Human Additions', value: pct(totals.human_additions) },
    { name: 'Human Deletions', value: 0 },
  ]
  // Assign the last slice as remainder so slices sum to exactly 100
  const sumFirst = raw.slice(0, -1).reduce((a, s) => a + s.value, 0)
  raw[raw.length - 1].value = Math.round((100 - sumFirst) * 100) / 100

  return raw
}

export function buildAiLinesPieOption(slices: AiLinesSlice[]): AiLinesPieOption {
  return {
    tooltip: {
      trigger: 'item',
      valueFormatter: (value) => `${value}%`,
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: slices,
        label: { formatter: '{b}\n{d}%' },
      },
    ],
  }
}
