import * as Sentry from '@sentry/sveltekit'
import type { HandleClientError } from '@sveltejs/kit'
import { PUBLIC_SENTRY_DSN } from '$env/static/public'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
  })
}

const baseHandleError: HandleClientError = (input) => {
  if (import.meta.env.DEV) {
    console.error(input.error)
  }

  return {
    message: 'A client error has occurred. I have spoken.',
  }
}

export const handleError: HandleClientError = import.meta.env.PROD
  ? Sentry.handleErrorWithSentry(baseHandleError)
  : baseHandleError
