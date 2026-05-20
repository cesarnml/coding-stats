import type { Database } from '$lib/database.types'
import type { SupaProject } from '$src/app'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ProjectUpsert = {
  name: string
  is_tracked?: boolean
  color?: string | null
}

const projectTimestamp = (row: SupaProject) => row.updated_at ?? row.created_at ?? ''

/** Keep the newest row per name until DB unique constraint is applied everywhere. */
export function dedupeProjectsByName(projects: SupaProject[] | null): SupaProject[] | null {
  if (!projects?.length) return projects

  const byName = new Map<string, SupaProject>()
  for (const row of projects) {
    const key = row.name?.trim()
    if (!key) continue
    const existing = byName.get(key)
    if (!existing || projectTimestamp(row) > projectTimestamp(existing)) {
      byName.set(key, row)
    }
  }
  return [...byName.values()]
}

export async function upsertProject(
  supabase: SupabaseClient<Database, 'public'>,
  patch: ProjectUpsert,
): Promise<SupaProject | null> {
  const { data, error } = await supabase
    .from('projects')
    .upsert(patch, { onConflict: 'name' })
    .select('*')
    .single()

  if (error) {
    console.error('upsertProject failed', patch.name, error)
    return null
  }

  return data
}
