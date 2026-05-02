import { vi } from 'vitest'
import { GET } from './+server'
import type { RequestEvent } from './$types'
import { projects } from '$src/mocks/testData'

describe('GET /api/wakatime/current/projects', () => {
  it('works', async () => {
    const event = {
      url: {
        searchParams: {
          get: vi.fn(),
        },
      },
    }

    expect(event.url.searchParams.get).not.toHaveBeenCalled()
    const response = await GET(event as unknown as RequestEvent)
    expect(event.url.searchParams.get).toHaveBeenCalledTimes(2)
    expect(response.status).toEqual(200)
    const result = await response.json()
    expect(result).toEqual(projects)
  })
})
