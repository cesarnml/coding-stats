import { ChartColor } from '$lib/helpers/chartHelpers'
import { formatTime } from '$lib/helpers/timeHelpers'
import type { SummariesResult } from '$src/types/wakatime'
import type { ComposeOption, GaugeSeriesOption } from 'echarts'
import zipObject from 'lodash/zipObject'
import { computeAverageSeconds, getDates, getRatios } from '../Stats/summariesHelpers'

export const createDisciplineGaugeData = (summaries: SummariesResult, date: string) => {
  const dailyAverage = computeAverageSeconds(summaries)
  const dates = getDates(summaries).reverse()
  const ratios = getRatios(summaries).reverse()
  const dateToRatioMap = zipObject(dates, ratios)

  return [
    {
      value: dateToRatioMap[date],
      name: `AVG: ${formatTime(dailyAverage)}`,
    },
  ]
}

type DisciplineGaugeData = { name: string; value: number }[]

export const createDisciplineGaugeOption = (
  data: DisciplineGaugeData,
): ComposeOption<GaugeSeriesOption> => {
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        center: ['50%', '65%'],
        radius: '80%',
        min: 0,
        max: 1.0,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.2, '#9A60B4'],
              [0.4, '#EE6666'],
              [0.6, '#FDDD60'],
              [0.8, '#58D9F9'],
              [1, '#7CFFB2'],
            ],
          },
        },
        pointer: {
          keepAspect: true,
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '12%',
          width: 16,
          offsetCenter: [0, '-60%'],
          itemStyle: {
            color: 'inherit',
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: ChartColor.Text,
            width: 2,
          },
        },
        splitLine: {
          length: 20,
          lineStyle: {
            color: 'inherit',
            width: 5,
          },
        },
        axisLabel: {
          color: ChartColor.Text,
          fontSize: 28,
          distance: -50,
          rotate: 'tangential',
          formatter: (value: number) => {
            if (value === 0.9) {
              return '😄'
            } else if (value === 0.7) {
              return '🙂'
            } else if (value === 0.5) {
              return '😐'
            } else if (value === 0.3) {
              return '🫤'
            } else if (value === 0.1) {
              return '🙁'
            }
            return ''
          },
        },
        title: {
          offsetCenter: [0, -10],
          fontSize: 16,
          color: ChartColor.Text,
        },
        detail: {
          fontSize: 16,
          offsetCenter: [0, '-30%'],
          valueAnimation: true,
          formatter: function (value: number) {
            return Math.round(value * 100) + '' + '%' + ` of Avg`
          },
          color: 'inherit',
        },
        data,
      },
    ],
  }
}
