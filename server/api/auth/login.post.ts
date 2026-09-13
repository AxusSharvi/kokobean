import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string }>(event)

  if (!body?.email || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const email = body.email.toLowerCase().trim()
  const user = await db.query.users.findFirst({ where: eq(users.email, email) })

  if (!user || !(await verifyPassword(user.passwordHash, body.password))) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  await setUserSession(event, {
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  })

  return { id: user.id, email: user.email, name: user.name, role: user.role }
})
