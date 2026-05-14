import { render, screen } from '@testing-library/svelte'
import PieChart from './PieChart.svelte'
import type { SummariesResult } from '$src/types/wakatime'

it('renders a PieChart', async () => {
  const summaries = {
    data: [
      {
        languages: [
          { name: 'JavaScript', total_seconds: 3600 },
          { name: 'Python', total_seconds: 1800 },
        ],
      },
      {
        languages: [
          { name: 'JavaScript', total_seconds: 7200 },
          { name: 'TypeScript', total_seconds: 5400 },
        ],
      },
    ],
  } as unknown as SummariesResult

  const props = { summaries, title: 'test title' }

  render(PieChart, props)

  expect(screen.getByText(props.title)).toBeInTheDocument()
  expect(screen.getByTestId('chart')).toBeInTheDocument()
})
