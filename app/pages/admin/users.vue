<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

interface AdminUser {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  pointsBalance: number
}

interface Todo {
  id: number
  title: string
  pointsValue: number
  isDone: boolean
}

interface CategoryWithTodos {
  id: number
  name: string
  color: CategoryColor
  icon: CategoryIconName
  todos: Todo[]
}

const BADGE_CLASS: Record<CategoryColor, string> = {
  sage: 'text-sage-strong',
  terracotta: 'text-accent-strong',
  brown: 'text-muted'
}

const users = ref<AdminUser[]>([])
const loading = ref(true)

const expandedUserId = ref<number | null>(null)
const expandedCategoryId = ref<number | null>(null)
const loadingUserId = ref<number | null>(null)
const userCategories = ref<Record<number, CategoryWithTodos[]>>({})

async function toggleUser(id: number) {
  if (expandedUserId.value === id) {
    expandedUserId.value = null
    return
  }

  expandedUserId.value = id
  expandedCategoryId.value = null

  if (!userCategories.value[id]) {
    loadingUserId.value = id
    const data = await $fetch<{ categories: CategoryWithTodos[] }>(`/api/admin/users/${id}`)
    userCategories.value[id] = data.categories
    loadingUserId.value = null
  }
}

function toggleCategory(id: number) {
  expandedCategoryId.value = expandedCategoryId.value === id ? null : id
}

function progress(category: CategoryWithTodos) {
  if (category.todos.length === 0) return 0
  return Math.round((category.todos.filter((t) => t.isDone).length / category.todos.length) * 100)
}

function pointsEarned(category: CategoryWithTodos) {
  return category.todos.filter((t) => t.isDone).reduce((sum, t) => sum + t.pointsValue, 0)
}

function pointsTotal(category: CategoryWithTodos) {
  return category.todos.reduce((sum, t) => sum + t.pointsValue, 0)
}

onMounted(async () => {
  users.value = await $fetch<AdminUser[]>('/api/admin/users')
  loading.value = false
})
</script>

<template>
  <div class="animate-fade-up">
    <h1 class="mb-6 font-display text-2xl font-semibold">Admin</h1>
    <nav class="mb-6 flex flex-wrap gap-x-6 gap-y-1 border-b border-line text-sm">
      <NuxtLink to="/admin" class="border-b-2 border-transparent pb-3 text-muted transition-colors hover:text-ink">Overview</NuxtLink>
      <NuxtLink to="/admin/users" class="border-b-2 border-accent-strong pb-3 font-medium text-ink transition-colors">Users</NuxtLink>
      <NuxtLink to="/admin/rewards" class="border-b-2 border-transparent pb-3 text-muted transition-colors hover:text-ink">Rewards</NuxtLink>
      <NuxtLink to="/admin/redemptions" class="border-b-2 border-transparent pb-3 text-muted transition-colors hover:text-ink">Redemptions</NuxtLink>
    </nav>

    <div v-if="loading" class="text-muted">Loading…</div>
    <div v-else class="overflow-x-auto rounded-2xl border border-line bg-surface shadow-soft">
      <table class="w-full min-w-[560px] text-left text-sm">
        <thead class="text-xs uppercase tracking-wide text-muted">
          <tr>
            <th class="border-b border-line px-5 py-3 font-medium">Name</th>
            <th class="border-b border-line px-5 py-3 font-medium">Email</th>
            <th class="border-b border-line px-5 py-3 font-medium">Role</th>
            <th class="border-b border-line px-5 py-3 text-right font-medium">KP</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line/60">
          <template v-for="u in users" :key="u.id">
            <tr class="cursor-pointer transition-colors hover:bg-sage/10" @click="toggleUser(u.id)">
              <td class="px-5 py-3 font-medium">
                <span
                  class="mr-2 inline-block text-muted transition-transform duration-150"
                  :class="expandedUserId === u.id ? 'rotate-90' : ''"
                >›</span>
                {{ u.name }}
              </td>
              <td class="px-5 py-3 text-muted">{{ u.email }}</td>
              <td class="px-5 py-3 capitalize text-muted">{{ u.role }}</td>
              <td class="px-5 py-3 text-right font-mono font-bold text-ink">{{ u.pointsBalance }}</td>
            </tr>
            <tr v-if="expandedUserId === u.id">
              <td colspan="4" class="bg-canvas/60 px-5 py-4">
                <div v-if="loadingUserId === u.id" class="text-sm text-muted">Loading categories…</div>
                <p v-else-if="!userCategories[u.id]?.length" class="text-sm text-muted">No categories yet.</p>
                <div v-else class="space-y-3">
                  <div
                    v-for="category in userCategories[u.id]"
                    :key="category.id"
                    class="overflow-hidden rounded-xl border border-line bg-surface"
                  >
                    <button
                      type="button"
                      class="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-sage/10"
                      @click.stop="toggleCategory(category.id)"
                    >
                      <div class="flex items-center gap-2.5">
                        <Icon :name="category.icon" class="h-5 w-5 shrink-0" :class="BADGE_CLASS[category.color]" />
                        <span class="font-medium">{{ category.name }}</span>
                      </div>
                      <div class="flex items-center gap-4 text-xs">
                        <span class="text-muted">{{ category.todos.filter((t) => t.isDone).length }}/{{ category.todos.length }} done</span>
                        <span class="font-mono font-semibold text-ink">{{ progress(category) }}%</span>
                        <span class="font-mono font-semibold text-ink">{{ pointsEarned(category) }}/{{ pointsTotal(category) }} KP</span>
                      </div>
                    </button>
                    <div v-if="expandedCategoryId === category.id" class="border-t border-line/70 px-4 py-3">
                      <ul v-if="category.todos.length > 0" class="space-y-2">
                        <li v-for="todo in category.todos" :key="todo.id" class="flex items-center justify-between gap-3 text-sm">
                          <span class="flex min-w-0 items-center gap-2">
                            <span
                              class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                              :class="todo.isDone ? 'bg-sage-strong text-white' : 'border border-line'"
                            >
                              <Icon v-if="todo.isDone" name="check" class="h-2.5 w-2.5" />
                            </span>
                            <span class="truncate" :class="todo.isDone ? 'text-muted line-through' : 'text-ink'">{{ todo.title }}</span>
                          </span>
                          <span class="shrink-0 font-mono text-xs text-muted">+{{ todo.pointsValue }} KP</span>
                        </li>
                      </ul>
                      <p v-else class="text-sm text-muted">No todos in this category yet.</p>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>
