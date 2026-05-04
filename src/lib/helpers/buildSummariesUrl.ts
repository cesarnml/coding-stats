import { ApiEndpoint } from '$lib/constants'

export function buildSummariesUrl(
  range: string,
  start: string | null,
  end: string | null,
): string {
  if (range === 'Custom' && start && end) {
    return `${ApiEndpoint.SupabaseSummaries}?start=${start}&end=${end}`
  }
  const params = new URLSearchParams({ range })
  return `${ApiEndpoint.SupabaseSummaries}?${params}`
}
