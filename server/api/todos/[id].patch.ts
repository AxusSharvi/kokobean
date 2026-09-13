import { eq, sql } from 'drizzle-orm'
import { pointTransactions, todos, users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{
    isDone?: boolean
    title?: string
    pointsValue?: number
    dueDate?: string | null
  }>(event)

  const existing = await db.query.todos.findFirst({
    where: eq(todos.id, id),
    with: { category: true }
  })
  if (!existing || existing.category.userId !== user.id) {
    throw createError({ statusCode: 404, statusMessage: 'Todo not found' })
  }

  if (body.dueDate && Number.isNaN(Date.parse(body.dueDate))) {
    throw createError({ statusCode: 400, statusMessage: 'dueDate is not a valid date' })
  }
  if (body.pointsValue !== undefined && (!Number.isFinite(body.pointsValue) || body.pointsValue <= 0)) {
    throw createError({ statusCode: 400, statusMessage: 'pointsValue must be a positive number' })
  }

  return db.transaction(async (tx) => {
    const updates: Partial<typeof todos.$inferInsert> = {}

    if (typeof body.title === 'string' && body.title.trim()) {
      updates.title = body.title.trim()
    }

    if (body.dueDate !== undefined) {
      updates.dueDate = body.dueDate || null
    }

    if (typeof body.pointsValue === 'number') {
      const newPoints = Math.floor(body.pointsValue)
      if (newPoints !== existing.pointsValue) {
        updates.pointsValue = newPoints

        // the todo was already completed under the old point value, so the
        // banked balance needs to move by the difference, not the new total
        if (existing.isDone) {
          const delta = newPoints - existing.pointsValue
          await tx.insert(pointTransactions).values({
            userId: user.id,
            delta,
            reason: `Adjusted points for "${existing.title}"`
          })
          await tx.update(users)
            .set({ pointsBalance: sql`GREATEST(0, ${users.pointsBalance} + ${delta})` })
            .where(eq(users.id, user.id))
        }
      }
    }

    if (typeof body.isDone === 'boolean' && body.isDone !== existing.isDone) {
      updates.isDone = body.isDone
      updates.completedAt = body.isDone ? new Date() : null

      const awardPoints = updates.pointsValue ?? existing.pointsValue
      const delta = body.isDone ? awardPoints : -awardPoints
      await tx.insert(pointTransactions).values({
        userId: user.id,
        delta,
        reason: body.isDone ? `Completed "${existing.title}"` : `Un-completed "${existing.title}"`
      })
      await tx.update(users)
        .set({ pointsBalance: sql`GREATEST(0, ${users.pointsBalance} + ${delta})` })
        .where(eq(users.id, user.id))
    }

    const [todo] = Object.keys(updates).length
      ? await tx.update(todos).set(updates).where(eq(todos.id, id)).returning()
      : [existing]

    return todo
  })
})
