import type { RequestEvent } from './$types'
import { describe, expect, it, vi } from 'vitest'
import { GET } from './+server'

describe('GET /api/supabase/project-summaries', () => {
  it('uses start and end query params when both are provided', async () => {
    const gte = vi.fn().mockReturnValue({
      lte: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [] }),
      }),
    })
    const supabase = {
      from: (table: string) => {
        if (table === 'projects') {
          return {
            select: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: { id: 'project-1' } }),
              }),
            }),
          }
        }
        return { select: () => ({ eq: () => ({ gte }) }) }
      },
    }
    const event = {
      url: new URL(
        'http://localhost/api/supabase/project-summaries?project=codogotchi&start=2024-01-01&end=2024-01-31',
      ),
      locals: { supabase },
    }

    await GET(event as unknown as RequestEvent)

    expect(gte).toHaveBeenCalledWith('date', '2024-01-01')
    expect(gte.mock.results[0]?.value.lte).toHaveBeenCalledWith('date', '2024-01-31')
  })
})
