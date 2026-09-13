import { eq } from 'drizzle-orm'
import { todos } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const existing = await db.query.todos.findFirst({
    where: eq(todos.id, id),
    with: { category: true }
  })
  if (!existing || existing.category.userId !== user.id) {
    throw createError({ statusCode: 404, statusMessage: 'Todo not found' })
  }

  await db.delete(todos).where(eq(todos.id, id))
  return { ok: true }
})
