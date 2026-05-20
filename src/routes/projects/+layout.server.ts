import { Url } from '$lib/constants'
import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals: { getSession } }) => {
  const session = await getSession()
  if (!session) {
    throw redirect(303, Url.Home)
  }
}
