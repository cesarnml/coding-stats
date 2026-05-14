import { ApiEndpoint } from '$lib/constants'
import type { IterationSlim } from '$lib/generated/openapi/shortcut'
import type { PageServerLoad } from './$types'
import orderBy from 'lodash/orderBy'
import zipObject from 'lodash/zipObject'

type IterationSlimSnakeCase = Omit<IterationSlim, 'startDate' | 'endDate' | 'stats'> & {
  start_date: string
  end_date: string
  stats: {
    average_cycle_time: number
    average_lead_time: number
    num_points: number
    num_points_backlog: number
    num_points_done: number
    num_points_started: number
    num_points_unstarted: number
    num_related_documents: number
    num_stories_backlog: number
    num_stories_done: number
    num_stories_started: number
    num_stories_unestimated: number
    num_stories_unstarted: number
  }
}

export const load: PageServerLoad = async ({ fetch }) => {
  const response = await fetch(ApiEndpoint.Iterations)
  const iterations: IterationSlimSnakeCase[] = await response.json()
  const iterationsOrdered = orderBy(iterations, 'end_date', 'desc')

  const iterationStoriesRequests = iterationsOrdered.map((iteration) =>
    fetch(ApiEndpoint.IterationStories(iteration.id)),
  )

  const iterationStoriesResponses = await Promise.all(iterationStoriesRequests)

  const iterationStories = iterationStoriesResponses.map(async (response) => await response.json())

  const iterationStoriesDict = zipObject(
    iterationsOrdered.map((iteration) => iteration.id),
    iterationStories,
  )
  return { iterations: iterationsOrdered, lazy: { iterationStoriesDict } }
}
