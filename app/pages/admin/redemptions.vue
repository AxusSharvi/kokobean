<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

interface Redemption {
  id: number
  status: 'pending' | 'fulfilled' | 'rejected'
  createdAt: string
  reward: { name: string; cost: number }
  user: { name: string; email: string }
}

const redemptions = ref<Redemption[]>([])
const loading = ref(true)
const resolvingId = ref<number | null>(null)

async function load() {
  redemptions.value = await $fetch<Redemption[]>('/api/admin/redemptions')
}

async function resolve(id: number, status: 'fulfilled' | 'rejected') {
  resolvingId.value = id
  try {
    await $fetch(`/api/admin/redemptions/${id}`, { method: 'PATCH', body: { status } })
    await load()
  } finally {
    resolvingId.value = null
  }
}

const statusStyle: Record<string, string> = {
  pending: 'bg-accent/20 text-ink',
  fulfilled: 'bg-sage/25 text-ink',
  rejected: 'border border-line text-muted'
}

onMounted(async () => {
  await load()
  loading.value = false
})
</script>

<template>
  <div class="animate-fade-up">
    <h1 class="mb-6 font-display text-2xl font-semibold">Admin</h1>
    <nav class="mb-6 flex flex-wrap gap-x-6 gap-y-1 border-b border-line text-sm">
      <NuxtLink to="/admin" class="border-b-2 border-transparent pb-3 text-muted transition-colors hover:text-ink">Overview</NuxtLink>
      <NuxtLink to="/admin/users" class="border-b-2 border-transparent pb-3 text-muted transition-colors hover:text-ink">Users</NuxtLink>
      <NuxtLink to="/admin/rewards" class="border-b-2 border-transparent pb-3 text-muted transition-colors hover:text-ink">Rewards</NuxtLink>
      <NuxtLink to="/admin/redemptions" class="border-b-2 border-accent-strong pb-3 font-medium text-ink transition-colors">Redemptions</NuxtLink>
    </nav>

    <div v-if="loading" class="text-muted">Loading…</div>
    <TransitionGroup v-else name="list" tag="ul" class="relative divide-y divide-line/60 rounded-2xl border border-line bg-surface shadow-soft">
      <li
        v-for="r in redemptions"
        :key="r.id"
        class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3.5"
      >
        <div class="min-w-0">
          <p class="truncate font-medium">{{ r.reward.name }} <span class="font-mono text-xs text-muted">· {{ r.reward.cost }} KP</span></p>
          <p class="truncate text-xs text-muted">{{ r.user.name }} ({{ r.user.email }})</p>
        </div>
        <div class="flex shrink-0 items-center gap-3">
          <span class="rounded-full px-2.5 py-0.5 text-xs font-medium" :class="statusStyle[r.status]">
            {{ r.status }}
          </span>
          <template v-if="r.status === 'pending'">
            <button
              class="rounded-lg bg-sage-strong px-2.5 py-1 text-xs font-medium text-white transition-all duration-150 hover:brightness-110 active:scale-[0.97] disabled:opacity-40"
              :disabled="resolvingId === r.id"
              @click="resolve(r.id, 'fulfilled')"
            >
              Fulfill
            </button>
            <button
              class="rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-muted transition-all duration-150 hover:text-ink active:scale-[0.97] disabled:opacity-40"
              :disabled="resolvingId === r.id"
              @click="resolve(r.id, 'rejected')"
            >
              Reject
            </button>
          </template>
        </div>
      </li>
      <li v-if="redemptions.length === 0" class="px-5 py-3.5 text-sm text-muted">No redemptions yet.</li>
    </TransitionGroup>
  </div>
</template>
