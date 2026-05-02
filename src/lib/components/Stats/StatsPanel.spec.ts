import { render, screen } from '@testing-library/svelte'
import StatsPanel from './StatsPanel.svelte'
import { summaries } from '$src/mocks/testData'
import { computeAverageSeconds, computeHolidayCount, computeTotalSeconds } from './summariesHelpers'
import { formatTime } from '$lib/helpers/timeHelpers'
import type { SummariesResult } from '$src/types/wakatime'

describe('StatsPanel', () => {
  it('renders a compact stats panel with correct titles and values', async () => {
    const props = {
      summaries,
      showFullPanel: false,
    }
    render(StatsPanel, props)

    expect(screen.getByText('Total Hours')).toBeInTheDocument()
    expect(screen.getByText(formatTime(computeTotalSeconds(summaries)))).toBeInTheDocument()

    expect(screen.getByText('Daily Average')).toBeInTheDocument()
    expect(screen.getByText(formatTime(computeAverageSeconds(summaries)))).toBeInTheDocument()

    expect(screen.getByText('No Code Days')).toBeInTheDocument()
    expect(screen.getByText(`${computeHolidayCount(summaries)} days`)).toBeInTheDocument()

    expect(screen.queryByText('Top Project')).not.toBeInTheDocument()
    expect(screen.queryByText('Top Language')).not.toBeInTheDocument()
  })
  it('renders a full stats panel with correct titles and values', async () => {
    const props = {
      summaries,
      showFullPanel: true,
    }
    render(StatsPanel, props)

    expect(screen.getByText('Total Hours')).toBeInTheDocument()
    expect(screen.getByText(formatTime(computeTotalSeconds(summaries)))).toBeInTheDocument()

    expect(screen.getByText('Daily Average')).toBeInTheDocument()
    expect(screen.getByText(formatTime(computeAverageSeconds(summaries)))).toBeInTheDocument()

    expect(screen.getByText('No Code Days')).toBeInTheDocument()
    expect(screen.getByText(`${computeHolidayCount(summaries)} days`)).toBeInTheDocument()

    expect(screen.getByText('Top Project')).toBeInTheDocument()
    expect(screen.getByText('Top Language')).toBeInTheDocument()
  })
  it('renders a fallback top project message', async () => {
    const summaries = {
      data: [
        {
          projects: [
            {
              name: '',
              total_seconds: 0,
            },
          ],
          languages: [
            {
              name: '',
              total_seconds: 0,
            },
          ],
          grand_total: {
            total_seconds: 3600,
          },
        },
      ],
    } as unknown as SummariesResult

    const props = {
      summaries,
      showFullPanel: true,
    }
    render(StatsPanel, props)

    expect(screen.getByText('N/A')).toBeInTheDocument()
  })
})
