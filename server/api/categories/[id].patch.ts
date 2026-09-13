import { and, eq } from 'drizzle-orm'
import { categories } from '../../database/schema'
import { isCategoryColor } from '../../../shared/utils/categoryColors'
import { isCategoryIcon } from '../../../shared/utils/categoryIcons'
import { isCategoryBgColor } from '../../../shared/utils/categoryBgColors'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ color?: string; icon?: string; bgColor?: string }>(event)

  const updates: Partial<typeof categories.$inferInsert> = {}
  if (body?.color !== undefined) {
    if (!isCategoryColor(body.color)) {
      throw createError({ statusCode: 400, statusMessage: 'A valid color is required' })
    }
    updates.color = body.color
  }
  if (body?.icon !== undefined) {
    if (!isCategoryIcon(body.icon)) {
      throw createError({ statusCode: 400, statusMessage: 'A valid icon is required' })
    }
    updates.icon = body.icon
  }
  if (body?.bgColor !== undefined) {
    if (!isCategoryBgColor(body.bgColor)) {
      throw createError({ statusCode: 400, statusMessage: 'A valid background color is required' })
    }
    updates.bgColor = body.bgColor
  }

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'A valid color, icon, or background is required' })
  }

  const [category] = await db.update(categories)
    .set(updates)
    .where(and(eq(categories.id, id), eq(categories.userId, user.id)))
    .returning()

  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  return category
})
