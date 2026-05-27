import { ApiEndpoint, DefaultWakaApiRange } from '$lib/constants'
import { buildSummariesUrl } from '$lib/helpers/buildSummariesUrl'
import type { PageServerLoad } from './$types'
import type { SupabaseDuration } from './api/supabase/durations/+server'
import type { SummariesApiResponse } from './api/supabase/summaries/+server'

export const load: PageServerLoad = async ({ fetch, url, locals: { getProfile } }) => {
  const profile = await getProfile()
  const wakaRange = url.searchParams.get('range') ?? DefaultWakaApiRange
  const range = profile?.range ?? wakaRange
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  const summariesUrl = buildSummariesUrl(range, start, end)

  const [summariesResponse, durationsResponse, durationsByLanguageResponse] = await Promise.all([
    fetch(summariesUrl),
    fetch(ApiEndpoint.SupabaseDurations),
    fetch(ApiEndpoint.SupabaseDurationsByLanguage),
  ])

  const summaries = (await summariesResponse.json()) as SummariesApiResponse
  const durations = (await durationsResponse.json()) as SupabaseDuration
  const durationsByLanguage = (await durationsByLanguageResponse.json()) as SupabaseDuration

  return { summaries, durations, durationsByLanguage }
}
