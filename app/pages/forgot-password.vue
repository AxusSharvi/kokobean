<script setup lang="ts">
const email = ref('')
const loading = ref(false)
const submitted = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })
  } finally {
    loading.value = false
    submitted.value = true
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm animate-fade-up rounded-2xl border border-line bg-surface p-6 shadow-soft sm:p-8">
    <BeanMark class="mb-4 h-8 w-8 text-accent-strong" />

    <template v-if="submitted">
      <h1 class="mb-1 font-display text-2xl font-semibold">Check your email</h1>
      <p class="text-sm text-muted">
        If an account exists for <strong class="text-ink">{{ email }}</strong>, we've sent a link to reset your password. It'll expire in an hour.
      </p>
    </template>
    <template v-else>
      <h1 class="mb-1 font-display text-2xl font-semibold">Forgot your password?</h1>
      <p class="mb-8 text-sm text-muted">Enter your email and we'll send you a reset link.</p>

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
        <button
          :disabled="loading"
          class="w-full rounded-lg bg-accent-strong px-4 py-2.5 font-medium text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          {{ loading ? 'Sending…' : 'Send reset link' }}
        </button>
      </form>
    </template>

    <p class="mt-6 text-sm text-muted">
      <NuxtLink to="/login" class="font-medium text-accent-strong hover:underline">Back to log in</NuxtLink>
    </p>
  </div>
</template>
