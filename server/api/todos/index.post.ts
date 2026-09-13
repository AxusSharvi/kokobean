import { and, eq } from 'drizzle-orm'
import { categories, todos } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readBody<{ categoryId: number; title: string; pointsValue?: number; dueDate?: string | null }>(event)

  if (!body?.categoryId || !body?.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'categoryId and title are required' })
  }

  if (body.dueDate && Number.isNaN(Date.parse(body.dueDate))) {
    throw createError({ statusCode: 400, statusMessage: 'dueDate is not a valid date' })
  }

  const category = await db.query.categories.findFirst({
    where: and(eq(categories.id, body.categoryId), eq(categories.userId, user.id))
  })
  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  const pointsValue = body.pointsValue && body.pointsValue > 0 ? Math.floor(body.pointsValue) : 10

  const [todo] = await db.insert(todos)
    .values({ categoryId: body.categoryId, title: body.title.trim(), pointsValue, dueDate: body.dueDate || null })
    .returning()

  return todo
})
