import { and, eq, isNotNull } from 'drizzle-orm'
import { todos } from '../database/schema'
import { sendEmail, reminderEmailHtml } from './email'

function dateOnly(value: Date | string) {
  const d = new Date(value)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export async function checkDueReminders() {
  const today = dateOnly(new Date())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const candidates = await db.query.todos.findMany({
    where: and(eq(todos.isDone, false), isNotNull(todos.dueDate)),
    with: {
      category: {
        with: { user: true }
      }
    }
  })

  let sentCount = 0

  for (const todo of candidates) {
    if (!todo.dueDate) continue
    const due = dateOnly(todo.dueDate)
    const user = todo.category.user

    if (due.getTime() === tomorrow.getTime() && !todo.reminderDayBeforeSentAt) {
      const delivered = await sendEmail(
        user.email,
        `Reminder: "${todo.title}" is due tomorrow`,
        reminderEmailHtml(user.name, todo.title, 'tomorrow')
      )
      // only mark as sent on success -- a failed send (e.g. Resend sandbox
      // rejecting the address) should be retried on the next check instead
      // of being silently skipped forever
      if (delivered) {
        await db.update(todos).set({ reminderDayBeforeSentAt: new Date() }).where(eq(todos.id, todo.id))
        sentCount++
      }
    }

    if (due.getTime() === today.getTime() && !todo.reminderDueSentAt) {
      const delivered = await sendEmail(
        user.email,
        `Reminder: "${todo.title}" is due today`,
        reminderEmailHtml(user.name, todo.title, 'today')
      )
      if (delivered) {
        await db.update(todos).set({ reminderDueSentAt: new Date() }).where(eq(todos.id, todo.id))
        sentCount++
      }
    }
  }

  return sentCount
}
