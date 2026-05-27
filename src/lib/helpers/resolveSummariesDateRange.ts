import { WakaApiRange, WakaToShortcutApiRange } from '$lib/constants'
import { DateFormat } from '$lib/helpers/timeHelpers'
import dayjs from 'dayjs'

export function resolveSummariesDateRange(
  range: string,
  start: string | null,
  end: string | null,
): { rangeStart: string; rangeEnd: string } {
  const hasCustomRange = Boolean(start && end)
  const rangeStart = hasCustomRange
    ? start!
    : dayjs()
        .utc()
        .subtract(WakaToShortcutApiRange[range as keyof typeof WakaToShortcutApiRange], 'd')
        .format(DateFormat.Query)
  const rangeEnd = hasCustomRange
    ? end!
    : range === WakaApiRange.Yesterday || range === WakaApiRange.Last_7_Days_From_Yesterday
      ? dayjs().utc().subtract(1, 'd').format(DateFormat.Query)
      : dayjs().utc().format(DateFormat.Query)

  return { rangeStart, rangeEnd }
}
