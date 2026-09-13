<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { fetch: refreshSession } = useUserSession()

const token = computed(() => String(route.query.token || ''))
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  error.value = ''

  if (!token.value) {
    error.value = 'This reset link is missing its token.'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = "Passwords don't match."
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { token: token.value, password: password.value }
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
    <h1 class="mb-1 font-display text-2xl font-semibold">Choose a new password</h1>
    <p class="mb-8 text-sm text-muted">Make it at least 8 characters.</p>

    <form class="space-y-5" @submit.prevent="onSubmit">
      <div>
        <label class="block text-sm font-medium">New password</label>
        <PasswordInput v-model="password" required minlength="8" class="mt-1.5" />
      </div>
      <div>
        <label class="block text-sm font-medium">Confirm password</label>
        <PasswordInput v-model="confirmPassword" required minlength="8" class="mt-1.5" />
      </div>
      <p v-if="error" class="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink">{{ error }}</p>
      <button
        :disabled="loading"
        class="w-full rounded-lg bg-accent-strong px-4 py-2.5 font-medium text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {{ loading ? 'Saving…' : 'Reset password' }}
      </button>
    </form>
    <p class="mt-6 text-sm text-muted">
      <NuxtLink to="/login" class="font-medium text-accent-strong hover:underline">Back to log in</NuxtLink>
    </p>
  </div>
</template>
