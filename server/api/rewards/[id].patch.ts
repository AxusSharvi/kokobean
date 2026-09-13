import { eq } from 'drizzle-orm'
import { rewards } from '../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{
    name?: string
    description?: string | null
    cost?: number
    stock?: number | null
    isActive?: boolean
  }>(event)

  const updates: Partial<typeof rewards.$inferInsert> = {}
  if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim()
  if (body.description !== undefined) updates.description = body.description?.trim() || null
  if (typeof body.cost === 'number' && body.cost > 0) updates.cost = Math.floor(body.cost)
  if (body.stock !== undefined) updates.stock = body.stock != null ? Math.floor(body.stock) : null
  if (typeof body.isActive === 'boolean') updates.isActive = body.isActive

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No valid fields to update' })
  }

  const [reward] = await db.update(rewards).set(updates).where(eq(rewards.id, id)).returning()
  if (!reward) {
    throw createError({ statusCode: 404, statusMessage: 'Reward not found' })
  }

  return reward
})
