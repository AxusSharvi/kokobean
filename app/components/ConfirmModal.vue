<script setup lang="ts">
const state = useConfirmModalState()

function onConfirm() {
  resolveConfirmModal(true)
}

function onCancel() {
  resolveConfirmModal(false)
}

function onKeydown(event: KeyboardEvent) {
  if (!state.open) return
  if (event.key === 'Escape') onCancel()
  if (event.key === 'Enter') onConfirm()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="state.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-ink/40" @click="onCancel" />
        <div class="relative w-full max-w-sm animate-pop rounded-2xl border border-line bg-surface p-6 shadow-soft-lg">
          <h2 class="font-display text-lg font-semibold text-ink">{{ state.title }}</h2>
          <p class="mt-2 text-sm text-muted">{{ state.message }}</p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              class="rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink transition-all duration-150 hover:bg-canvas active:scale-[0.97]"
              @click="onCancel"
            >
              {{ state.cancelText }}
            </button>
            <button
              class="rounded-xl px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
              :class="state.danger ? 'bg-accent-strong' : 'bg-sage-strong'"
              @click="onConfirm"
            >
              {{ state.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
