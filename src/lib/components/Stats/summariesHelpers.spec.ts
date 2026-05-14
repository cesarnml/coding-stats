import type { SummariesResult } from '$src/types/wakatime'
import {
  computeAverageSeconds,
  computeHolidayCount,
  computeTotalSeconds,
  computeWorkdayCount,
} from './summariesHelpers'

const summaries = {
  data: [
    {
      grand_total: {
        total_seconds: 10,
      },
    },
    {
      grand_total: {
        total_seconds: 60,
      },
    },
  ],
} as unknown as SummariesResult

describe('computeTotalSeconds', () => {
  it('correctly sums total seconds', async () => {
    expect(computeTotalSeconds(summaries)).toEqual(70)
  })
})

describe('computeHolidayCount', () => {
  it('correctly counts code holidays', async () => {
    expect(computeHolidayCount(summaries)).toEqual(1)
  })
})

describe('computeWorkdayCount', () => {
  it('correctly computes workday count', async () => {
    expect(computeWorkdayCount(summaries)).toEqual(2)
  })
})

describe('computeAverageSeconds', () => {
  it('correctly computes average seconds', async () => {
    expect(computeAverageSeconds(summaries)).toEqual(70)
  })
})
