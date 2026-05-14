import { render, screen } from '@testing-library/svelte'
import DarkModeToggle from './DarkModeToggle.svelte'

describe('DarkModeToggle', () => {
  it('should present three options', async () => {
    render(DarkModeToggle)

    const toggles = screen.getAllByRole('radio')

    expect(toggles).toHaveLength(3)
  })
})
