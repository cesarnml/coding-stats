import { iterations } from '$src/mocks/testData'
import type { RequestEvent } from './$types'
import { GET } from './+server'

describe('/api/shortcut/iterations', () => {
  it('returns an array of slim iterations', async () => {
    const event = {}
    const response = await GET(event as RequestEvent)
    const result = await response.json()
    expect(response.status).toBe(200)
    expect(result).toEqual(iterations)
  })
})
