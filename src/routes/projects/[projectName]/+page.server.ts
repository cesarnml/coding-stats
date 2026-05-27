import { ApiEndpoint, DefaultWakaApiRange, WakaToShortcutApiRange } from '$lib/constants'
import { buildSummariesUrl } from '$lib/helpers/buildSummariesUrl'
import type { AliasesResult, ProjectsResult } from '$src/types/vercel'
import type { SummariesResult } from '$src/types/wakatime'
import dayjs from 'dayjs'
import type { PageServerLoad } from './$types'
import { DateFormat } from '$lib/helpers/timeHelpers'
import type { StorySearchResults } from '$lib/generated/openapi/shortcut'

export const load: PageServerLoad = async ({ fetch, params, url, locals: { getProfile } }) => {
  const range = url.searchParams.get('range') ?? DefaultWakaApiRange
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  const profile = await getProfile()
  const wakaRange = profile?.range ?? range
  const shortcutRange = WakaToShortcutApiRange[wakaRange as keyof typeof WakaToShortcutApiRange]
  const summariesUrl = buildSummariesUrl(wakaRange, start, end, params.projectName)

  const responses = await Promise.all([
    fetch(summariesUrl),
    fetch(ApiEndpoint.VercelProjects),
    fetch(
      `${ApiEndpoint.SearchStories}?query=has:branch moved:${dayjs()
        .subtract(shortcutRange, 'd')
        .format(DateFormat.Query)}..*`,
    ),
  ])

  const [summaries, projects, stories] = (await Promise.all(responses.map((r) => r.json()))) as [
    SummariesResult,
    ProjectsResult,
    StorySearchResults,
  ]
  const currentProject = projects.projects?.find(
    (project) => project.link.repo === params.projectName,
  )

  const projectId = currentProject?.id ?? ''
  const projectName = currentProject?.name ?? ''

  const response = await fetch(`${ApiEndpoint.Aliases}?projectId=${projectId}`)
  const aliases = (await response.json()) as AliasesResult

  return { summaries, projectName, stories, lazy: { aliases } }
}
