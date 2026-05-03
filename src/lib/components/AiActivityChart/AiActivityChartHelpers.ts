import type { SummariesResult } from '$src/types/wakatime'
import type {
  BarSeriesOption,
  ComposeOption,
  GraphicComponentOption,
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
} from 'echarts/types/dist/echarts'

type SummaryEntry = SummariesResult['data'][number]

export type AiSeriesEntry = {
  date: SummaryEntry['range']['date']
  ai_additions: SummaryEntry['grand_total']['ai_additions']
  human_additions: SummaryEntry['grand_total']['human_additions']
}

export type AiActivityOption = ComposeOption<
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | GraphicComponentOption
  | BarSeriesOption
>

const AI_ACTIVITY_STACK = 'total'

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
    xAxis: { type: 'category', data: data.map((day) => day.date) },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        stack: AI_ACTIVITY_STACK,
        name: 'Human Additions',
        data: data.map((day) => day.human_additions),
      },
      {
        type: 'bar',
        stack: AI_ACTIVITY_STACK,
        name: 'AI Additions',
        data: data.map((day) => day.ai_additions),
      },
    ],
    legend: { data: ['Human Additions', 'AI Additions'] },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  }
}

export function extractAiSeriesData(summaries: SummariesResult): AiSeriesEntry[] {
  return summaries.data.map((day) => ({
    date: day.range.date,
    ai_additions: day.grand_total.ai_additions ?? 0,
    human_additions: day.grand_total.human_additions ?? 0,
  }))
}
