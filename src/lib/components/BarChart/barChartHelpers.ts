import { HOUR_GOAL, getPercent, hours } from '$lib/constants'
import { ChartColor, type ValueOfSummaryItemType } from '$lib/helpers/chartHelpers'
import {
  DateFormat,
  formatTime,
  integerDateMap,
  secPerHour,
  secPerMin,
  weekdays,
  type KeyOfDateMap,
} from '$lib/helpers/timeHelpers'
import type { SupabaseDuration } from '$src/routes/api/supabase/durations/+server'
import type { SummariesResult } from '$src/types/wakatime'
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import type {
  BarSeriesOption,
  ComposeOption,
  GridComponentOption,
  LegendComponentOption,
  LineSeriesOption,
  MarkAreaComponentOption,
  TooltipComponentOption,
} from 'echarts/types/dist/echarts'
import sum from 'lodash/sum'
import zipObject from 'lodash/zipObject'

dayjs.extend(localeData)

export type StackedBarChartOption = ComposeOption<
  TooltipComponentOption | GridComponentOption | LegendComponentOption | BarSeriesOption
>

export type SimpleBarChartOption = ComposeOption<
  TooltipComponentOption | GridComponentOption | BarSeriesOption | LineSeriesOption
>

export const createXAxisValues = (summaries: SummariesResult) =>
  summaries.data?.map((item) => dayjs(item.range.date).format(DateFormat.Short))

type Params = {
  summaries: SummariesResult
  itemsType: ValueOfSummaryItemType
}

const _createItemsByXValues = ({ summaries, itemsType }: Params) =>
  summaries.data?.map((summary) => summary[itemsType])

const _getItemNames = ({ summaries, itemsType }: Params) => {
  if (!summaries.data) return []

  return [
    ...new Set(
      summaries.data.flatMap((summary) => summary[itemsType].map((project) => project.name)),
    ),
  ]
}

export const createBarChartSeries = ({ summaries, itemsType }: Params) => {
  if (!summaries.data) return []

  const xValues = createXAxisValues(summaries)
  const itemsByXValues = _createItemsByXValues({ summaries, itemsType })
  const itemNames = _getItemNames({ summaries, itemsType })

  const yDataByItem = zipObject(
    itemNames,
    Array(itemNames.length)
      .fill(null)
      .map(() => Array(xValues.length).fill(0)),
  )

  itemsByXValues.forEach((items, index) => {
    items.forEach((item) => {
      yDataByItem[item.name][index] = item.total_seconds / secPerHour
    })
  })

  return itemNames.map((itemName) => {
    return {
      type: 'bar',
      data: yDataByItem[itemName],
      stack: 'total',
      name: itemName,
    }
  }) as BarSeriesOption[]
}

export const createStackedBarChartOption = (
  xValues: string[],
  series: BarSeriesOption[],
): StackedBarChartOption => {
  /** @type EChartsOption */
  return {
    tooltip: {
      valueFormatter: (value) => formatTime(Number(value) * secPerHour),
    },
    grid: { left: 55, right: 10, top: 55, bottom: 50 },
    legend: {
      type: 'scroll',
      pageIconColor: ChartColor.Icon,
      pageTextStyle: {
        color: ChartColor.Text,
      },
    },
    xAxis: {
      type: 'category',
      name: 'Date',
      nameLocation: 'middle',
      nameGap: 30,
      data: xValues,
      axisTick: {
        alignWithLabel: true,
        show: true,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Hours',
      nameLocation: 'middle',
      nameGap: 40,
      axisLabel: {
        showMinLabel: false,
      },
    },
    series,
  }
}

export const createSimpleBarChartOption = (summaries: SummariesResult): SimpleBarChartOption => {
  if (!summaries.data) return {}

  const dateCount = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  }

  type KeyOfDateCount = keyof typeof dateCount

  const yDataByWeekday: Record<string, number> = {}

  summaries.data.forEach((datum) => {
    const dateInteger = dayjs(datum.range.date).day() as KeyOfDateMap
    dateCount[dateInteger] += 1

    yDataByWeekday[integerDateMap[dateInteger]] =
      (yDataByWeekday[integerDateMap[dateInteger]] ?? 0) + datum.grand_total.total_seconds
  })

  return {
    grid: { left: 45, right: 10, top: 20, bottom: 50 },
    tooltip: {
      valueFormatter: (value) => formatTime(Number(value) * secPerHour),
    },
    xAxis: {
      type: 'category',
      name: 'Weekday',
      nameLocation: 'middle',
      nameGap: 30,
      data: weekdays,
      axisTick: {
        alignWithLabel: true,
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
        type: 'bar',
        data: weekdays
          .map(
            (weekday, index) =>
              yDataByWeekday[weekday] / dateCount[index as KeyOfDateCount] / secPerHour,
          )
          .map((value, index) => ({
            value,
            itemStyle: {
              color:
                index > 4 ? ChartColor.Fair : value > HOUR_GOAL ? ChartColor.Good : ChartColor.Poor,
            },
          })),
      },
      {
        type: 'line',
        lineStyle: {
          width: 2,
        },
        itemStyle: {
          borderColor: ChartColor.Great,
          borderCap: 'round',
          borderWidth: 5,
        },
        color: ChartColor.Great,
        data: Array(5).fill(HOUR_GOAL),
        name: 'Daily Coding Goal',
        zlevel: 20,
      },
    ],
  }
}

