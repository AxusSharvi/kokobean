<script setup lang="ts">
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const { fetch: refreshSession } = useUserSession()
const router = useRouter()

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    await refreshSession()
    await router.push('/')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm animate-fade-up rounded-2xl border border-line bg-surface p-6 shadow-soft sm:p-8">
    <BeanMark class="mb-4 h-8 w-8 text-accent-strong" />
    <h1 class="mb-1 font-display text-2xl font-semibold">Welcome back</h1>
    <p class="mb-8 text-sm text-muted">Log in to keep tracking your points.</p>

    <form class="space-y-5" @submit.prevent="onSubmit">
      <div>
        <label class="block text-sm font-medium">Email</label>
        <input
          v-model="email"
          type="email"
          required
          class="mt-1.5 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-ink transition-shadow placeholder:text-muted/60 focus:shadow-soft"
        >
      </div>
      <div>
        <div class="flex items-center justify-between">
          <label class="block text-sm font-medium">Password</label>
          <NuxtLink to="/forgot-password" class="text-xs text-accent-strong hover:underline">Forgot password?</NuxtLink>
        </div>
        <PasswordInput v-model="password" required class="mt-1.5" />
      </div>
      <p v-if="error" class="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink">{{ error }}</p>
      <button
        :disabled="loading"
        class="w-full rounded-lg bg-accent-strong px-4 py-2.5 font-medium text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {{ loading ? 'Logging in…' : 'Log in' }}
      </button>
    </form>
    <p class="mt-6 text-sm text-muted">
      No account yet? <NuxtLink to="/register" class="font-medium text-accent-strong hover:underline">Sign up</NuxtLink>
    </p>
  </div>
</template>
