import type { SummariesResult } from '$src/types/wakatime'

export type AiSeriesEntry = {
  date: string
  ai_additions: number
  human_additions: number
}

type AiActivityOption = {
  xAxis: { type: 'category'; data: string[] }
  yAxis: { type: 'value' }
  series: Array<{ type: 'bar'; stack: string; name: string; data: number[] }>
  legend: object
  tooltip: object
  grid: object
  graphic?: object
}

export function buildAiActivityOption(data: AiSeriesEntry[]): AiActivityOption {
  if (data.length === 0) {
    return {
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [],
      legend: {},
      tooltip: {},
      grid: {},
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: 'No AI data for this range',
          fill: '#aaa',
          fontSize: 14,
        },
      },
    }
  }

  return {
    xAxis: { type: 'category', data: data.map((d) => d.date) },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        stack: 'ai-human',
        name: 'AI Additions',
        data: data.map((d) => d.ai_additions),
      },
      {
        type: 'bar',
        stack: 'ai-human',
        name: 'Human Additions',
        data: data.map((d) => d.human_additions),
      },
    ],
    legend: { data: ['AI Additions', 'Human Additions'] },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  }
}

export function extractAiSeriesData(summaries: SummariesResult): AiSeriesEntry[] {
  return summaries.data.map((d) => ({
    date: d.range.date,
    ai_additions: d.grand_total.ai_additions ?? 0,
    human_additions: d.grand_total.human_additions ?? 0,
  }))
}
