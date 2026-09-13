import { eq } from 'drizzle-orm'
import { rewards } from '../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))

  try {
    const [deleted] = await db.delete(rewards).where(eq(rewards.id, id)).returning()
    if (!deleted) {
      throw createError({ statusCode: 404, statusMessage: 'Reward not found' })
    }
  } catch (error: any) {
    if (error.code === '23503') {
      throw createError({ statusCode: 409, statusMessage: 'This reward has redemption history — deactivate it instead of deleting it' })
    }
    throw error
  }

  return { ok: true }
})
