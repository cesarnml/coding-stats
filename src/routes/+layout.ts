import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import {
  createBrowserClient,
  isBrowser,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr'
import type { LayoutLoad } from './$types'
import type { Database } from '$lib/database.types'

export const load: LayoutLoad = async ({ fetch, data, depends, url }) => {
  depends('supabase:auth')

  const supabase = createBrowserClient<Database, 'public'>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch,
      },
      cookies: {
        getAll() {
          if (!isBrowser()) {
            return []
          }
          return parseCookieHeader(document.cookie).map(({ name, value }) => ({
            name,
            value: value ?? '',
          }))
        },
        setAll(cookiesToSet) {
          if (!isBrowser()) {
            return
          }
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = serializeCookieHeader(name, value, options)
          })
        },
      },
    },
  )

  const session = isBrowser() ? (await supabase.auth.getSession()).data.session : data.session

  const { data: profile } = session?.user.id
    ? await supabase.from('profiles').select('*').eq('id', session.user.id).single()
    : { data: data.profile }

  const { data: projects } = isBrowser()
    ? await supabase.from('projects').select('*')
    : { data: data.projects }

  return { supabase, session, profile, projects, pathname: url.pathname }
}
