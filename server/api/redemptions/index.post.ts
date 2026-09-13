import { eq, sql } from 'drizzle-orm'
import { pointTransactions, redemptions, rewards, users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readBody<{ rewardId: number }>(event)

  if (!body?.rewardId) {
    throw createError({ statusCode: 400, statusMessage: 'rewardId is required' })
  }

  return db.transaction(async (tx) => {
    const [reward] = await tx.select().from(rewards).where(eq(rewards.id, body.rewardId)).for('update')
    if (!reward || !reward.isActive) {
      throw createError({ statusCode: 404, statusMessage: 'Reward not found' })
    }
    if (reward.stock != null && reward.stock <= 0) {
      throw createError({ statusCode: 409, statusMessage: 'This reward is out of stock' })
    }

    const [me] = await tx.select().from(users).where(eq(users.id, user.id)).for('update')
    if (!me || me.pointsBalance < reward.cost) {
      throw createError({ statusCode: 409, statusMessage: 'Not enough points for this reward' })
    }

    await tx.update(users)
      .set({ pointsBalance: sql`${users.pointsBalance} - ${reward.cost}` })
      .where(eq(users.id, user.id))

    if (reward.stock != null) {
      await tx.update(rewards).set({ stock: reward.stock - 1 }).where(eq(rewards.id, reward.id))
    }

    await tx.insert(pointTransactions).values({
      userId: user.id,
      delta: -reward.cost,
      reason: `Redeemed "${reward.name}"`
    })

    const [redemption] = await tx.insert(redemptions).values({
      userId: user.id,
      rewardId: reward.id
    }).returning()

    return { ...redemption, reward }
  })
})
