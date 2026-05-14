import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { ApiEndpoint, WakaApiRange, type DataContainer } from '$lib/constants'
import type { SummariesResult } from '$src/types/wakatime'
import type { SupaSummary } from '$src/app'

export const GET: RequestHandler = async ({ fetch, locals: { supabase } }) => {
  const response = await fetch(`${ApiEndpoint.Summaries}?&range=${WakaApiRange.Yesterday}`)
  const summariesResult: SummariesResult = await response.json()
  const summaries = summariesResult.data
  const summariesWithDate = summaries.map((summary) => ({ ...summary, date: summary.range.date }))

  const { data: existingSummary }: DataContainer<SupaSummary | null> = await supabase
    .from('summaries')
    .select('*')
    .eq('date', summariesWithDate[0].date)
    .single()

  if (existingSummary) {
    const output = await supabase
      .from('summaries')
      .update(summariesWithDate as unknown as SupaSummary)
      .eq('date', summariesWithDate[0].date)
    return json(output)
  } else {
    const output = await supabase.from('summaries').insert(summariesWithDate as unknown as SupaSummary[])
    return json(output)
  }
}
