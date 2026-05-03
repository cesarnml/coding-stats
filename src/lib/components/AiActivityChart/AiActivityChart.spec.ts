import { render, screen } from '@testing-library/svelte'
import AiActivityChart from './AiActivityChart.svelte'

const mockAiData = [
  { date: '2026-05-01', ai_additions: 100, human_additions: 40 },
  { date: '2026-05-02', ai_additions: 200, human_additions: 80 },
]

describe('AiActivityChart', () => {
  it('shows empty state message when data is empty', () => {
    render(AiActivityChart, { props: { data: [] } })
    expect(screen.getByText(/AI data accumulates daily/i)).toBeInTheDocument()
  })

  it('renders chart container when data is present', () => {
    render(AiActivityChart, { props: { data: mockAiData } })
    expect(screen.getByTestId('ai-activity-chart')).toBeInTheDocument()
  })
})
