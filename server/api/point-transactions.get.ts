import { eq } from 'drizzle-orm'
import { pointTransactions } from '../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  return db.query.pointTransactions.findMany({
    where: eq(pointTransactions.userId, user.id),
    orderBy: (pointTransactions, { desc }) => [desc(pointTransactions.createdAt)]
  })
})