export const createActiveHoursData = (durations: SupabaseDuration) =>
  durations.data
    .reduce((acc, duration) => {
      const start = duration.time
      const end = duration.time + duration.duration

      const startTime = dayjs.unix(start)
      const endTime = dayjs.unix(end)
      const startHour = startTime.hour()
      const endHour = endTime.hour()

      if (startHour === endHour) {
        acc[startHour] = Math.max(0, acc[startHour] + endTime.diff(startTime, 'minutes'))
        return acc
      }

      for (let hour = startHour; hour <= endHour; hour++) {
        const startInterval = startTime.hour(hour).minute(0).millisecond(0)
        const endInterval = startTime
          .hour(hour + 1)
          .minute(0)
          .millisecond(0)
        const lowerMinute = startInterval.isBefore(startTime) ? startTime.minute() : 0
        const upperMinute = endInterval.isBefore(endTime) ? 60 : endTime.minute()
        const deltaMinutes = upperMinute - lowerMinute
        acc[hour] = Math.max(0, acc[hour] + deltaMinutes)
      }
      return acc
    }, Array(24).fill(0))
    .map((value: number, index) => {
      return {
        value,
        itemStyle:
          dayjs().isSame(durations.date, 'day') && dayjs().hour() === index
            ? { color: ChartColor.Time }
            : value > 45
            ? { color: ChartColor.Great }
            : value > 30
            ? { color: ChartColor.Good }
            : value > 15
            ? { color: ChartColor.Fair }
            : { color: ChartColor.Poor },
      }
    })

export const createActiveHoursOption = (
  data: ReturnType<typeof createActiveHoursData>,
  durations: SupabaseDuration,
): ComposeOption<
  GridComponentOption | TooltipComponentOption | BarSeriesOption | MarkAreaComponentOption
> => {
  const startHour = '10a'
  const endHour = '6p'
  const goalMinutes = 300

  const startIndex = hours.findIndex((hour) => hour === startHour)
  const endIndex = hours.findIndex((hour) => hour === endHour)

  const innerMinutes = sum(data.map((datum) => datum.value).slice(startIndex, endIndex + 1))
  const totalMinutes = sum(data.map((datum) => datum.value))
  const outerMinutes = totalMinutes - innerMinutes

  /** @type EChartsOption */
  return {
    grid: { left: 45, right: 10, top: 20, bottom: 50 },
    xAxis: {
      type: 'category',
      name: 'Time',
      nameLocation: 'middle',
      nameGap: 30,
      data: hours,
      axisLabel: {
        showMaxLabel: true,
        show: true,
        rich: {
          a: {
            color: ChartColor.Time,
          },
        },
        formatter: (value, index) => {
          if (index === dayjs().hour() && dayjs().isSame(durations.date, 'day')) {
            return `{a|${value}}`
          } else {
            return value
          }
        },
      },
    },
    yAxis: {
      type: 'value',
      name: 'Minutes',
      nameLocation: 'middle',
      nameGap: 30,
      max: 60,
      axisLabel: {
        showMinLabel: false,
      },
    },
    tooltip: {
      valueFormatter: (value) => `${value}m`,
    },
    series: [
      {
        type: 'bar',
        data,
        showBackground: true,
        markArea: {
          itemStyle: {
            color: 'rgba(15,117,224,0.2)',
          },
          // echarts-disable-next-line
          tooltip: {
            show: true,
            formatter: () => {
              return [
                `<div style="display: flex; gap: 12px; font-family: monospace">Work Hours: <span style="color:blue; font-weight: bold">${startHour} - ${endHour}</span></div>`,
                `<div style="display: flex; gap: 12px; font-family: monospace">Goal Hours: <span style="color:purple; font-weight: bold"> ${formatTime(
                  goalMinutes * secPerMin,
                )} <small>(${getPercent(totalMinutes / goalMinutes)})</small></span></div>`,
                '<hr style="margin: 4px 0 4px 0"/>',
                `<div style="display: flex; gap: 36px; font-family: monospace">In-Time: <span style="color:green; font-weight: bold"> ${formatTime(
                  innerMinutes * secPerMin,
                )} <small>(${getPercent(innerMinutes / goalMinutes)})</small></span></div>`,
                `<div style="display: flex; gap: 28px; font-family: monospace">Out-Time: <span style="color:red; font-weight: bold"> ${formatTime(
                  outerMinutes * secPerMin,
                )} <small>(${getPercent(outerMinutes / goalMinutes)})</small></span></div>`,
              ].join(' ')
            },
          },
          data: [
            [
              {
                xAxis: startHour,
              },
              {
                // echarts-disable-next-line
                xAxis: hours[endIndex - 1],
              },
            ],
          ],
        },
      },
    ],
  }
}
