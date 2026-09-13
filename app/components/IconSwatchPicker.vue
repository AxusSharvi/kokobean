<script setup lang="ts">
defineProps<{ modelValue: CategoryIconName }>()
const emit = defineEmits<{ 'update:modelValue': [CategoryIconName] }>()
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="icon in CATEGORY_ICONS"
      :key="icon"
      type="button"
      :aria-label="`Use ${icon} icon`"
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink transition-all"
      :class="modelValue === icon ? 'bg-sage/30 ring-1 ring-ink' : 'opacity-50 hover:bg-sage/15 hover:opacity-100'"
      @click="emit('update:modelValue', icon)"
    >
      <Icon :name="icon" class="h-5 w-5" />
    </button>
  </div>
</template>
