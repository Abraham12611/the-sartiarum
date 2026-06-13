import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

function decode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function createClient() {
  const rawUrl = process.env.DATABASE_URL
  if (!rawUrl) {
    throw new Error('DATABASE_URL is not set')
  }

  const parsed = new URL(rawUrl)
  const databaseName = parsed.pathname.replace(/^\//, '') || 'postgres'

  // Parse and pass explicit fields so runtime PG* env vars cannot override user/host unexpectedly.
  return postgres({
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 5432,
    database: databaseName,
    user: decode(parsed.username),
    password: decode(parsed.password),
    ssl: 'require',
    // `prepare: false` is required for Supabase's transaction pooler.
    prepare: false,
  })
}

const client = createClient()
export const db = drizzle(client, { schema })
