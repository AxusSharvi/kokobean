import { rewards } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody<{ name: string; description?: string; cost: number; stock?: number | null }>(event)

  if (!body?.name?.trim() || !body?.cost || body.cost <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Name and a positive cost are required' })
  }

  const [reward] = await db.insert(rewards).values({
    name: body.name.trim(),
    description: body.description?.trim() || null,
    cost: Math.floor(body.cost),
    stock: body.stock != null ? Math.floor(body.stock) : null,
    createdBy: admin.id
  }).returning()

  return reward
})
