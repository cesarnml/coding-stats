import { DefaultWakaApiRange } from '$lib/constants'
import { resolveSummariesDateRange } from '$lib/helpers/resolveSummariesDateRange'
import type { SummariesResult } from '$src/types/wakatime'
import { json, type RequestHandler } from '@sveltejs/kit'

export type SummariesApiResponse = SummariesResult & { max_date: string | null }

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  const range = url.searchParams.get('range') ?? DefaultWakaApiRange

  const { rangeStart, rangeEnd } = resolveSummariesDateRange(range, start, end)

  const [summariesRes, maxDateRes] = await Promise.all([
    supabase
      .from('summaries')
      .select('*')
      .gte('date', rangeStart)
      .lte('date', rangeEnd)
      .order('date', { ascending: true }),
    supabase.from('summaries').select('date').order('date', { ascending: false }).limit(1),
  ])

  if (summariesRes.error || maxDateRes.error) {
    return json(
      {
        error: 'Failed to fetch summaries',
        details: summariesRes.error?.message ?? maxDateRes.error?.message,
      },
      { status: 500 },
    )
  }

  const summaries = {
    data: summariesRes.data,
    max_date: maxDateRes.data?.[0]?.date ?? null,
  } as unknown as SummariesApiResponse

  return json(summaries)
}
