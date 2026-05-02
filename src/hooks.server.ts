// import * as Sentry from '@sentry/sveltekit'
// import { handleErrorWithSentry } from '@sentry/sveltekit'
import {
  // PUBLIC_SENTRY_DSN,
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_URL,
} from '$env/static/public'
import { createServerClient } from '@supabase/ssr'
import { redirect, type Handle, type HandleServerError } from '@sveltejs/kit'
import type { Database } from '$lib/database.types'
import type { Session } from '@supabase/supabase-js'
import type { DataContainer } from '$lib/constants'
import type { SupaProject } from './app'

// if (import.meta.env.PROD) {
//   Sentry.init({
//     dsn: PUBLIC_SENTRY_DSN,
//     tracesSampleRate: 1.0,
//   })
// }

export const handle: Handle = async ({ event, resolve }) => {
  // Create supabase server client
  event.locals.supabase = createServerClient<Database, 'public'>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: '/' })
          })
        },
      },
    },
  )

  event.locals.getSession = async () => {
    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser()

    if (error || !user) return null

    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()

    return session
  }

  event.locals.getProfile = async (session?: Session) => {
    const existingSession = session ?? (await event.locals.getSession())

    if (!existingSession) return null

    const { data: profile } = await event.locals.supabase
      .from('profiles')
      .select('*')
      .eq('id', existingSession.user.id)
      .single()

    return profile
  }

  event.locals.getProjects = async (session?: Session) => {
    const existingSession = session ?? (await event.locals.getSession())

    if (!existingSession) return null

    const { data: projects }: DataContainer<SupaProject[] | null> = await event.locals.supabase
      .from('projects')
      .select('*')

    return projects
  }

  const profile = await event.locals.getProfile()

  if (import.meta.env.DEV) {
    console.log(
      '🚀 Request: ',
      event.url.pathname,
      event.cookies.get('sb-auth-token')?.slice(0, 9) ? '✅' : '⚠️',
      profile?.email ? '👍' : '🛑',
    )
  }

  if (!profile && event.url.pathname === '/account') {
    throw redirect(303, '/login')
  }

  const response = await resolve(event, {
    /**
     * There´s an issue with `filterSerializedResponseHeaders` not working when using `sequence`
     *
     * https://github.com/sveltejs/kit/issues/8061
     */
    filterSerializedResponseHeaders(name: any) {
      return name === 'content-range'
    },
  })

  return response
}

export const handleError: HandleServerError = (input) => {
  // if (import.meta.env.PROD) {
  //   handleErrorWithSentry()
  // }
  if (import.meta.env.DEV) {
    console.error(input.error)
  }
  console.log('input.error:', input.error, input.event)

  return {
    message: 'A client error has occurred. I have spoken.',
  }
}
