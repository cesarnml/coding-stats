import { TEST_ITERATION_ID } from '$src/mocks/handlers'
import { iterationStories } from '$src/mocks/testData'
import type { RequestEvent } from './$types'
import { GET } from './+server'

describe('/api/shortcut/iterations/:id/stories', () => {
  it('returns an array of slim stories for the given iteration', async () => {
    const event = {
      params: {
        iterationId: TEST_ITERATION_ID,
      },
    }

    const response = await GET(event as unknown as RequestEvent)
    const result = await response.json()
    expect(response.status).toBe(200)
    expect(result).toEqual(iterationStories)
  })
})
