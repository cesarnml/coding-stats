import { get } from 'svelte/store'
import { describe, it, expect, beforeEach } from 'vitest'
import { customDateRange } from './customDateRange'

describe('customDateRange store', () => {
  beforeEach(() => {
    customDateRange.set({ start: null, end: null })
  })

  it('has initial state { start: null, end: null }', () => {
    expect(get(customDateRange)).toEqual({ start: null, end: null })
  })

  it('updates start date', () => {
    customDateRange.set({ start: '2024-01-01', end: null })
    expect(get(customDateRange)).toEqual({ start: '2024-01-01', end: null })
  })

  it('updates end date', () => {
    customDateRange.set({ start: null, end: '2024-01-31' })
    expect(get(customDateRange)).toEqual({ start: null, end: '2024-01-31' })
  })

  it('updates both start and end', () => {
    customDateRange.set({ start: '2024-01-01', end: '2024-01-31' })
    expect(get(customDateRange)).toEqual({ start: '2024-01-01', end: '2024-01-31' })
  })
})
