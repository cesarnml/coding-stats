import {
  MINIMAL_WORK_DEFAULT_PROMPT,
  formatHours,
  formatMinimalWork,
  formatMinutes,
  formatTime,
  getDays,
  getHours,
  getMinutes,
  getTotalHours,
  hasHours,
  hasMinutes,
  isMinimalWork,
} from './timeHelpers'

describe('getDays', () => {
  it('converts seconds to whole days', async () => {
    expect(getDays(86399)).toBe(0)
    expect(getDays(86400)).toBe(1)
    expect(getDays(172800)).toBe(2)
    expect(getDays(172801)).toBe(2)
  })
})

describe('getHours', () => {
  it('converts seconds to rolling whole hours (0-23)', async () => {
    expect(getHours(3599)).toBe(0)
    expect(getHours(3600)).toBe(1)
    expect(getHours(3601)).toBe(1)
    expect(getHours(7200)).toBe(2)
    expect(getHours(86399)).toBe(23)
    expect(getHours(86400)).toBe(0)
  })
})

describe('getMinutes', () => {
  it('converts seconds to rolling whole minutes (0-59)', async () => {
    expect(getMinutes(59)).toBe(0)
    expect(getMinutes(60)).toBe(1)
    expect(getMinutes(61)).toBe(1)
    expect(getMinutes(120)).toBe(2)
    expect(getMinutes(3599)).toBe(59)
    expect(getMinutes(3600)).toBe(0)
  })
})

describe('getTotalHours', () => {
  it('converts seconds to total whole hours', async () => {
    expect(getTotalHours(3599)).toBe(0)
    expect(getTotalHours(3600)).toBe(1)
    expect(getTotalHours(86400)).toBe(24)
    expect(getTotalHours(86400 + 3600)).toBe(25)
  })
})

describe('hasHours', () => {
  it('return a boolean indicating if the time (in seconds) has hours', async () => {
    expect(hasHours(3599)).toBeFalsy()
    expect(hasHours(3600)).toBeTruthy()
    expect(hasHours(86400)).toBeTruthy()
  })
})

describe('formatHours', () => {
  it('returns a string of the total hours in the given time (in seconds) or empty string if not', async () => {
    expect(formatHours(3599)).toBe('')
    expect(formatHours(3600)).toBe('1h')
    expect(formatHours(86400)).toBe('24h')
  })
})

describe('hasMinutes', () => {
  it('return a boolean indicating if the time (in seconds) has rolling minutes (0-59)', async () => {
    expect(hasMinutes(59)).toBeFalsy()
    expect(hasMinutes(60)).toBeTruthy()
    expect(hasMinutes(3599)).toBeTruthy()
    expect(hasMinutes(3600)).toBeFalsy()
  })
})

describe('formatMinutes', () => {
  it('return a string of the rolling minutes (0-59) in the given time (in seconds) or empty string if not', async () => {
    expect(formatMinutes(59)).toBe('')
    expect(formatMinutes(60)).toBe('1m')
    expect(formatMinutes(3599)).toBe('59m')
    expect(formatMinutes(3600)).toBe('')
  })
})

describe('isMinimalWork', () => {
  it('returns a boolean indicating whether or not work is less than 1 minute', async () => {
    expect(isMinimalWork(59)).toBeTruthy()
    expect(isMinimalWork(60)).toBeFalsy()
  })
})

describe('formatMinimalWork', () => {
  it('returns a default prompt if given time is considered below minimal work otherwise return empty string', async () => {
    expect(formatMinimalWork(59)).toBe(MINIMAL_WORK_DEFAULT_PROMPT)
    expect(formatMinimalWork(60)).toBe('')
  })
})

describe('formatTime', () => {
  it('return the given time in the following format `#h #m`; zero values are omitted and whitespace trimmed', async () => {
    expect(formatTime(59)).toBe('')
    expect(formatTime(60)).toBe('1m')
    expect(formatTime(120)).toBe('2m')
    expect(formatTime(3600)).toBe('1h')
    expect(formatTime(3600 + 60)).toBe('1h 1m')
    expect(formatTime(86399)).toBe('23h 59m')
    expect(formatTime(86400)).toBe('24h')
  })
})
