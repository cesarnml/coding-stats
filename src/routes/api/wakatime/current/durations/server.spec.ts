import { vi } from 'vitest'
import type { RequestEvent } from './$types'
import { GET } from './+server'
import { durations } from '$src/mocks/testData'
import type { HttpError } from '@sveltejs/kit'

describe('/api/wakatime/current/durations', () => {
  it('works', async () => {
    const event = {
      url: {
        searchParams: {
          get: vi.fn(),
        },
      },
    }
    const response = await GET(event as unknown as RequestEvent)
    const result = await response.json()

    expect(event.url.searchParams.get).toHaveBeenCalledTimes(2)
    expect(response.status).toBe(200)
    expect(result).toEqual(durations)
  })

  it('errors', async () => {
    const event = {
      url: {
        searchParams: {
          get: vi.fn(() => {
            throw new Error('boom')
          }),
        },
      },
    }

    try {
      await GET(event as unknown as RequestEvent)
    } catch (error) {
      expect((error as HttpError).status).toEqual(400)
      expect((error as HttpError).body.message).toEqual('This is not the way.')
    }
  })
})
