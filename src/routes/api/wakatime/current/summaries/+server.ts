import { WAKA_API_KEY } from '$env/static/private'
import { BaseUrl, RestResource, WakaApiRange } from '$lib/constants'
import type { SummariesResult } from '$src/types/wakatime'
import { json, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url }) => {
  const start = url.searchParams.get('start') ?? ''
  const end = url.searchParams.get('end') ?? ''
  const project = url.searchParams.get('project') ?? ''
  let range = url.searchParams.get('range') ?? WakaApiRange.Last_7_Days_From_Yesterday

  // start and end take precedence over range
  if (start && end) {
    range = ''
  }

  const summaries: SummariesResult = await fetch(
    `${BaseUrl.WakaTime}${RestResource.Summaries}?api_key=${WAKA_API_KEY}&range=${range}&project=${project}&start=${start}&end=${end}`,
  ).then((response) => response.json())

  return json(summaries)
}
