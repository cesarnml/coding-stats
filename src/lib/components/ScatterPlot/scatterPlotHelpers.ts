import type { StorySearchResults } from '$lib/generated/openapi/shortcut'
import { ChartColor, getStoryBranches } from '$lib/helpers/chartHelpers'
import { formatTime, secPerHour } from '$lib/helpers/timeHelpers'
import type { SummariesResult } from '$src/types/wakatime'
import type { GridComponentOption, TooltipComponentOption } from 'echarts/components'
import type { ComposeOption, ScatterSeriesOption } from 'echarts/types/dist/shared'
import zipObject from 'lodash/zipObject'

export const createBranchToTimeDict = (
  summaries: SummariesResult,
  available_branches: string[],
) => {
  if (!summaries.data) return {}
  return summaries.data.reduce((result, summary) => {
    summary.branches.forEach((branch) => {
      if (!getStoryBranches(available_branches).includes(branch.name)) {
        return
      }
      result[branch.name] = (result[branch.name] ?? 0) + branch.total_seconds
    })
    return result
  }, {} as Record<string, number>)
}

export const createBranchToEstimateDict = (stories: StorySearchResults) =>
  zipObject(
    stories.data
      .map(
        (story) =>
          story.branches?.find((branch) => branch.name.includes(String(story.id)))?.name as string,
      )
      .filter(Boolean) as string[],
    stories.data.map((story) => story.estimate as number),
  )

export const createBranchesByEstimateDict = (
  branchToEstimateDict: Record<string, number>,
  branchToTimeDict: Record<string, number>,
) =>
  Object.entries(branchToEstimateDict).reduce((acc, [branchName, estimate]) => {
    const defaultBranches: string[] = []
    if (branchToTimeDict[branchName]) {
      acc[estimate] = acc[estimate] ?? defaultBranches
      acc[estimate].push(branchName)
    }
    return acc
  }, {} as Record<string, string[]>)

export const createScatterPlotOption = (
  storyBranches: string[],
  branchToEstimateDict: Record<string, number>,
  branchToTimeDict: Record<string, number>,
  branchesByEstimateDict: Record<string, string[]>,
): ComposeOption<GridComponentOption | TooltipComponentOption | ScatterSeriesOption> => ({
  grid: { left: 40, right: 10, top: 20, bottom: 50 },
  tooltip: {
    formatter: (params: any) => {
      return `${params.marker} ${params.data[2]}: <strong>${formatTime(
        params.data[1] * secPerHour,
      )}<strong>`
    },
  },
  xAxis: {
    type: 'category',
    data: [0, 1, 2, 3, 4, 5, 6],
    name: 'Story Estimate',
    nameLocation: 'middle',
    boundaryGap: false,
    nameGap: 25,
    splitLine: {
      show: true,
    },
    axisLine: {
      show: false,
    },
    axisLabel: {
      showMinLabel: false,
    },
  },
  yAxis: {
    type: 'value',
    name: 'Hours',
    nameLocation: 'middle',
    nameGap: 30,
    axisLabel: {
      showMinLabel: false,
    },
  },
  series: [
    {
      type: 'scatter',
      colorBy: 'data',
      symbolSize: 15,
      data: storyBranches
        .map((branch) => [
          branchToEstimateDict[branch],
          branchToTimeDict[branch] / secPerHour,
          branch,
        ])
        .filter(([estimate]) => Boolean(estimate)),
    },
    {
      type: 'scatter',
      name: 'Average',
      symbol: 'diamond',
      symbolSize: 12,
      color: ChartColor.Poor,
      data: Object.entries(branchesByEstimateDict).map(([estimate, branchNames]) => [
        estimate,
        branchNames.reduce((acc, branchName) => acc + branchToTimeDict[branchName], 0) /
          secPerHour /
          branchNames.length,
        'Average',
      ]),
    },
  ],
})
