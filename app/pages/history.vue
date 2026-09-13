<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface PointTransaction {
  id: number
  delta: number
  reason: string
  createdAt: string
}

const pointsBalance = usePointsBalance()
const transactions = ref<PointTransaction[]>([])
const loading = ref(true)

function formatDateTime(value: string) {
  const date = new Date(value)
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

onMounted(async () => {
  const [board, history] = await Promise.all([
    $fetch<{ pointsBalance: number }>('/api/board'),
    $fetch<PointTransaction[]>('/api/point-transactions')
  ])
  pointsBalance.value = board.pointsBalance
  transactions.value = history
  loading.value = false
})
</script>

<template>
  <div>
    <div class="mb-8 flex items-start justify-between gap-4 animate-fade-up">
      <div>
        <h1 class="font-display text-2xl font-semibold">History</h1>
        <p class="mt-0.5 text-sm text-muted">Every KP earned and spent, in order.</p>
      </div>
      <div class="hidden shrink-0 items-baseline gap-1.5 pt-1 sm:flex">
        <span class="font-display text-2xl font-bold tabular-nums">{{ pointsBalance }}</span>
        <span class="text-xs text-muted">KP</span>
      </div>
    </div>

    <div v-if="loading" class="text-muted">
      Loading…
    </div>

    <div v-else>
      <p v-if="transactions.length === 0" class="text-sm text-muted">
        No activity yet — complete a todo to earn your first KP.
      </p>

      <ul v-else class="divide-y divide-line/60 rounded-2xl border border-line bg-surface shadow-soft">
        <li
          v-for="t in transactions"
          :key="t.id"
          class="flex items-center justify-between gap-4 px-5 py-3.5"
        >
          <div class="min-w-0">
            <p class="truncate text-sm">{{ t.reason }}</p>
            <p class="text-xs text-muted">{{ formatDateTime(t.createdAt) }}</p>
          </div>
          <span
            class="shrink-0 font-mono text-sm font-semibold tabular-nums"
            :class="t.delta >= 0 ? 'text-sage-strong' : 'text-accent-strong'"
          >
            {{ t.delta >= 0 ? '+' : '' }}{{ t.delta }} KP
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
