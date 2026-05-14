import { WAKA_API_KEY } from '$env/static/private'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import type { WakaProjectResult } from '$src/types/wakatime'
import { BaseUrl, RestResource } from '$lib/constants'

const DEFAULT_PAGE = 1
export const GET: RequestHandler = async ({ url }) => {
  const q = url.searchParams.get('q') ?? ''
  const page = url.searchParams.get('page') ?? DEFAULT_PAGE

  const result: WakaProjectResult = await fetch(
    `${BaseUrl.WakaTime}${RestResource.Projects}?api_key=${WAKA_API_KEY}&page=${page}&q=${q}`,
  ).then((response) => response.json())

  return json(result)
}
