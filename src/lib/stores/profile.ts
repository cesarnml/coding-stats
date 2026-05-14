import type { SupaProfile } from '$src/app'
import { writable } from 'svelte/store'

const createProfileStore = () => {
  const { subscribe, set } = writable<SupaProfile | null>(null)

  return {
    subscribe,
    set: (profile: SupaProfile | null) => set(profile),
    clear: () => set(null),
  }
}

export const profile = createProfileStore()
