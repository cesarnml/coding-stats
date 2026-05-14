import type { Session } from '@supabase/supabase-js'
import { writable } from 'svelte/store'

const createProfileStore = () => {
  const { subscribe, set } = writable<Session | null>(null)

  return {
    subscribe,
    set: (session: Session | null) => set(session),
    clear: () => set(null),
  }
}

export const session = createProfileStore()
