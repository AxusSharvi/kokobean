import { eq } from 'drizzle-orm'
import { redemptions } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  return db.query.redemptions.findMany({
    where: eq(redemptions.userId, user.id),
    orderBy: (redemptions, { desc }) => [desc(redemptions.createdAt)],
    with: { reward: true }
  })
})
