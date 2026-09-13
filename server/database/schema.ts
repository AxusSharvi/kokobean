import { relations } from 'drizzle-orm'
import { pgTable, serial, text, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['user', 'admin'])
export const redemptionStatusEnum = pgEnum('redemption_status', ['pending', 'fulfilled', 'rejected'])
export const categoryColorEnum = pgEnum('category_color', ['sage', 'terracotta', 'brown'])
export const categoryIconEnum = pgEnum('category_icon', ['checklist', 'home', 'heart', 'star', 'flag', 'bolt'])
export const categoryBgColorEnum = pgEnum('category_bg_color', ['none', 'peach', 'sand', 'butter', 'sky'])

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: roleEnum('role').notNull().default('user'),
  pointsBalance: integer('points_balance').notNull().default(0),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpiresAt: timestamp('password_reset_expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: categoryColorEnum('color').notNull().default('sage'),
  icon: categoryIconEnum('icon').notNull().default('checklist'),
  bgColor: categoryBgColorEnum('bg_color').notNull().default('none'),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  pointsValue: integer('points_value').notNull().default(10),
  isDone: boolean('is_done').notNull().default(false),
  dueDate: timestamp('due_date', { mode: 'string' }),
  completedAt: timestamp('completed_at'),
  reminderDayBeforeSentAt: timestamp('reminder_day_before_sent_at'),
  reminderDueSentAt: timestamp('reminder_due_sent_at'),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const rewards = pgTable('rewards', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  cost: integer('cost').notNull(),
  stock: integer('stock'),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const redemptions = pgTable('redemptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rewardId: integer('reward_id').notNull().references(() => rewards.id),
  status: redemptionStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const pointTransactions = pgTable('point_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  delta: integer('delta').notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  redemptions: many(redemptions),
  pointTransactions: many(pointTransactions)
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  todos: many(todos)
}))

export const todosRelations = relations(todos, ({ one }) => ({
  category: one(categories, { fields: [todos.categoryId], references: [categories.id] })
}))

export const rewardsRelations = relations(rewards, ({ one, many }) => ({
  createdByUser: one(users, { fields: [rewards.createdBy], references: [users.id] }),
  redemptions: many(redemptions)
}))

export const redemptionsRelations = relations(redemptions, ({ one }) => ({
  user: one(users, { fields: [redemptions.userId], references: [users.id] }),
  reward: one(rewards, { fields: [redemptions.rewardId], references: [rewards.id] })
}))
