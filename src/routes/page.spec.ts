import { render, screen } from '@testing-library/svelte'
import { afterEach, vi } from 'vitest'
import Home from './+page.svelte'
import { summaries, supabaseDuration } from '$src/mocks/testData'
import type { PageData } from './$types'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Home', () => {
  it('it...', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve(summaries),
        }),
      ),
    )

    const data = {
      summaries,
      durations: supabaseDuration,
      durationsByLanguage: supabaseDuration,
    } as unknown as PageData

    render(Home, {
      data,
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getAllByText(/total hours/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/top project/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/activity/i).length).toBeGreaterThan(0)
  })
})
