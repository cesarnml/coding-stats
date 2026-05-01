import type { HandleClientError } from '@sveltejs/kit'
// import * as Sentry from '@sentry/sveltekit'
// import { handleErrorWithSentry } from '@sentry/sveltekit'
import { PUBLIC_SENTRY_DSN } from '$env/static/public'

// if (import.meta.env.PROD) {
//   Sentry.init({
//     dsn: PUBLIC_SENTRY_DSN,
//     tracesSampleRate: 1.0,
//     replaysSessionSampleRate: 1.0,
//     replaysOnErrorSampleRate: 1.0,
//     integrations: [
//       new Sentry.BrowserTracing(),
//       new Sentry.Replay({
//         maskAllInputs: false,
//         maskAllText: false,
//         blockAllMedia: false,
//       }),
//     ],
//   })
// }

export const handleError: HandleClientError = (input) => {
  // Only emit errors in production
  // if (import.meta.env.PROD) {
  //   handleErrorWithSentry()
  // }

  if (import.meta.env.DEV) {
    console.error(input.error)
  }

  return {
    message: 'A client error has occurred. I have spoken.',
  }
}
