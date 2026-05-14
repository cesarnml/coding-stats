import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { ApiEndpoint, WakaApiRange, type DataContainer } from '$lib/constants'
import type { SummariesResult } from '$src/types/wakatime'
import dayjs from 'dayjs'
import { DateFormat } from '$lib/helpers/timeHelpers'
import type { SupaProject, SupaProjectSummary } from '$src/app'

export const GET: RequestHandler = async ({ fetch, locals: { supabase } }) => {
  const yesterday = dayjs().utc().subtract(1, 'd').format(DateFormat.Query)

  const { data: projects }: DataContainer<SupaProject[] | null> = await supabase
    .from('projects')
    .select('*')
    .eq('is_tracked', true)

  if (projects) {
    const projectSummariesRequests = projects.map((project) => {
      return fetch(
        `${ApiEndpoint.Summaries}?range=${WakaApiRange.Yesterday}&project=${project.name}`,
      )
    })

    const responses = await Promise.all(projectSummariesRequests)
    const projectSummariesResults: SummariesResult[] = await Promise.all(
      responses.map((response) => response.json()),
    )

    const projectSummariesResultsWithDate = projectSummariesResults.map(
      (projectSummaryResult, index) => {
        projectSummaryResult.data = projectSummaryResult.data.map((summary) => ({
          ...summary,
          date: summary.range.date,
          project_id: projects[index].id,
        }))
        return projectSummaryResult
      },
    )

    const createOrUpdateRequests = []

    for (const [idx, project] of projects.entries()) {
      const { data: existingProjectSummary }: DataContainer<SupaProjectSummary | null> =
        await supabase
          .from('project_summaries')
          .select('*')
          .eq('project_id', project.id)
          .eq('date', yesterday)
          .single()

      if (existingProjectSummary) {
        createOrUpdateRequests.push(
          supabase
            .from('project_summaries')
            .update(projectSummariesResultsWithDate[idx].data as unknown as SupaProjectSummary)
            .eq('id', existingProjectSummary.id),
        )
      } else {
        createOrUpdateRequests.push(
          supabase
            .from('project_summaries')
            .insert(projectSummariesResultsWithDate[idx].data as unknown as SupaProjectSummary),
        )
      }
    }

    const output = await Promise.all(createOrUpdateRequests)

    return json(output)
  }
  return json({ message: 'No projects found' })
}
