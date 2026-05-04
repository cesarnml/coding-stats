import { WakaApiRange, WakaToShortcutApiRange } from '$lib/constants'
import { DateFormat } from '$lib/helpers/timeHelpers'
import type { SummariesResult } from '$src/types/wakatime'
import { json, type RequestHandler } from '@sveltejs/kit'
import dayjs from 'dayjs'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const start = url.searchParams.get('start') ?? ''
  const end = url.searchParams.get('end') ?? ''
  const range = url.searchParams.get('range') ?? WakaApiRange.Last_7_Days_From_Yesterday

  const hasCustomRange = Boolean(start && end)
  const rangeStart = hasCustomRange
    ? start
    : dayjs()
        .utc()
        .subtract(WakaToShortcutApiRange[range as keyof typeof WakaToShortcutApiRange], 'd')
        .format(DateFormat.Query)
  const rangeEnd = hasCustomRange
    ? end
    : range === WakaApiRange.Yesterday || range === WakaApiRange.Last_7_Days_From_Yesterday
      ? dayjs().utc().subtract(1, 'd').format(DateFormat.Query)
      : dayjs().utc().format(DateFormat.Query)

  const [{ data: summariesData }, { data: maxDateData }] = await Promise.all([
    supabase
      .from('summaries')
      .select('*')
      .gte('date', rangeStart)
      .lte('date', rangeEnd)
      .order('date', { ascending: true }),
    supabase.from('summaries').select('date').order('date', { ascending: false }).limit(1),
  ])

  const summaries = {
    data: summariesData,
    max_date: maxDateData?.[0]?.date ?? null,
  } as unknown as SummariesResult & { max_date: string | null }

  return json(summaries)
}
