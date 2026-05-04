import { WakaApiRange, WakaToShortcutApiRange } from '$lib/constants'
import { DateFormat } from '$lib/helpers/timeHelpers'
import type { SummariesResult } from '$src/types/wakatime'
import { json, type RequestHandler } from '@sveltejs/kit'
import dayjs from 'dayjs'

export type SummariesApiResponse = SummariesResult & { max_date: string | null }

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const start = url.searchParams.get('start') ?? ''
  const end = url.searchParams.get('end') ?? ''
  let range = url.searchParams.get('range') ?? WakaApiRange.Last_7_Days_From_Yesterday

  // start and end take precedence over range
  if (start && end) {
    range = ''
  }

  const rangeStart = dayjs()
    .utc()
    .subtract(WakaToShortcutApiRange[range as keyof typeof WakaToShortcutApiRange], 'd')
    .format(DateFormat.Query)
  const rangeEnd =
    range === WakaApiRange.Yesterday || range === WakaApiRange.Last_7_Days_From_Yesterday
      ? dayjs().utc().subtract(1, 'd').format(DateFormat.Query)
      : dayjs().utc().format(DateFormat.Query)

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
