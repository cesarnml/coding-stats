import { ApiEndpoint, WakaApiRange } from '$lib/constants'
import type { PageServerLoad } from './$types'
import type { SupabaseDuration } from './api/supabase/durations/+server'
import type { SummariesApiResponse } from './api/supabase/summaries/+server'

export const load: PageServerLoad = async ({ fetch, url, locals: { getProfile } }) => {
  const profile = await getProfile()
  const wakaRange = url.searchParams.get('range') ?? WakaApiRange.Last_7_Days_From_Yesterday
  const range = profile?.range ?? wakaRange

  const [summariesResponse, durationsResponse, durationsByLanguageResponse] = await Promise.all([
    fetch(`${ApiEndpoint.SupabaseSummaries}?range=${range}`),
    fetch(ApiEndpoint.SupabaseDurations),
    fetch(ApiEndpoint.SupabaseDurationsByLanguage),
  ])

  const summaries = (await summariesResponse.json()) as SummariesApiResponse
  const durations = (await durationsResponse.json()) as SupabaseDuration
  const durationsByLanguage = (await durationsByLanguageResponse.json()) as SupabaseDuration

  return { summaries, durations, durationsByLanguage }
}
