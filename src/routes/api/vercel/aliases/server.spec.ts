import { vi } from 'vitest'
import { GET } from './+server'
import type { RequestEvent } from './$types'
import { vercelAliases } from '$src/mocks/testData'

describe('/api/vercel/aliases', () => {
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

    expect(event.url.searchParams.get).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
    expect(result).toEqual(vercelAliases)
  })
})
