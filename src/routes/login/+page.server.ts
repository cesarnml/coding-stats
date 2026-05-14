import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { Url } from '$lib/constants'

export const load: PageServerLoad = async ({ locals: { getSession } }) => {
  const session = await getSession()

  if (session) {
    throw redirect(303, Url.Account)
  }
}
