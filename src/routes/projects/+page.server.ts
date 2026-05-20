import { ApiEndpoint } from '$lib/constants'
import type { WakaProjectResult } from '$src/types/wakatime'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, url }) => {
  const q = url.searchParams.get('q')?.trim() ?? ''

  const endpoint = q
    ? `${ApiEndpoint.Projects}?q=${encodeURIComponent(q)}`
    : ApiEndpoint.Projects

  const response = await fetch(endpoint)
  const wakaProjects: WakaProjectResult = await response.json()

  return { wakaProjects, q }
}
