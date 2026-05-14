import { ApiEndpoint } from '$lib/constants'
import type { StorySlim } from '$lib/generated/openapi/shortcut'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch, params }) => {
  const response = await fetch(ApiEndpoint.IterationStories(params.iterationId))
  const stories: StorySlim[] = await response.json()

  return { stories }
}
