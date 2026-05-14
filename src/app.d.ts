import { SupabaseClient, Session } from '@supabase/supabase-js'
import type { Database } from '$lib/database.types'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

export type SupaProfile = Database['public']['Tables']['profiles']['Row']
export type SupaProject = Database['public']['Tables']['projects']['Row']
export type SupaSummary = Database['public']['Tables']['summaries']['Row']
export type SupaDuration = Database['public']['Tables']['durations']['Row']
export type SupaDurationByLanguage = Database['public']['Tables']['durations_by_language']['Row']
export type SupaProjectSummary = Database['public']['Tables']['project_summaries']['Row']

declare global {
  namespace App {
    interface Error {
      name?: string
      stack?: string
      errorId?: string
    }
    interface Locals {
      supabase: SupabaseClient<Database, 'public'>
      getSession(): Promise<Session | null>
      getProfile(): Promise<SupaProfile | null>
      getProjects(): Promise<SupaProject[] | null>
    }
    interface PageData {
      session: Session | null
    }
    // interface Platform {}
  }
}

export {}
