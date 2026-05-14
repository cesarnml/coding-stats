import { writable } from 'svelte/store'

export const customDateRange = writable<{ start: string | null; end: string | null }>({
  start: null,
  end: null,
})
