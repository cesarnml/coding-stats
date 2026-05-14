import { render, screen } from '@testing-library/svelte'
import ChartTitle from './ChartTitle.svelte'

it('render a ChartTitle', async () => {
  render(ChartTitle)

  expect(screen.getByTestId('chart-title')).toBeInTheDocument()
})
