import {
  ChartColor,
  DurationItemType,
  LanguageColor,
  type KeyOfLanguageColor,
  type ValueOfDurationItemType,
} from '$lib/helpers/chartHelpers'
import { formatTime, secPerHour, secPerMin } from '$lib/helpers/timeHelpers'
import type { SupabaseDuration } from '$src/routes/api/supabase/durations/+server'
import dayjs from 'dayjs'
import type { CustomSeriesOption, GridComponentOption, TooltipComponentOption } from 'echarts'
import * as echarts from 'echarts'
import type { ComposeOption } from 'echarts/types/dist/shared'
import capitalize from 'lodash/capitalize'
import groupBy from 'lodash/groupBy'
import orderBy from 'lodash/orderBy'

export const createTimelineChartOption = (
  durations: SupabaseDuration,
  itemType: ValueOfDurationItemType,
): ComposeOption<TooltipComponentOption | GridComponentOption | CustomSeriesOption> => {
  const startTime = dayjs(durations.date).unix() // coupling here prevents deconstruction of option/data creation
  const itemTypes = [...new Set(durations.data.map((duration) => duration[itemType]))]
  const itemTypeToDurationsDict = groupBy(durations.data, itemType)
  const itemTypesSortedByDuration = orderBy(itemTypes, (name) =>
    itemTypeToDurationsDict[name].reduce((acc, cur) => cur.duration + acc, 0),
  ).filter(
    (name) =>
      itemTypeToDurationsDict[name].reduce((acc, cur) => cur.duration + acc, 0) >= secPerMin, // filter out durations less than a minute
  )

  const data = itemTypesSortedByDuration.flatMap((name, index) =>
    itemTypeToDurationsDict[name]
      .filter((duration) => duration.duration >= secPerMin) // filter out durations less than a minute
      .map(({ time, duration, color }) => ({
        name,
        value: [
          index,
          time,
          time + duration,
          duration,
          itemType === DurationItemType.Project ? color : LanguageColor[name as KeyOfLanguageColor],
        ],
      })),
  )
  return {
    grid: { left: 32, right: 10, top: 20, bottom: 50 },
    tooltip: {
      formatter: (params: any) =>
        `${params.marker}${params.name}: <strong>${formatTime(params.value[3])}</strong>`,
    },
    xAxis: {
      type: 'time',
      name: 'Time',
      nameLocation: 'middle',
      nameGap: 30,
      min: startTime,
      axisLine: {
        show: true,
      },
      axisLabel: {
        formatter: (val) => `${Math.floor(Math.max(0, val - startTime) / secPerHour)}h`,
      },
    },
    yAxis: {
      data: itemTypesSortedByDuration,
      name: `${capitalize(itemType)}s`,
      nameLocation: 'middle',
      nameGap: 20,
      type: 'category',
      axisTick: {
        alignWithLabel: true,
      },
      zlevel: 10,
      axisLabel: {
        color: ChartColor.Text,
        inside: true,
        fontSize: 14,
        fontFamily: 'monospace',
        textShadowColor: ChartColor.Text,
        textShadowBlur: 1,
      },
    },
    series: [
      {
        type: 'custom',
        renderItem: (params: any, api: any) => {
          const categoryIndex = api.value(0)
          const start = api.coord([api.value(1), categoryIndex])
          const end = api.coord([api.value(2), categoryIndex])
          const height = api.size([0, 1])[1] * 0.6
          const rectShape = echarts.graphic.clipRectByRect(
            {
              x: start[0],
              y: start[1] - height / 2,
              width: end[0] - start[0],
              height: height,
            },
            {
              x: params.coordSys.x,
              y: params.coordSys.y,
              width: params.coordSys.width,
              height: params.coordSys.height,
            },
          )
          return (
            rectShape && {
              type: 'rect',
              transition: ['shape'],
              shape: rectShape,
              style: {
                fill: api.value(4),
                stroke: api.value(4),
                lineWidth: 0,
                opacity: 0.7,
              },
            }
          )
        },
        itemStyle: {
          opacity: 0.4,
        },
        encode: {
          x: [1, 2],
          y: 0,
        },
        data,
      },
    ],
  }
}
