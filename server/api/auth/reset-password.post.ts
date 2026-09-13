import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ token: string; password: string }>(event)

  if (!body?.token || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Token and password are required' })
  }
  if (body.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }

  const user = await db.query.users.findFirst({ where: eq(users.passwordResetToken, body.token) })

  if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
    throw createError({ statusCode: 400, statusMessage: 'This reset link is invalid or has expired' })
  }

  const passwordHash = await hashPassword(body.password)

  await db.update(users)
    .set({ passwordHash, passwordResetToken: null, passwordResetExpiresAt: null })
    .where(eq(users.id, user.id))

  await setUserSession(event, {
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  })

  return { ok: true }
})
