import { render, screen } from '@testing-library/svelte'
import Footer from './Footer.svelte'

describe('Footer', () => {
  it('renders a footer element', async () => {
    render(Footer)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
