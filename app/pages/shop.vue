<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface Reward {
  id: number
  name: string
  description: string | null
  cost: number
  stock: number | null
  isActive: boolean
}
interface Redemption {
  id: number
  status: 'pending' | 'fulfilled' | 'rejected'
  createdAt: string
  reward: Reward
}

const pointsBalance = usePointsBalance()
const rewards = ref<Reward[]>([])
const redemptions = ref<Redemption[]>([])
const loading = ref(true)
const redeemingId = ref<number | null>(null)
const error = ref('')

async function loadAll() {
  const [board, rewardList, redemptionList] = await Promise.all([
    $fetch<{ pointsBalance: number }>('/api/board'),
    $fetch<Reward[]>('/api/rewards'),
    $fetch<Redemption[]>('/api/redemptions')
  ])
  pointsBalance.value = board.pointsBalance
  rewards.value = rewardList
  redemptions.value = redemptionList
}

async function redeem(reward: Reward) {
  error.value = ''
  redeemingId.value = reward.id
  try {
    await $fetch('/api/redemptions', { method: 'POST', body: { rewardId: reward.id } })
    await loadAll()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Could not redeem this reward'
  } finally {
    redeemingId.value = null
  }
}

const statusStyle: Record<string, string> = {
  pending: 'bg-accent/20 text-ink',
  fulfilled: 'bg-sage/25 text-ink',
  rejected: 'border border-line text-muted'
}

onMounted(async () => {
  await loadAll()
  loading.value = false
})
</script>

<template>
  <div>
    <div class="mb-8 flex items-start justify-between gap-4 animate-fade-up">
      <div>
        <h1 class="font-display text-2xl font-semibold">Shop</h1>
        <p class="mt-0.5 text-sm text-muted">Trade your KP for something good.</p>
      </div>
      <div class="hidden shrink-0 items-baseline gap-1.5 pt-1 sm:flex">
        <span class="font-display text-2xl font-bold tabular-nums">{{ pointsBalance }}</span>
        <span class="text-xs text-muted">KP</span>
      </div>
    </div>

    <div v-if="loading" class="text-muted">
      Loading…
    </div>

    <div v-else class="space-y-10">
      <p v-if="error" class="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink">{{ error }}</p>

      <div v-if="rewards.length === 0" class="text-sm text-muted">
        No rewards available yet — check back later.
      </div>

      <TransitionGroup v-else name="list" tag="div" class="relative grid gap-4 sm:grid-cols-2">
        <div
          v-for="reward in rewards"
          :key="reward.id"
          class="flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-soft transition-shadow duration-200 hover:shadow-soft-lg"
        >
          <h3 class="font-display font-semibold">{{ reward.name }}</h3>
          <p v-if="reward.description" class="mt-1 flex-1 text-sm text-muted">{{ reward.description }}</p>
          <div class="mt-4 flex items-center justify-between text-sm">
            <span class="font-mono font-bold text-ink">{{ reward.cost }} KP</span>
            <span v-if="reward.stock != null" class="text-xs text-muted">{{ reward.stock }} left</span>
          </div>
          <button
            class="mt-3 rounded-xl bg-accent-strong px-3 py-2 text-sm font-medium text-white transition-all duration-150 hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100 disabled:active:scale-100"
            :disabled="redeemingId === reward.id || pointsBalance < reward.cost || (reward.stock != null && reward.stock <= 0)"
            @click="redeem(reward)"
          >
            {{ redeemingId === reward.id ? 'Redeeming…' : 'Redeem' }}
          </button>
        </div>
      </TransitionGroup>

      <div>
        <h2 class="mb-3 font-display text-lg font-semibold">Your redemptions</h2>
        <p v-if="redemptions.length === 0" class="text-sm text-muted">No redemptions yet.</p>
        <TransitionGroup v-else name="list" tag="ul" class="relative divide-y divide-line/60 rounded-2xl border border-line bg-surface shadow-soft">
          <li
            v-for="r in redemptions"
            :key="r.id"
            class="flex items-center justify-between gap-3 px-4 py-3"
          >
            <span class="min-w-0 truncate text-sm">{{ r.reward.name }}</span>
            <span class="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium" :class="statusStyle[r.status]">
              {{ r.status }}
            </span>
          </li>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>
