import { vi } from 'vitest'
import type { RequestEvent } from './$types'
import { GET } from './+server'

describe('GET', () => {
  it('describes /api/wakatime/current/summaries (getSummaries)', async () => {
    const event = {
      url: {
        searchParams: {
          get: vi.fn((query: string) => {
            switch (query) {
              case 'start':
                return '2021-01-01'
              case 'end':
                return '2021-01-31'
              default:
                return ''
            }
          }),
        },
      },
    }
    const response = await GET(event as unknown as RequestEvent)
    expect(event.url.searchParams.get).toHaveBeenCalledTimes(4)
    // ? Do these tests add value? ... leaning toward no.
    expect(event.url.searchParams.get('start')).toEqual('2021-01-01')
    expect(event.url.searchParams.get('end')).toEqual('2021-01-31')

    expect(response.status).toBe(200)
  })
})
