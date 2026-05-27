import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { resolveSummariesDateRange } from './resolveSummariesDateRange'
import { WakaApiRange } from '$lib/constants'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

describe('resolveSummariesDateRange', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-03-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses custom start and end when both are provided', () => {
    const { rangeStart, rangeEnd } = resolveSummariesDateRange(
      WakaApiRange.Custom,
      '2024-01-01',
      '2024-01-31',
    )
    expect(rangeStart).toBe('2024-01-01')
    expect(rangeEnd).toBe('2024-01-31')
  })

  it('subtracts 29 days for Last 30 Days', () => {
    const { rangeStart, rangeEnd } = resolveSummariesDateRange(WakaApiRange.Last_30_Days, null, null)
    expect(rangeStart).toBe('2024-02-15')
    expect(rangeEnd).toBe('2024-03-15')
  })

  it('ends yesterday for Yesterday range', () => {
    const { rangeStart, rangeEnd } = resolveSummariesDateRange(WakaApiRange.Yesterday, null, null)
    expect(rangeStart).toBe('2024-03-14')
    expect(rangeEnd).toBe('2024-03-14')
  })
})
