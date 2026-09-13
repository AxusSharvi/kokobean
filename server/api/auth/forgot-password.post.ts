import { randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'
import { sendEmail, resetPasswordEmailHtml } from '../../utils/email'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string }>(event)

  if (!body?.email) {
    throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  }

  const email = body.email.toLowerCase().trim()
  const user = await db.query.users.findFirst({ where: eq(users.email, email) })

  // always respond the same way whether or not the account exists, so this
  // endpoint can't be used to discover which emails are registered
  if (user) {
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await db.update(users)
      .set({ passwordResetToken: token, passwordResetExpiresAt: expiresAt })
      .where(eq(users.id, user.id))

    const origin = getRequestURL(event).origin
    const resetUrl = `${origin}/reset-password?token=${token}`
    await sendEmail(user.email, 'Reset your kokobean password', resetPasswordEmailHtml(user.name, resetUrl))
  }

  return { ok: true }
})
