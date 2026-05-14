import dayjs from 'dayjs'
import { ChartColor } from '$lib/helpers/chartHelpers'
import { DateFormat, formatTime, secPerHour } from '$lib/helpers/timeHelpers'
import type { SummariesResult } from '$src/types/wakatime'
import type { ComposeOption, LineSeriesOption } from 'echarts/types/dist/shared'
import type { GridComponentOption, TooltipComponentOption } from 'echarts/components'

export const createLineChartData = (summaries: SummariesResult) => {
  if (!summaries.data) return []

  return summaries.data.map((summary) => ({
    name: dayjs(summary.range.date).format(DateFormat.Short),
    value: summary.grand_total.total_seconds / secPerHour,
  }))
}

export const createLineChartOption = (
  data: ReturnType<typeof createLineChartData>,
  color: string | null,
): ComposeOption<GridComponentOption | TooltipComponentOption | LineSeriesOption> => {
  return {
    grid: { left: 45, right: 25, top: 20, bottom: 50 },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value) => `${formatTime(Number(value) * secPerHour)}`,
    },
    xAxis: [
      {
        type: 'category',
        name: 'Date',
        nameLocation: 'middle',
        nameGap: 30,
        boundaryGap: false,
        data: data.map((summary) => summary.name),
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Hours',
        nameLocation: 'middle',
        nameGap: 30,
        axisLabel: {
          showMinLabel: false,
        },
      },
    ],
    series: {
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      areaStyle: {
        color: color ?? ChartColor.Default,
      },
      itemStyle: {
        borderColor: color ?? ChartColor.Default,
        color: color ?? ChartColor.Default,
      },
      lineStyle: {
        width: 2,
        color: color ?? ChartColor.Default,
      },
      data: data.map((summary) => summary.value),
    },
  }
}
