import { allTimeSinceToday } from '$src/mocks/testData'
import type { RequestEvent } from './$types'
import { GET } from './+server'

describe('/api/wakatime/current/all-time-since-today', () => {
  it('works', async () => {
    const event = {}
    const response = await GET(event as unknown as RequestEvent)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual(allTimeSinceToday)
  })
})
