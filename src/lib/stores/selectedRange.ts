import { writable } from 'svelte/store'
import {
  DefaultWakaApiRange,
  type WakaApiRange,
  type ValueOf,
  type WakaApiRangePrompt,
} from '$lib/constants'

const createSelectedRangeStore = () => {
  const { subscribe, set } = writable<ValueOf<WakaApiRange> | WakaApiRangePrompt>(
    DefaultWakaApiRange,
  )

  return {
    subscribe,
    set: (date: ValueOf<WakaApiRange>) => set(date),
  }
}

export const selectedRange = createSelectedRangeStore()
