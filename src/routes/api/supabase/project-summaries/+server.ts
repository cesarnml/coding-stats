import { DefaultWakaApiRange } from '$lib/constants'
import { resolveSummariesDateRange } from '$lib/helpers/resolveSummariesDateRange'
import type { SummariesResult } from '$src/types/wakatime'
import { json, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  const project = url.searchParams.get('project') ?? ''
  const range = url.searchParams.get('range') ?? DefaultWakaApiRange

  const { rangeStart, rangeEnd } = resolveSummariesDateRange(range, start, end)

  const { data: projectRecord } = await supabase
    .from('projects')
    .select('*')
    .eq('name', project)
    .single()

  if (projectRecord) {
    const { data: summariesData } = await supabase
      .from('project_summaries')
      .select('*')
      .eq('project_id', projectRecord.id)
      .gte('date', rangeStart)
      .lte('date', rangeEnd)
      .order('date', { ascending: true })

    const summaries = {
      data: summariesData,
    } as unknown as SummariesResult

    return json(summaries)
  }
  return json({ message: 'Project summaries not found' }, { status: 404 })
}
