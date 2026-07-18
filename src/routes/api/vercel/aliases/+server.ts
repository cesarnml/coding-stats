import { VERCEL_API_TOKEN } from '$env/static/private'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import type { AliasesResult } from '$src/types/vercel'
import { BaseUrl, RestResource } from '$lib/constants'
import { fetchWithRetry } from '$lib/server/fetchWithRetry'

export const GET: RequestHandler = async ({ url, fetch }) => {
  const projectId = url.searchParams.get('projectId')

  const headers = {
    Authorization: `Bearer ${VERCEL_API_TOKEN}`,
    'Content-Type': 'application/json',
  }

  const response = await fetchWithRetry(
    fetch,
    `${BaseUrl.Vercel}${RestResource.Aliases}?projectId=${projectId}&limit=100`,
    { headers },
  )
  const aliasesResult: AliasesResult = await response.json()

  return json(aliasesResult)
}
