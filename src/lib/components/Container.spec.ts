import { render, screen } from '@testing-library/svelte'
import Container from './Container.svelte'

it('render Container', async () => {
  render(Container)

  expect(screen.getByTestId('container')).toBeInTheDocument()
})
