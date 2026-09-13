import { categories } from '../../database/schema'
import { isCategoryColor } from '../../../shared/utils/categoryColors'
import { isCategoryIcon } from '../../../shared/utils/categoryIcons'
import { isCategoryBgColor } from '../../../shared/utils/categoryBgColors'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readBody<{ name: string; color?: string; icon?: string; bgColor?: string }>(event)

  if (!body?.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Category name is required' })
  }

  const color = isCategoryColor(body.color) ? body.color : 'sage'
  const icon = isCategoryIcon(body.icon) ? body.icon : 'checklist'
  const bgColor = isCategoryBgColor(body.bgColor) ? body.bgColor : 'none'

  const [category] = await db.insert(categories)
    .values({ userId: user.id, name: body.name.trim(), color, icon, bgColor })
    .returning()

  return { ...category, todos: [] }
})
