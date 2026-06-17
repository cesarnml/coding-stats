import { ApiEndpoint } from '$lib/constants'

export function buildSummariesUrl(
  range: string,
  start: string | null,
  end: string | null,
  project?: string,
): string {
  const endpoint = project ? ApiEndpoint.SupabaseProjectSummaries : ApiEndpoint.SupabaseSummaries

  if (range === 'Custom' && start && end) {
    const params = new URLSearchParams({ start, end })
    if (project) params.set('project', project)
    return `${endpoint}?${params}`
  }

  const params = new URLSearchParams({ range })
  if (project) params.set('project', project)
  return `${endpoint}?${params}`
}
