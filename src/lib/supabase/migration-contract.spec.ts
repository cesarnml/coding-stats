import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const migrationsDir = join(process.cwd(), 'supabase/migrations')

function readOnAuthUserCreatedMigration(): string {
  const files = readdirSync(migrationsDir).filter((name) =>
    name.endsWith('_on_auth_user_created.sql'),
  )
  expect(files.length).toBeGreaterThan(0)
  const latest = [...files].sort().at(-1)
  if (!latest) {
    throw new Error('Expected at least one on_auth_user_created migration file')
  }
  return readFileSync(join(migrationsDir, latest), 'utf8')
}

describe('on_auth_user_created migration contract', () => {
  it('defines trigger on auth.users calling handle_new_user after insert', () => {
    const sql = readOnAuthUserCreatedMigration().toLowerCase()
    expect(sql).toContain('on_auth_user_created')
    expect(sql).toContain('auth.users')
    expect(sql).toContain('handle_new_user')
    expect(sql).toContain('after insert')
  })
})
