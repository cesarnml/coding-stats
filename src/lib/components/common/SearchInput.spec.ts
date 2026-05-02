import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import SearchInput from './SearchInput.svelte'
import { vi } from 'vitest'
import { projects } from '$src/mocks/testData'
import { ApiEndpoint } from '$lib/constants'

describe('SearchInput', () => {
  const user = userEvent.setup()

  it('renders', async () => {
    // Use a deferred fetch so the loading indicator is visible before results arrive.
    let resolveFetch!: (value: unknown) => void
    const fetchPromise = new Promise((resolve) => { resolveFetch = resolve })

    global.fetch = vi.fn().mockReturnValue(
      fetchPromise.then(() => ({ json: () => Promise.resolve(projects) }))
    )

    render(SearchInput)

    const searchInput = screen.getByRole('textbox')
    expect(searchInput).toHaveAttribute('placeholder', 'Search')
    expect(global.fetch).not.toHaveBeenCalled()
    expect(screen.queryByRole('button')).toBeNull()

    await user.type(searchInput, 'Cesar')

    const loadingIndicator = await screen.findByRole('button')
    expect(loadingIndicator).toBeInTheDocument()

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(`${ApiEndpoint.Projects}?q=Cesar`)
    expect(searchInput).toHaveValue('Cesar')

    resolveFetch(undefined)
  })
})
