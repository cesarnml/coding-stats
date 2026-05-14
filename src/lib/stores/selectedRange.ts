import { writable } from 'svelte/store'
import type { WakaApiRange, ValueOf, WakaApiRangePrompt } from '$lib/constants'

const createSelectedRangeStore = () => {
  const { subscribe, set } = writable<ValueOf<WakaApiRange> | WakaApiRangePrompt>()

  return {
    subscribe,
    set: (date: ValueOf<WakaApiRange>) => set(date),
  }
}

export const selectedRange = createSelectedRangeStore()
