import { DateFormat } from '$lib/helpers/timeHelpers'
import type { DurationsResult } from '$src/types/wakatime'
import { error, json, type RequestHandler } from '@sveltejs/kit'
import dayjs from 'dayjs'

export type SupabaseDuration = {
  id: string
  created_at: string
  updated_at: string
  data: DurationsResult['data']
  date: string
}

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const today = dayjs().utc().format(DateFormat.Query)
  const date = url.searchParams.get('date') ?? today
  try {
    const { data: durations } = await supabase
      .from('durations_by_language')
      .select('*')
      .eq('date', date)
      .single()
    if (durations) {
      return json(durations as SupabaseDuration)
    }
    return json({ data: [] })
  } catch (err) {
    throw error(400, 'This is not the way.')
  }
}
