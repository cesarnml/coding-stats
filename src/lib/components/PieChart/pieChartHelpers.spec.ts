import { ChartColor } from '$lib/helpers/chartHelpers'
import type { SummariesResult } from '$src/types/wakatime'
import { createPieChartOption, createPieChartData } from './pieChartHelpers'

describe('createPieChartData', () => {
  it('should calculate the total weekly coding time for each language', () => {
    const summaries = {
      data: [
        {
          languages: [
            { name: 'JavaScript', total_seconds: 3600 },
            { name: 'Python', total_seconds: 1800 },
          ],
        },
        {
          languages: [
            { name: 'JavaScript', total_seconds: 7200 },
            { name: 'TypeScript', total_seconds: 5400 },
          ],
        },
      ],
    } as unknown as SummariesResult

    const result = createPieChartData(summaries)
    const expected = [
      { name: 'JavaScript', value: 10800 },
      { name: 'Python', value: 1800 },
      { name: 'TypeScript', value: 5400 },
    ]
    expect(result).toEqual(expected)
  })
})

describe('createPieChartOption', () => {
  it('should create a pie chart config with the correct data', () => {
    const data = [
      { name: 'JavaScript', value: 10800 },
      { name: 'Python', value: 1800 },
      { name: 'TypeScript', value: 5400 },
    ]

    const expected: echarts.EChartsOption = {
      grid: { left: 0, right: 0, bottom: 0, top: 0 },
      tooltip: {
        valueFormatter: expect.any(Function),
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

    const config = createPieChartOption(data)

    expect(config).toEqual(expected)
  })
  it('should format the tooltip value correctly', () => {
    const data = [
      { name: 'JavaScript', value: 10800 },
      { name: 'TypeScript', value: 10800 },
    ]
    const config = createPieChartOption(data)
    //  @ts-expect-error tough type
    const formatter = config.tooltip?.valueFormatter

    expect(formatter(10800)).toBe('3h (50.0%)')
  })
})
