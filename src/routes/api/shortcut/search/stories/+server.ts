import { SHORTCUT_API_TOKEN } from '$env/static/private'
import { BaseUrl, RestResource } from '$lib/constants'
import type { StorySearchResults } from '$lib/generated/openapi/shortcut'
import { json, type RequestHandler } from '@sveltejs/kit'

const PAGE_SIZE = 25
const Detail = {
  Full: 'full',
  Slim: 'slim',
} as const

export const GET: RequestHandler = async ({ fetch, url }) => {
  const query = url.searchParams.get('query')

  const response = await fetch(
    `${BaseUrl.Shortcut}${RestResource.Stories}?page_size=${PAGE_SIZE}&detail=${Detail.Full}&query=${query}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Shortcut-Token': SHORTCUT_API_TOKEN,
      },
    },
  )
  const storySearchResults: StorySearchResults = await response.json()
  return json(storySearchResults)
}
