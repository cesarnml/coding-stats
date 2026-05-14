import { ApiEndpoint } from '$lib/constants'
import type { WakaProjectResult } from '$src/types/wakatime'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch }) => {
  const response = await fetch(ApiEndpoint.Projects)
  const wakaProjects: WakaProjectResult = await response.json()

  return { wakaProjects }
}
