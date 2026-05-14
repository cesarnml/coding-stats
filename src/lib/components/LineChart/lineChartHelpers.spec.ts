import { ChartColor } from '$lib/helpers/chartHelpers'
import type { SummariesResult } from '$src/types/wakatime'
import { createLineChartData } from './lineChartHelpers'

const summaries = {
  color: ChartColor.Default,
  data: [
    {
      range: {
        date: '2022-05-03',
      },
      grand_total: {
        total_seconds: 3600,
      },
    },
    {
      range: {
        date: '2022-05-04',
      },
      grand_total: {
        total_seconds: 7200,
      },
    },
  ],
} as unknown as SummariesResult

it('should create line chart data', async () => {
  const data = createLineChartData(summaries)
  expect(data).toEqual([
    {
      name: 'May 03',
      value: 1,
    },
    {
      name: 'May 04',
      value: 2,
    },
  ])
})
