import { writable } from 'svelte/store'

const createDropdownStore = () => {
  const { subscribe, set, update } = writable(false)

  return {
    subscribe,
    close: () => set(false),
    open: () => set(true),
    toggle: () => update((prev) => !prev),
  }
}

export const dropdown = createDropdownStore()
