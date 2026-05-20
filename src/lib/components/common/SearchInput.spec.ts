import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import SearchInput from './SearchInput.svelte'
import { vi } from 'vitest'

const { gotoMock } = vi.hoisted(() => ({
  gotoMock: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('$app/navigation', () => ({
  goto: gotoMock,
}))

vi.mock('$app/stores', () => ({
  page: {
    subscribe: (run: (value: { url: URL }) => void) => {
      run({ url: new URL('http://localhost/projects') })
      return () => {}
    },
  },
}))

describe('SearchInput', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    gotoMock.mockClear()
  })

  it('navigates with q when typing a search term', async () => {
    render(SearchInput)

    await user.type(screen.getByRole('textbox'), 'blog')

    await vi.waitFor(() => {
      expect(gotoMock).toHaveBeenCalled()
    })

    expect(gotoMock).toHaveBeenCalledWith('/projects?q=blog', {
      keepFocus: true,
      noScroll: true,
      invalidateAll: true,
    })
  })

  it('shows the query from the URL', () => {
    render(SearchInput, { query: 'blog' })
    expect(screen.getByRole('textbox')).toHaveValue('blog')
  })
})
