import {
  ChartColor,
  SummaryItemType,
  convertDataDictToChartData,
  createItemNameToTimeDict,
  getSummaryItems,
} from '$lib/helpers/chartHelpers'
import { formatTime } from '$lib/helpers/timeHelpers'
import type { SummariesResult } from '$src/types/wakatime'
import type { GridComponentOption, TooltipComponentOption } from 'echarts/components'
import type {
  ComposeOption,
  LegendComponentOption,
  PieSeriesOption,
} from 'echarts/types/dist/shared'

export const createPieChartData = (summaries: SummariesResult) => {
  const languages = getSummaryItems(summaries, SummaryItemType.Languages)
  const languageDict = createItemNameToTimeDict(languages)
  return convertDataDictToChartData(languageDict)
}

export const createPieChartOption = (
  data: ReturnType<typeof createPieChartData>,
): ComposeOption<
  TooltipComponentOption | GridComponentOption | LegendComponentOption | PieSeriesOption
> => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0)

  return {
    grid: { left: 0, right: 0, bottom: 0, top: 0 },
    tooltip: {
      valueFormatter: (value) =>
        `${formatTime(Number(value))} (${((Number(value) / total) * 100).toFixed(1)}%)`,
    },
    legend: {
      type: 'scroll',
      textStyle: {
        color: ChartColor.Text,
      },
      pageIconColor: ChartColor.Icon,
      pageTextStyle: {
        color: ChartColor.Text,
      },
    },
    series: [
      {
        type: 'pie',
        radius: '60%',
        center: ['50%', '55%'],
        label: {
          color: ChartColor.Text,
        },
        data,
      },
    ],
  }
}
