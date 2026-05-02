import { WAKA_API_KEY } from '$env/static/private'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { BaseUrl, RestResource } from '$lib/constants'
import type { AllTimeSinceTodayData } from '$src/types/wakatime'

export const GET: RequestHandler = async () => {
  const data: AllTimeSinceTodayData = await fetch(
    `${BaseUrl.WakaTime}${RestResource.AllTime}?api_key=${WAKA_API_KEY}`,
  ).then((response) => response.json())

  return json(data)
}
