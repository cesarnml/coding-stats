import { json, type RequestHandler } from '@sveltejs/kit'

export const POST: RequestHandler = async ({ request, locals: { supabase } }) => {
  const payload = await request.json()

  const { data: profile } = await supabase
    .from('profiles')
    .update({ range: payload.range })
    .eq('id', payload?.id)
    .select('*')
    .single()
  return json(profile)
}
