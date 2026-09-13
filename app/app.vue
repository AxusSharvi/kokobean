<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()
const router = useRouter()
const pointsBalance = usePointsBalance()

async function logout() {
  await clear()
  await router.push('/login')
}

watch(
  loggedIn,
  async (isLoggedIn) => {
    if (!isLoggedIn) return
    const data = await $fetch<{ pointsBalance: number }>('/api/board')
    pointsBalance.value = data.pointsBalance
  },
  { immediate: true }
)
</script>

<template>
  <div class="min-h-screen bg-canvas font-body text-ink">
    <header class="bg-sage-strong">
      <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-10 sm:py-4">
        <NuxtLink to="/" class="group flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-white">
          <BeanMark class="h-5 w-5 text-white transition-transform duration-200 group-hover:rotate-12" />
          kokobean
        </NuxtLink>
        <div v-if="loggedIn" class="flex items-baseline gap-1 text-white sm:hidden">
          <span class="font-display text-lg font-bold tabular-nums">{{ pointsBalance }}</span>
          <span class="text-xs text-white/70">KP</span>
        </div>
        <nav v-if="loggedIn" class="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1.5 font-body text-sm sm:w-auto sm:gap-6">
          <div class="order-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 sm:order-1 sm:gap-6">
            <NuxtLink
              to="/"
              class="border-b-2 border-transparent py-1 text-white/70 transition-colors hover:text-white"
              active-class="!border-accent font-semibold text-white"
              exact-active-class="!border-accent font-semibold text-white"
            >
              Todos
            </NuxtLink>
            <NuxtLink
              to="/wheel"
              class="border-b-2 border-transparent py-1 text-white/70 transition-colors hover:text-white"
              active-class="!border-accent font-semibold text-white"
            >
              Wheel
            </NuxtLink>
            <NuxtLink
              to="/history"
              class="border-b-2 border-transparent py-1 text-white/70 transition-colors hover:text-white"
              active-class="!border-accent font-semibold text-white"
            >
              History
            </NuxtLink>
            <NuxtLink
              v-if="user?.role === 'admin'"
              to="/admin"
              class="border-b-2 border-transparent py-1 text-white/70 transition-colors hover:text-white"
              active-class="!border-accent font-semibold text-white"
            >
              Admin
            </NuxtLink>
          </div>
          <span class="order-3 hidden h-4 w-px bg-white/25 sm:order-2 sm:block" />
          <span class="order-4 hidden text-white/70 sm:order-3 sm:inline">{{ user?.name }}</span>
          <button class="order-1 text-white/70 transition-colors hover:text-white sm:order-4" @click="logout">
            Log out
          </button>
        </nav>
      </div>
    </header>
    <main class="px-4 py-8 sm:px-10 sm:py-10">
      <NuxtPage />
    </main>
    <ConfirmModal />
  </div>
</template>
