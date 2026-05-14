import { VERCEL_API_TOKEN } from '$env/static/private'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import type { ProjectsResult } from '$src/types/vercel'
import { BaseUrl, RestResource } from '$lib/constants'

export const GET: RequestHandler = async () => {
  const headers = {
    Authorization: `Bearer ${VERCEL_API_TOKEN}`,
    'Content-Type': 'application/json',
  }
  const response = await fetch(`${BaseUrl.Vercel}${RestResource.VercelProjects}`, { headers })
  const projectResult: ProjectsResult = await response.json()
  return json(projectResult)
}
