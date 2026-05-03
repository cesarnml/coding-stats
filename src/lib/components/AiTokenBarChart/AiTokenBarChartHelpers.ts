import type { SummariesResult } from '$src/types/wakatime'
import type {
  BarSeriesOption,
  ComposeOption,
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
} from 'echarts/types/dist/echarts'

export type AiTokenBarSeries = {
  isPerDay: boolean
  hasData: boolean
  xLabels: string[]
  aiInput: number[]
  aiOutput: number[]
}

export type AiTokenBarOption = ComposeOption<
  TooltipComponentOption | GridComponentOption | LegendComponentOption | BarSeriesOption
>

export function buildAiTokenBarSeries(summaries: SummariesResult): AiTokenBarSeries {
  const isPerDay = summaries.data.length <= 7

  if (isPerDay) {
    const xLabels = summaries.data.map((day) => day.range.date)
    const aiInput = summaries.data.map((day) => day.grand_total.ai_input_tokens ?? 0)
    const aiOutput = summaries.data.map((day) => day.grand_total.ai_output_tokens ?? 0)
    const hasData = aiInput.some((v) => v > 0) || aiOutput.some((v) => v > 0)
    return { isPerDay: true, hasData, xLabels, aiInput, aiOutput }
  }

  const totalInput = summaries.data.reduce(
    (sum, day) => sum + (day.grand_total.ai_input_tokens ?? 0),
    0,
  )
  const totalOutput = summaries.data.reduce(
    (sum, day) => sum + (day.grand_total.ai_output_tokens ?? 0),
    0,
  )
  const hasData = totalInput > 0 || totalOutput > 0
  return {
    isPerDay: false,
    hasData,
    xLabels: ['Total'],
    aiInput: [totalInput],
    aiOutput: [totalOutput],
  }
}

export function buildAiTokenBarOption(series: AiTokenBarSeries): AiTokenBarOption {
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['Input Tokens', 'Output Tokens'] },
    grid: { left: 55, right: 10, top: 40, bottom: 50 },
    xAxis: {
      type: 'category',
      data: series.xLabels,
      axisLabel: { rotate: series.isPerDay ? 30 : 0 },
    },
    yAxis: { type: 'value', name: 'Tokens', nameLocation: 'middle', nameGap: 45 },
    series: [
      { name: 'Input Tokens', type: 'bar', data: series.aiInput },
      { name: 'Output Tokens', type: 'bar', data: series.aiOutput },
    ],
  }
}
