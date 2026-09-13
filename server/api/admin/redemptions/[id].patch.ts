import { eq, sql } from 'drizzle-orm'
import { pointTransactions, redemptions, rewards, users } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ status: 'fulfilled' | 'rejected' }>(event)

  if (body?.status !== 'fulfilled' && body?.status !== 'rejected') {
    throw createError({ statusCode: 400, statusMessage: "status must be 'fulfilled' or 'rejected'" })
  }

  return db.transaction(async (tx) => {
    const redemption = await tx.query.redemptions.findFirst({
      where: eq(redemptions.id, id),
      with: { reward: true }
    })
    if (!redemption) {
      throw createError({ statusCode: 404, statusMessage: 'Redemption not found' })
    }
    if (redemption.status !== 'pending') {
      throw createError({ statusCode: 409, statusMessage: 'This redemption was already resolved' })
    }

    if (body.status === 'rejected') {
      // refund the points and restock, since the reward was never handed over
      await tx.update(users)
        .set({ pointsBalance: sql`${users.pointsBalance} + ${redemption.reward.cost}` })
        .where(eq(users.id, redemption.userId))

      if (redemption.reward.stock != null) {
        await tx.update(rewards)
          .set({ stock: sql`${rewards.stock} + 1` })
          .where(eq(rewards.id, redemption.rewardId))
      }

      await tx.insert(pointTransactions).values({
        userId: redemption.userId,
        delta: redemption.reward.cost,
        reason: `Refund: "${redemption.reward.name}" redemption rejected`
      })
    }

    const [updated] = await tx.update(redemptions)
      .set({ status: body.status })
      .where(eq(redemptions.id, id))
      .returning()

    return updated
  })
})
