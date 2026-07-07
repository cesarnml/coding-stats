import { error, json, type RequestHandler } from '@sveltejs/kit'

export const POST: RequestHandler = async ({ request, locals: { supabase, getSession } }) => {
  const session = await getSession()
  if (!session) throw error(401, 'Unauthorized')

  const payload = await request.json()

  const { data: profile } = await supabase
    .from('profiles')
    .update({ range: payload.range })
    .eq('id', session.user.id)
    .select('*')
    .single()
  return json(profile)
}
