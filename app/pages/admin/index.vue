<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

interface Stats {
  users: { total: number; admins: number; pointsBanked: number }
  categories: { total: number }
  todos: { total: number; done: number }
  points: { earned: number; spent: number }
  redemptions: { total: number; pending: number }
  rewards: { total: number; active: number }
}

const stats = ref<Stats | null>(null)
const loading = ref(true)

const completionPct = computed(() => {
  if (!stats.value || stats.value.todos.total === 0) return 0
  return Math.round((stats.value.todos.done / stats.value.todos.total) * 100)
})

onMounted(async () => {
  stats.value = await $fetch<Stats>('/api/admin/stats')
  loading.value = false
})
</script>

<template>
  <div class="animate-fade-up">
    <h1 class="mb-6 font-display text-2xl font-semibold">Admin</h1>
    <nav class="mb-6 flex flex-wrap gap-x-6 gap-y-1 border-b border-line text-sm">
      <NuxtLink to="/admin" class="border-b-2 border-accent-strong pb-3 font-medium text-ink transition-colors">Overview</NuxtLink>
      <NuxtLink to="/admin/users" class="border-b-2 border-transparent pb-3 text-muted transition-colors hover:text-ink">Users</NuxtLink>
      <NuxtLink to="/admin/rewards" class="border-b-2 border-transparent pb-3 text-muted transition-colors hover:text-ink">Rewards</NuxtLink>
      <NuxtLink to="/admin/redemptions" class="border-b-2 border-transparent pb-3 text-muted transition-colors hover:text-ink">Redemptions</NuxtLink>
    </nav>

    <div v-if="loading" class="text-muted">Loading…</div>
    <div v-else-if="stats" class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div class="rounded-2xl border border-line bg-surface p-5 shadow-soft transition-shadow hover:shadow-soft-lg">
        <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Users</p>
        <p class="font-display text-3xl font-bold tabular-nums">{{ stats.users.total }}</p>
        <p class="mt-1 text-xs text-muted">{{ stats.users.admins }} admin{{ stats.users.admins === 1 ? '' : 's' }}</p>
      </div>

      <div class="rounded-2xl border border-line bg-surface p-5 shadow-soft transition-shadow hover:shadow-soft-lg">
        <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Categories</p>
        <p class="font-display text-3xl font-bold tabular-nums">{{ stats.categories.total }}</p>
        <p class="mt-1 text-xs text-muted">across all users</p>
      </div>

      <div class="col-span-2 rounded-2xl border border-line bg-surface p-5 shadow-soft transition-shadow hover:shadow-soft-lg">
        <div class="mb-2 flex items-center justify-between">
          <p class="text-xs font-medium uppercase tracking-wide text-muted">Todos</p>
          <span class="font-mono text-xs text-muted">{{ stats.todos.done }} / {{ stats.todos.total }} done</span>
        </div>
        <div class="flex items-end justify-between">
          <p class="font-display text-3xl font-bold tabular-nums">{{ completionPct }}%</p>
          <span class="text-xs text-muted">completion rate</span>
        </div>
        <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-sage/20">
          <div class="h-full rounded-full bg-sage-strong transition-all duration-300 ease-out" :style="{ width: `${completionPct}%` }" />
        </div>
      </div>

      <div class="rounded-2xl border border-line bg-surface p-5 shadow-soft transition-shadow hover:shadow-soft-lg">
        <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Points banked</p>
        <p class="font-display text-3xl font-bold tabular-nums">{{ stats.users.pointsBanked }}</p>
        <p class="mt-1 text-xs text-muted">held across all users</p>
      </div>

      <div class="rounded-2xl border border-line bg-surface p-5 shadow-soft transition-shadow hover:shadow-soft-lg">
        <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Points earned</p>
        <p class="font-display text-3xl font-bold tabular-nums">{{ stats.points.earned }}</p>
        <p class="mt-1 text-xs text-muted">lifetime, from completed todos</p>
      </div>

      <div class="rounded-2xl border border-line bg-surface p-5 shadow-soft transition-shadow hover:shadow-soft-lg">
        <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Points spent</p>
        <p class="font-display text-3xl font-bold tabular-nums">{{ stats.points.spent }}</p>
        <p class="mt-1 text-xs text-muted">lifetime, in the shop</p>
      </div>

      <NuxtLink
        to="/admin/redemptions"
        class="rounded-2xl border border-line bg-surface p-5 shadow-soft transition-shadow hover:shadow-soft-lg"
      >
        <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Redemptions</p>
        <p class="font-display text-3xl font-bold tabular-nums">{{ stats.redemptions.total }}</p>
        <p class="mt-1 text-xs" :class="stats.redemptions.pending > 0 ? 'font-semibold text-accent-strong' : 'text-muted'">
          {{ stats.redemptions.pending }} pending
        </p>
      </NuxtLink>

      <NuxtLink
        to="/admin/rewards"
        class="rounded-2xl border border-line bg-surface p-5 shadow-soft transition-shadow hover:shadow-soft-lg"
      >
        <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Rewards</p>
        <p class="font-display text-3xl font-bold tabular-nums">{{ stats.rewards.active }}</p>
        <p class="mt-1 text-xs text-muted">active of {{ stats.rewards.total }} total</p>
      </NuxtLink>
    </div>
  </div>
</template>
