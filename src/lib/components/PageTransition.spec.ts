import { render, screen } from '@testing-library/svelte'
import PageTransition from './PageTransition.svelte'

describe('PageTransition', () => {
  it('renders', async () => {
    const props = {
      pathname: '/',
    }
    render(PageTransition, props)
    expect(screen.getByTestId('page-transition')).toBeInTheDocument()
  })
})
