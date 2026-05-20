import { describe, expect, it, vi } from 'vitest'
import { upsertProject } from './projects'

describe('upsertProject', () => {
  it('upserts on name conflict', async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: '1', name: 'pirate_claw', is_tracked: true, color: null },
      error: null,
    })
    const select = vi.fn().mockReturnValue({ single })
    const upsert = vi.fn().mockReturnValue({ select })
    const from = vi.fn().mockReturnValue({ upsert })
    const supabase = { from } as never

    const result = await upsertProject(supabase, { name: 'pirate_claw', is_tracked: true })

    expect(from).toHaveBeenCalledWith('projects')
    expect(upsert).toHaveBeenCalledWith(
      { name: 'pirate_claw', is_tracked: true },
      { onConflict: 'name' },
    )
    expect(result?.name).toBe('pirate_claw')
  })
})
