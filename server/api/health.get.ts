import { users } from '../database/schema'

export default defineEventHandler(async () => {
  const rows = await db.select().from(users)
  return { ok: true, userCount: rows.length }
})
