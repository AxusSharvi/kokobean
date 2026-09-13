import { eq } from 'drizzle-orm'
import { categories, users } from '../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const [me, userCategories] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, user.id) }),
    db.query.categories.findMany({
      where: eq(categories.userId, user.id),
      orderBy: (categories, { desc }) => [desc(categories.createdAt)],
      with: {
        todos: {
          orderBy: (todos, { asc }) => [asc(todos.createdAt)]
        }
      }
    })
  ])

  return {
    pointsBalance: me?.pointsBalance ?? 0,
    categories: userCategories
  }
})
