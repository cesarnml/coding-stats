import { render, screen } from '@testing-library/svelte'
import type { SummariesResult } from '$src/types/wakatime'
import { describe, expect, it } from 'vitest'
import AiLinesPieChart from './AiLinesPieChart.svelte'

const makeSummaries = (
  ai_additions: number,
  human_additions: number,
): SummariesResult =>
  ({
    data: [
      {
        grand_total: {
          ai_additions,
          ai_deletions: 0,
          human_additions,
          human_deletions: 0,
          ai_input_tokens: 0,
          ai_output_tokens: 0,
          total_seconds: 0,
          hours: 0,
          minutes: 0,
          decimal: '0',
          digital: '0',
          text: '0',
          ai_prompt_length_avg: 0,
          ai_prompt_length_sum: 0,
          ai_prompt_events: 0,
        },
        range: { date: '2024-01-01', end: '', start: '', text: '' },
        categories: [],
        dependencies: [],
        editors: [],
        languages: [],
        machines: [],
        projects: [],
        operating_systems: [],
      },
    ],
  }) as unknown as SummariesResult

describe('AiLinesPieChart', () => {
  it('shows empty state when all slice values are zero', () => {
    render(AiLinesPieChart, { summaries: makeSummaries(0, 0) })
    expect(screen.getByText('No AI line data for this range')).toBeInTheDocument()
  })

  it('renders chart container when data is present', () => {
    render(AiLinesPieChart, { summaries: makeSummaries(100, 50) })
    expect(screen.queryByText('No AI line data for this range')).not.toBeInTheDocument()
    expect(document.querySelector('[data-testid="ai-lines-chart"]')).toBeInTheDocument()
  })
})
