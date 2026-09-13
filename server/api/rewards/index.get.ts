import { eq } from 'drizzle-orm'
import { rewards } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  if (user.role === 'admin') {
    return db.query.rewards.findMany({ orderBy: (rewards, { asc }) => [asc(rewards.createdAt)] })
  }

  return db.select().from(rewards).where(eq(rewards.isActive, true)).orderBy(rewards.cost)
})
