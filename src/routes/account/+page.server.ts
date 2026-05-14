import { fail, redirect, type Actions } from '@sveltejs/kit'
import { Url } from '$lib/constants'

export const actions: Actions = {
  update: async ({ request, locals: { supabase, getSession } }) => {
    const formData = await request.formData()
    const name = formData.get('name') as string

    const session = await getSession()
    if (!session) {
      throw redirect(303, Url.Home)
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        name: name,
      })
      .eq('id', session.user.id)

    if (error) {
      return fail(500, {
        name,
      })
    }

    return {
      name,
    }
  },
  signout: async ({ locals: { supabase, getSession } }) => {
    const session = await getSession()
    if (session) {
      await supabase.auth.signOut()
      throw redirect(303, Url.Home)
    }
  },
}
