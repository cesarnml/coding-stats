import { WAKA_API_KEY } from '$env/static/private'
import { BaseUrl, RestResource } from '$lib/constants'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import type { WakaProjectResult } from '$src/types/wakatime'

export const GET: RequestHandler = async ({ url }) => {
  const q = url.searchParams.get('q')?.trim() ?? ''

  const params = new URLSearchParams({ api_key: WAKA_API_KEY })
  if (q) params.set('q', q)

  const response = await fetch(`${BaseUrl.WakaTime}${RestResource.Projects}?${params}`)
  if (!response.ok) {
    return json(
      { message: `WakaTime projects request failed (${response.status})` },
      { status: response.status },
    )
  }

  const result = (await response.json()) as WakaProjectResult
  return json(result)
}
