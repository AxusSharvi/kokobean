export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  return db.query.redemptions.findMany({
    orderBy: (redemptions, { desc }) => [desc(redemptions.createdAt)],
    with: {
      reward: true,
      user: { columns: { id: true, name: true, email: true } }
    }
  })
})
