import { eq, sql } from 'drizzle-orm'
import { users } from '../../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string; name: string }>(event)

  if (!body?.email || !body?.password || !body?.name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Email, password and name are required' })
  }
  if (body.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }

  const email = body.email.toLowerCase().trim()

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'An account with that email already exists' })
  }

  const passwordHash = await hashPassword(body.password)

  // the very first account to register becomes the admin
  const [countRow] = await db.select({ count: sql<number>`count(*)::int` }).from(users)
  const role = (countRow?.count ?? 0) === 0 ? 'admin' : 'user'

  const [user] = await db.insert(users).values({
    email,
    passwordHash,
    name: body.name.trim(),
    role
  }).returning()

  if (!user) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create user' })
  }

  await setUserSession(event, {
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  })

  return { id: user.id, email: user.email, name: user.name, role: user.role }
})
