import { and, eq } from 'drizzle-orm'
import { categories } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const [deleted] = await db.delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
    .returning()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  return { ok: true }
})
