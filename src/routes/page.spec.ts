import { render, screen } from '@testing-library/svelte'
import { vi } from 'vitest'
import Home from './+page.svelte'
import { summaries, supabaseDuration } from '$src/mocks/testData'
import type { PageData } from './$types'

// Axios uses XHR which MSW node server does not intercept. Mock it here so
// the selectedRange store's reactive axios call doesn't produce unhandled
// rejections. Remove this mock when axios is replaced with fetch (P1.04).
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: summaries })),
  },
}))

describe('Home', () => {
  it('it...', async () => {
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
