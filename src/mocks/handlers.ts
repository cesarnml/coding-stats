// src/mocks/handlers.ts
import { ApiEndpoint, BaseUrl, RestResource } from '$lib/constants'
import { http, HttpResponse } from 'msw'
import {
  allTimeSinceToday,
  durations,
  iterationStories,
  iterations,
  projects,
  summaries,
  vercelAliases,
  vercelProjects,
} from './testData'

const SUPABASE_URL_PATTERN = /supabase\.co|localhost:54321/

export const TEST_ITERATION_ID = 15

// Define handlers that catch the corresponding requests and return the mock data.
export const handlers = [
  http.get(ApiEndpoint.Summaries, () => HttpResponse.json(summaries)),
  http.get(ApiEndpoint.Durations, () => HttpResponse.json(durations)),
  http.get(ApiEndpoint.Projects, ({ request }) => {
    const q = new URL(request.url).searchParams.get('q')?.trim().toLowerCase()
    if (!q) return HttpResponse.json(projects)

    return HttpResponse.json({
      ...projects,
      data: projects.data.filter(({ name }) => name.toLowerCase().includes(q)),
    })
  }),
  http.get(`${BaseUrl.WakaTime}${RestResource.Summaries}`, () => HttpResponse.json(summaries)),
  http.get(`${BaseUrl.WakaTime}${RestResource.Durations}`, () => HttpResponse.json(durations)),
  http.get(`${BaseUrl.WakaTime}${RestResource.Projects}`, ({ request }) => {
    const q = new URL(request.url).searchParams.get('q')?.trim().toLowerCase()
    if (!q) return HttpResponse.json(projects)

    return HttpResponse.json({
      ...projects,
      data: projects.data.filter(({ name }) => name.toLowerCase().includes(q)),
    })
  }),
  http.get(`${BaseUrl.Shortcut}${RestResource.Iterations}`, () => HttpResponse.json(iterations)),
  http.get(`${BaseUrl.Shortcut}${RestResource.IterationStories(TEST_ITERATION_ID)}`, () =>
    HttpResponse.json(iterationStories),
  ),
  http.get(`${BaseUrl.Vercel}${RestResource.Aliases}`, () => HttpResponse.json(vercelAliases)),
  http.get(`${BaseUrl.Vercel}${RestResource.VercelProjects}`, () =>
    HttpResponse.json(vercelProjects),
  ),
  http.get(`${BaseUrl.WakaTime}${RestResource.AllTime}`, () =>
    HttpResponse.json(allTimeSinceToday),
  ),
  http.get(ApiEndpoint.SupabaseProfiles, () => HttpResponse.json(null)),
  http.post(ApiEndpoint.SupabaseProfiles, () => HttpResponse.json(null)),
  http.get(ApiEndpoint.SupabaseSummaries, () => HttpResponse.json(summaries)),
]
