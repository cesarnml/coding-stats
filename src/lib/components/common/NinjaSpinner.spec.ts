import { render, screen } from '@testing-library/svelte'
import NinjaSpinner from './NinjaSpinner.svelte'

describe('NinjaSpinner', () => {
  it('renders an accessible loading spinner', async () => {
    render(NinjaSpinner)

    expect(screen.getByLabelText('loading-spinner')).toBeInTheDocument()
  })
})
