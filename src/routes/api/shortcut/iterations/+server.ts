import { SHORTCUT_API_TOKEN } from '$env/static/private'
import { BaseUrl, RestResource } from '$lib/constants'
import type { IterationSlim } from '$lib/generated/openapi/shortcut'
import { json, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
  const headers = {
    'Shortcut-Token': SHORTCUT_API_TOKEN,
  }
  const iterations: IterationSlim[] = await fetch(`${BaseUrl.Shortcut}${RestResource.Iterations}`, {
    headers,
  }).then((response) => response.json())

  return json(iterations)
}
