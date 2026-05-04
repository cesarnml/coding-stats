import { describe, it, expect } from 'vitest'
import { buildSummariesUrl } from './buildSummariesUrl'
import { ApiEndpoint, WakaApiRange } from '$lib/constants'

describe('buildSummariesUrl', () => {
  it('uses range param for named ranges', () => {
    const url = buildSummariesUrl(WakaApiRange.Last_7_Days, null, null)
    expect(url).toBe(`${ApiEndpoint.SupabaseSummaries}?range=Last+7+Days`)
  })

  it('uses start and end params for Custom range when both are set', () => {
    const url = buildSummariesUrl('Custom', '2024-01-01', '2024-01-31')
    expect(url).toBe(`${ApiEndpoint.SupabaseSummaries}?start=2024-01-01&end=2024-01-31`)
  })

  it('falls back to range param when Custom is selected but dates are null', () => {
    const url = buildSummariesUrl('Custom', null, null)
    expect(url).toBe(`${ApiEndpoint.SupabaseSummaries}?range=Custom`)
  })

  it('falls back to range param when Custom is selected but start is null', () => {
    const url = buildSummariesUrl('Custom', null, '2024-01-31')
    expect(url).toBe(`${ApiEndpoint.SupabaseSummaries}?range=Custom`)
  })

  it('falls back to range param when Custom is selected but end is null', () => {
    const url = buildSummariesUrl('Custom', '2024-01-01', null)
    expect(url).toBe(`${ApiEndpoint.SupabaseSummaries}?range=Custom`)
  })
})
