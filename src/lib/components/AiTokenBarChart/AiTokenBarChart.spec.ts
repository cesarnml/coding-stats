import { render, screen } from '@testing-library/svelte'
import type { SummariesResult } from '$src/types/wakatime'
import { describe, expect, it } from 'vitest'
import AiTokenBarChart from './AiTokenBarChart.svelte'

const makeSummaries = (
  days: Array<{ ai_input_tokens: number; ai_output_tokens: number }>,
): SummariesResult =>
  ({
    data: days.map((d, i) => ({
      grand_total: {
        ai_additions: 0,
        ai_deletions: 0,
        human_additions: 0,
        human_deletions: 0,
        ai_input_tokens: d.ai_input_tokens,
        ai_output_tokens: d.ai_output_tokens,
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
      range: { date: `2024-01-0${i + 1}`, end: '', start: '', text: '' },
      categories: [],
      dependencies: [],
      editors: [],
      languages: [],
      machines: [],
      projects: [],
      operating_systems: [],
    })),
  }) as unknown as SummariesResult

describe('AiTokenBarChart', () => {
  it('shows empty state when all token values are zero', () => {
    render(AiTokenBarChart, { summaries: makeSummaries([{ ai_input_tokens: 0, ai_output_tokens: 0 }]) })
    expect(screen.getByText('No AI token data for this range')).toBeInTheDocument()
  })

  it('renders chart container when data is present', () => {
    render(AiTokenBarChart, {
      summaries: makeSummaries([{ ai_input_tokens: 1000, ai_output_tokens: 500 }]),
    })
    expect(screen.queryByText('No AI token data for this range')).not.toBeInTheDocument()
    expect(document.querySelector('[data-testid="ai-token-chart"]')).toBeInTheDocument()
  })
})
