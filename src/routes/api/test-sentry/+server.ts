import { json, type RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = () => {
  throw new Error('Sentry sourcemap readability test — safe to delete after validation')
  return json({ ok: true })
}
