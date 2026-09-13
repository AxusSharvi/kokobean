<script setup lang="ts">
defineProps<{ checked: boolean }>()
const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :aria-checked="checked"
    class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150"
    :class="checked ? 'border-sage-strong bg-sage-strong' : 'border-line bg-surface hover:border-sage-strong'"
    @click="emit('toggle')"
  >
    <svg
      v-if="checked"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-3 w-3 animate-pop"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  </button>
</template>
