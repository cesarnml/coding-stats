import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import localeData from 'dayjs/plugin/localeData'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(duration)
dayjs.extend(localeData)
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)

export const DateFormat = {
  Short: 'MMM DD',
  Shortish: 'MMM Do',
  Long: 'MMM DD YYYY',
  Query: 'YYYY-MM-DD',
  TwelveHour: 'h:mm a',
  Time: 'h:mm:ss a',
} as const

export const fromNow = (date: string) => dayjs(date).fromNow()

export const secPerMin = 60
export const secPerHour = 3600
export const hoursPerDay = 24

/**
 * ['Mon',  'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun]
 */
export const weekdays = [...dayjs.weekdaysShort().slice(1), 'Sun']

export const integerDateMap = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
} as const

export type KeyOfDateMap = keyof typeof integerDateMap

export const MINIMAL_WORK_DEFAULT_PROMPT = 'Less than 1 minute'

export const getDays = (value: number) => dayjs.duration(value, 's').days()
export const getHours = (value: number) => dayjs.duration(value, 's').hours()
export const getMinutes = (value: number) => dayjs.duration(value, 's').minutes()

export const getTotalHours = (value: number) => getDays(value) * hoursPerDay + getHours(value)
export const hasHours = (value: number) => Boolean(getTotalHours(value))
export const formatHours = (value: number) => (hasHours(value) ? `${getTotalHours(value)}h` : '')

export const hasMinutes = (value: number) => Boolean(getMinutes(value))
export const formatMinutes = (value: number) => (hasMinutes(value) ? `${getMinutes(value)}m` : '')

export const isMinimalWork = (value: number) => !hasHours(value) && !hasMinutes(value)
export const formatMinimalWork = (value: number) =>
  isMinimalWork(value) ? MINIMAL_WORK_DEFAULT_PROMPT : ''

export const formatTime = (value: number) => `${formatHours(value)} ${formatMinutes(value)}`.trim()
