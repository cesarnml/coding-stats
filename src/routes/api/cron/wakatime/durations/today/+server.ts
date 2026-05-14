import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import dayjs from 'dayjs'
import type { DurationsResult } from '$src/types/wakatime'
import { ApiEndpoint } from '$lib/constants'
import { DateFormat } from '$lib/helpers/timeHelpers'

export const GET: RequestHandler = async ({ fetch, locals: { supabase } }) => {
  const today = dayjs().format(DateFormat.Query)

  const response = await fetch(`${ApiEndpoint.Durations}?date=${today}`)
  const durationsResult: DurationsResult = await response.json()

  const { data: existingDuration } = await supabase
    .from('durations')
    .select('*')
    .eq('date', today)
    .single()

  if (existingDuration) {
    const output = await supabase
      .from('durations')
      .update({ data: durationsResult.data })
      .eq('date', today)
    return json(output)
  } else {
    const output = await supabase
      .from('durations')
      .insert({ data: durationsResult.data, date: today })
    return json(output)
  }
}
