import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import dayjs from 'dayjs'
import type { DurationsResult } from '$src/types/wakatime'
import { ApiEndpoint } from '$lib/constants'
import { DateFormat } from '$lib/helpers/timeHelpers'
import { supabaseService as supabase } from '$lib/supabase/serviceClient'

export const GET: RequestHandler = async ({ fetch }) => {
  const yesterday = dayjs().utc().subtract(1, 'day').format(DateFormat.Query)

  const response = await fetch(`${ApiEndpoint.Durations}?date=${yesterday}`)
  const durationsResult: DurationsResult = await response.json()

  const { data: existingDuration } = await supabase
    .from('durations')
    .select('*')
    .eq('date', yesterday)
    .single()

  if (existingDuration) {
    const output = await supabase
      .from('durations')
      .update({ data: durationsResult.data })
      .eq('date', yesterday)
    return json(output)
  } else {
    const output = await supabase
      .from('durations')
      .insert({ data: durationsResult.data, date: yesterday })
    return json(output)
  }
}
