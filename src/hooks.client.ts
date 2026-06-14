import * as Sentry from '@sentry/sveltekit'
import type { HandleClientError } from '@sveltejs/kit'
import { PUBLIC_SENTRY_DSN } from '$env/static/public'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
  })

  // Register the service worker ourselves (kit.serviceWorker.register is false)
  // so a transient registration failure (e.g. a stale/404 worker file
  // mid-deploy) is caught and reported as a handled warning instead of an
  // unhandled "Rejected" promise rejection.
  if ('serviceWorker' in navigator) {
    addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js', { type: 'module' }).catch((error) => {
        Sentry.captureException(error, { level: 'warning', tags: { source: 'serviceWorker' } })
      })
    })
  }
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
