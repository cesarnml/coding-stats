import type { RequestEvent } from './$types'
import { describe, expect, it, vi } from 'vitest'
import { GET } from './+server'

const MAX_DATE = '2024-03-15'

const mockSupabase = {
  from: () => ({
    select: (fields: string) => {
      // Max-date query selects 'date' only; range query selects '*'
      if (fields === 'date') {
        return {
          order: () => ({ limit: () => Promise.resolve({ data: [{ date: MAX_DATE }] }) }),
        }
      }
      return {
        gte: () => ({
          lte: () => ({
            order: () => Promise.resolve({ data: [] }),
          }),
        }),
      }
    },
  }),
}

describe('GET /api/supabase/summaries', () => {
  it('includes max_date in the response from a global MAX query', async () => {
    const event = {
      url: new URL('http://localhost/api/supabase/summaries?range=Last+7+Days'),
      locals: { supabase: mockSupabase },
    }
    const response = await GET(event as unknown as RequestEvent)
    const result = await response.json()
    expect(result.max_date).toBe(MAX_DATE)
  })

  it('sets max_date to null when summaries table is empty', async () => {
    const emptySupabase = {
      from: () => ({
        select: (fields: string) => {
          if (fields === 'date') {
            return {
              order: () => ({ limit: () => Promise.resolve({ data: [] }) }),
            }
          }
          return {
            gte: () => ({
              lte: () => ({
                order: () => Promise.resolve({ data: [] }),
              }),
            }),
          }
        },
      }),
    }
    const event = {
      url: new URL('http://localhost/api/supabase/summaries'),
      locals: { supabase: emptySupabase },
    }
    const response = await GET(event as unknown as RequestEvent)
    const result = await response.json()
    expect(result.max_date).toBeNull()
  })

  it('uses start and end query params when both are provided', async () => {
    const gte = vi.fn().mockReturnValue({
      lte: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [] }),
      }),
    })
    const customRangeSupabase = {
      from: () => ({
        select: (fields: string) => {
          if (fields === 'date') {
            return {
              order: () => ({ limit: () => Promise.resolve({ data: [{ date: MAX_DATE }] }) }),
            }
          }
          return { gte }
        },
      }),
    }
    const event = {
      url: new URL(
        'http://localhost/api/supabase/summaries?range=Last+7+Days&start=2024-01-01&end=2024-01-31',
      ),
      locals: { supabase: customRangeSupabase },
    }

    await GET(event as unknown as RequestEvent)

    expect(gte).toHaveBeenCalledWith('date', '2024-01-01')
    expect(gte.mock.results[0]?.value.lte).toHaveBeenCalledWith('date', '2024-01-31')
  })
})
