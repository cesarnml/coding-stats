import dayjs from 'dayjs'
import type { RequestHandler } from './$types'
import { WAKA_API_KEY } from '$env/static/private'
import { json, error } from '@sveltejs/kit'
import { BaseUrl, RestResource, WakaSliceBy } from '$lib/constants'
import type { DurationsResult } from '$src/types/wakatime'
import { DateFormat } from '$lib/helpers/timeHelpers'

export const GET: RequestHandler = async ({ url }) => {
  try {
    const today = dayjs().utc().format(DateFormat.Query)
    const date = url.searchParams.get('date') ?? today
    const slice_by = url.searchParams.get('slice_by') ?? WakaSliceBy.None

    const response = await fetch(
      `${BaseUrl.WakaTime}${RestResource.Durations}?api_key=${WAKA_API_KEY}&date=${date}&slice_by=${slice_by}`,
    )
    if (!response.ok) throw error(response.status, 'WakaTime durations request failed')
    const durationsResult: DurationsResult = await response.json()

    return json(durationsResult)
  } catch (err) {
    throw error(400, 'This is not the way.')
  }
}
