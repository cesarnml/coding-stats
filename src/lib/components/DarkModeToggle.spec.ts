import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import DarkModeToggle from './DarkModeToggle.svelte'

describe('DarkModeToggle', () => {
  const user = userEvent.setup()

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
    localStorage.clear()
  })

  it('should present three options', async () => {
    render(DarkModeToggle)

    const toggles = screen.getAllByRole('radio')

    expect(toggles).toHaveLength(3)
  })

  it('applies the matching data-theme when a mode is selected', async () => {
    render(DarkModeToggle)
    // Radios render in Selection order: dark, light, system.
    const [dark, light, system] = screen.getAllByRole('radio')

    await user.click(dark)
    expect(document.documentElement.getAttribute('data-theme')).toBe('night')

    await user.click(light)
    expect(document.documentElement.getAttribute('data-theme')).toBe('synthwave')

    await user.click(system)
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
  })
})
