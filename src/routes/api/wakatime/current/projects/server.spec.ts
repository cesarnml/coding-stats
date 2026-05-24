import { vi } from 'vitest'
import { GET } from './+server'
import type { RequestEvent } from './$types'
import { BaseUrl, RestResource } from '$lib/constants'
import { projects } from '$src/mocks/testData'

describe('GET /api/wakatime/current/projects', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(projects),
    })
  })

  const requestEvent = (q: string | null) =>
    ({
      url: {
        searchParams: {
          get: vi.fn((key: string) => (key === 'q' ? q : null)),
        },
      },
    }) as unknown as RequestEvent

  const wakaUrl = () => new URL(String(vi.mocked(global.fetch).mock.calls[0][0]))

  it('loads all projects when q is omitted', async () => {
    const response = await GET(requestEvent(null))
    expect(response.status).toEqual(200)
    expect(wakaUrl().searchParams.has('q')).toBe(false)
    await expect(response.json()).resolves.toEqual(projects)
  })

  it('forwards q to WakaTime', async () => {
    await GET(requestEvent('foo bar'))
    expect(wakaUrl().pathname).toBe(`${RestResource.Projects}`)
    expect(wakaUrl().origin + wakaUrl().pathname).toBe(
      `${BaseUrl.WakaTime}${RestResource.Projects}`,
    )
    expect(wakaUrl().searchParams.get('q')).toBe('foo bar')
    expect(wakaUrl().searchParams.get('api_key')).toBeTruthy()
  })

  it('ignores blank q', async () => {
    await GET(requestEvent('   '))
    expect(wakaUrl().searchParams.has('q')).toBe(false)
  })
})
