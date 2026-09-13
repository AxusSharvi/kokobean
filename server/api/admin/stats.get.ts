import { sql } from 'drizzle-orm'
import { categories, todos, users, pointTransactions, redemptions, rewards } from '../../database/schema'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const userRow = (await db.select({
    total: sql<number>`count(*)::int`,
    admins: sql<number>`count(*) filter (where ${users.role} = 'admin')::int`,
    pointsBanked: sql<number>`coalesce(sum(${users.pointsBalance}), 0)::int`
  }).from(users))[0]!

  const categoryRow = (await db.select({
    total: sql<number>`count(*)::int`
  }).from(categories))[0]!

  const todoRow = (await db.select({
    total: sql<number>`count(*)::int`,
    done: sql<number>`count(*) filter (where ${todos.isDone})::int`
  }).from(todos))[0]!

  const pointsRow = (await db.select({
    earned: sql<number>`coalesce(sum(${pointTransactions.delta}) filter (where ${pointTransactions.delta} > 0), 0)::int`,
    spent: sql<number>`coalesce(abs(sum(${pointTransactions.delta}) filter (where ${pointTransactions.delta} < 0)), 0)::int`
  }).from(pointTransactions))[0]!

  const redemptionRow = (await db.select({
    total: sql<number>`count(*)::int`,
    pending: sql<number>`count(*) filter (where ${redemptions.status} = 'pending')::int`
  }).from(redemptions))[0]!

  const rewardRow = (await db.select({
    total: sql<number>`count(*)::int`,
    active: sql<number>`count(*) filter (where ${rewards.isActive})::int`
  }).from(rewards))[0]!

  return {
    users: userRow,
    categories: categoryRow,
    todos: todoRow,
    points: pointsRow,
    redemptions: redemptionRow,
    rewards: rewardRow
  }
})
