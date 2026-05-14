import { BRANCH_ONLY_ID_DELIMITER, MAIN_BRANCH } from '$lib/constants'
import { getBranchShortName } from '$lib/helpers/chartHelpers'
import { formatTime, secPerHour } from '$lib/helpers/timeHelpers'
import type { SummariesResult } from '$src/types/wakatime'
import type {
  DatasetComponentOption,
  GridComponentOption,
  TooltipComponentOption,
} from 'echarts/components'
import type { BarSeriesOption, ComposeOption } from 'echarts/types/dist/shared'

export const createVerticalBarChartDatasetSource = (summaries: SummariesResult) => {
  if (!summaries.data) return []
  const branchToTimeDict = summaries.data.reduce((result, summary) => {
    summary.branches
      .filter((branch) => branch.name !== MAIN_BRANCH)
      .forEach((entity) => {
        result[entity.name] = (result[entity.name] ?? 0) + entity.total_seconds
      })
    return result
  }, {} as Record<string, number>)

  return Object.entries(branchToTimeDict).map(([branchFullName, totalSeconds]) => [
    getBranchShortName(branchFullName).split(BRANCH_ONLY_ID_DELIMITER)[1],
    totalSeconds / secPerHour,
  ])
}

export const createVerticalBarChartOption = (
  source: ReturnType<typeof createVerticalBarChartDatasetSource>,
  branches: string[],
): ComposeOption<
  GridComponentOption | TooltipComponentOption | DatasetComponentOption | BarSeriesOption
> => {
  return {
    grid: { left: 45, right: 10, top: 20, bottom: 65 },
    tooltip: {
      formatter: (params: any) => {
        return `${params.marker} ${branches.find((branch) =>
          branch.includes(params.name),
        )}: <strong>${formatTime(params.data[1] * secPerHour)}</strong>`
      },
    },
    dataset: [
      {
        source,
        dimensions: ['name', 'time'],
      },
      {
        transform: {
          type: 'sort',
          config: { dimension: 'time', order: 'desc' },
        },
      },
    ],
    xAxis: {
      type: 'category',
      name: 'Branches',
      nameLocation: 'middle',
      nameGap: 35,
      axisLabel: {
        interval: 0,
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Hours',
      nameLocation: 'middle',
      nameGap: 30,
    },
    series: {
      colorBy: 'data',
      type: 'bar',
      encode: { x: 'name', y: 'time' },
      datasetIndex: 1,
    },
  }
}
