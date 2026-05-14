import { writable } from 'svelte/store'

const createLoadingStore = () => {
  const { subscribe, set, update } = writable(false)

  return {
    subscribe,
    on: () => set(true),
    off: () => set(false),
    toggle: () => update((prev) => !prev),
  }
}

export const loading = createLoadingStore()
