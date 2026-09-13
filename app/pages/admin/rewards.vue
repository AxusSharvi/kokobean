<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

interface Reward {
  id: number
  name: string
  description: string | null
  cost: number
  stock: number | null
  isActive: boolean
}

const rewards = ref<Reward[]>([])
const loading = ref(true)
const error = ref('')

const form = reactive({ name: '', description: '', cost: 50, stock: null as number | null })
const confirm = useConfirm()

async function load() {
  rewards.value = await $fetch<Reward[]>('/api/rewards')
}

async function createReward() {
  error.value = ''
  if (!form.name.trim() || !form.cost) return
  try {
    await $fetch('/api/rewards', {
      method: 'POST',
      body: { name: form.name, description: form.description || undefined, cost: form.cost, stock: form.stock }
    })
    form.name = ''
    form.description = ''
    form.cost = 50
    form.stock = null
    await load()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Could not create reward'
  }
}

async function toggleActive(reward: Reward) {
  await $fetch(`/api/rewards/${reward.id}`, { method: 'PATCH', body: { isActive: !reward.isActive } })
  await load()
}

async function deleteReward(reward: Reward) {
  error.value = ''
  if (!(await confirm(`Delete "${reward.name}"?`, { title: 'Delete reward', confirmText: 'Delete' }))) return
  try {
    await $fetch(`/api/rewards/${reward.id}`, { method: 'DELETE' })
    await load()
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Could not delete reward'
  }
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
      <NuxtLink to="/admin/rewards" class="border-b-2 border-accent-strong pb-3 font-medium text-ink transition-colors">Rewards</NuxtLink>
      <NuxtLink to="/admin/redemptions" class="border-b-2 border-transparent pb-3 text-muted transition-colors hover:text-ink">Redemptions</NuxtLink>
    </nav>

    <form class="mb-6 grid gap-2 rounded-2xl border border-line bg-surface p-4 shadow-soft sm:grid-cols-5" @submit.prevent="createReward">
      <input v-model="form.name" placeholder="Reward name" class="rounded-lg border border-line bg-canvas px-3 py-2 text-sm transition-shadow placeholder:text-muted/60 focus:shadow-soft sm:col-span-2">
      <input v-model="form.description" placeholder="Description (optional)" class="rounded-lg border border-line bg-canvas px-3 py-2 text-sm transition-shadow placeholder:text-muted/60 focus:shadow-soft sm:col-span-2">
      <input v-model.number="form.cost" type="number" min="1" placeholder="Cost" class="rounded-lg border border-line bg-canvas px-3 py-2 text-sm transition-shadow placeholder:text-muted/60 focus:shadow-soft">
      <input v-model.number="form.stock" type="number" min="0" placeholder="Stock (blank = unlimited)" class="rounded-lg border border-line bg-canvas px-3 py-2 text-sm transition-shadow placeholder:text-muted/60 focus:shadow-soft sm:col-span-2">
      <button class="rounded-lg bg-accent-strong px-3 py-2 text-sm font-medium text-white transition-all duration-150 hover:brightness-110 active:scale-[0.97] sm:col-span-3">
        Add reward
      </button>
    </form>

    <p v-if="error" class="mb-4 rounded-xl border border-line bg-canvas px-3 py-2 text-sm text-ink">{{ error }}</p>

    <div v-if="loading" class="text-muted">Loading…</div>
    <TransitionGroup v-else name="list" tag="ul" class="relative divide-y divide-line/60 rounded-2xl border border-line bg-surface shadow-soft">
      <li
        v-for="reward in rewards"
        :key="reward.id"
        class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3.5"
      >
        <div class="min-w-0">
          <p class="truncate font-medium" :class="{ 'text-muted': !reward.isActive }">{{ reward.name }}</p>
          <p class="text-xs text-muted">
            <span class="font-mono">{{ reward.cost }} KP</span> · {{ reward.stock == null ? 'unlimited stock' : `${reward.stock} left` }}
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-4 text-sm">
          <button class="text-muted transition-colors hover:text-accent-strong" @click="toggleActive(reward)">
            {{ reward.isActive ? 'Deactivate' : 'Activate' }}
          </button>
          <button class="text-muted transition-colors hover:text-ink hover:underline" @click="deleteReward(reward)">
            Delete
          </button>
        </div>
      </li>
      <li v-if="rewards.length === 0" class="px-5 py-3.5 text-sm text-muted">No rewards yet.</li>
    </TransitionGroup>
  </div>
</template>
