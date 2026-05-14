import type { SupaProject } from '$src/app'
import { writable } from 'svelte/store'

const createProjectStore = () => {
  const { subscribe, set, update } = writable<SupaProject[] | null>(null)

  return {
    subscribe,
    set: (projects: SupaProject[] | null) => set(projects),
    add: (project: SupaProject) => update((prev) => [...(prev ?? []), project]),
    update: (project: SupaProject) =>
      update((prev) => (prev ?? []).map((p) => (p.name === project.name ? project : p))),
    clear: () => set(null),
  }
}

export const project = createProjectStore()
