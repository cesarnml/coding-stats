import type { SummariesResult } from '$src/types/wakatime'
import type {
  BarSeriesOption,
  ComposeOption,
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
} from 'echarts/types/dist/echarts'

export type AiTokenBarSeries = {
  hasData: boolean
  xLabels: string[]
  aiInput: number[]
  aiOutput: number[]
}

export type AiTokenBarOption = ComposeOption<
  TooltipComponentOption | GridComponentOption | LegendComponentOption | BarSeriesOption
>

function formatDateLabel(dateStr: string): string {
  const [, month, day] = dateStr.split('-').map(Number)
  const monthName = new Date(2000, month - 1).toLocaleString('en-US', { month: 'short' })
  return `${monthName} ${day}`
}

export function buildAiTokenBarSeries(summaries: SummariesResult): AiTokenBarSeries {
  const xLabels = summaries.data.map((day) => formatDateLabel(day.range.date))
  const aiInput = summaries.data.map((day) => day.grand_total.ai_input_tokens ?? 0)
  const aiOutput = summaries.data.map((day) => day.grand_total.ai_output_tokens ?? 0)
  const hasData = aiInput.some((v) => v > 0) || aiOutput.some((v) => v > 0)
  return { hasData, xLabels, aiInput, aiOutput }
}

function formatTokenAxis(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}

export function buildAiTokenBarOption(series: AiTokenBarSeries): AiTokenBarOption {
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      data: ['Input Tokens', 'Output Tokens'],
      bottom: 0,
    },
    grid: { left: 55, right: 10, top: 60, bottom: 50 },
    xAxis: {
      type: 'category',
      data: series.xLabels,
      axisLabel: { rotate: 0, align: 'center' },
    },
    yAxis: {
      type: 'value',
      name: 'Tokens',
      nameLocation: 'middle',
      nameGap: 45,
      axisLabel: { formatter: formatTokenAxis },
    },
    series: [
      { name: 'Input Tokens', type: 'bar', stack: 'tokens', data: series.aiInput },
      { name: 'Output Tokens', type: 'bar', stack: 'tokens', data: series.aiOutput },
    ],
  }
}
