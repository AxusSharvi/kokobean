import { eq } from 'drizzle-orm'
import { categories, users } from '../../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))

  const targetUser = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { id: true, name: true, email: true }
  })
  if (!targetUser) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const userCategories = await db.query.categories.findMany({
    where: eq(categories.userId, id),
    orderBy: (categories, { desc }) => [desc(categories.createdAt)],
    with: {
      todos: {
        orderBy: (todos, { asc }) => [asc(todos.createdAt)]
      }
    }
  })

  return { user: targetUser, categories: userCategories }
})
