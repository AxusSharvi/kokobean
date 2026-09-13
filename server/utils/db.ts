import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../database/schema'

// `prepare: false` is required for pooled connections (e.g. Neon's PgBouncer
// pooler in transaction mode), which don't support prepared statements
const queryClient = postgres(process.env.DATABASE_URL!, { prepare: false })

export const db = drizzle(queryClient, { schema })
