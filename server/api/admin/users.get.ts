export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  return db.query.users.findMany({
    orderBy: (users, { asc }) => [asc(users.name)],
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      pointsBalance: true,
      createdAt: true
    }
  })
})
