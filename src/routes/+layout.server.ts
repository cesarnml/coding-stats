import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({
  locals: { getSession, getProfile, getProjects },
}) => {
  const [session, profile, projects] = await Promise.all([
    getSession(),
    getProfile(),
    getProjects(),
  ])

  return {
    session,
    profile,
    projects,
  }
}
