import type { SupabaseDuration } from '$src/routes/api/supabase/durations/+server'
import { describe, expect, it } from 'vitest'
import { createActiveHoursData } from './barChartHelpers'

describe('createActiveHoursData', () => {
  it('never returns a bar value below zero for reversed duration segments', () => {
    // A duration where end < start (same hour): time=10:30, duration=-1800s → ends at 10:00
    // endTime.diff(startTime, 'minutes') produces -30, accumulating a negative bar.
    const durations: SupabaseDuration = {
      id: 'test',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      date: '2024-01-01',
      data: [
        {
          time: 1704105000, // 2024-01-01 10:30 AM UTC
          duration: -1800, // reversed: ends at 10:00 AM
          color: null,
          project: 'test',
          language: 'TypeScript',
          category: 'coding',
          entity: 'test.ts',
          branch: 'main',
          ai_session: null,
          ai_additions: 0,
          ai_deletions: 0,
          human_additions: 0,
          human_deletions: 0,
          ai_input_tokens: 0,
          ai_output_tokens: 0,
          ai_prompt_length_sum: 0,
          ai_prompt_events: 0,
        },
      ],
    }

    const result = createActiveHoursData(durations)
    const values = result.map((item) => item.value)
    expect(values.every((v) => v >= 0)).toBe(true)
  })
})
