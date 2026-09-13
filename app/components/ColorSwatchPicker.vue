<script setup lang="ts">
defineProps<{ modelValue: CategoryColor }>()
const emit = defineEmits<{ 'update:modelValue': [CategoryColor] }>()

const DOT_CLASS: Record<CategoryColor, string> = {
  sage: 'bg-sage-strong',
  terracotta: 'bg-accent-strong',
  brown: 'bg-muted'
}
</script>

<template>
  <div class="flex items-center gap-1.5">
    <button
      v-for="color in CATEGORY_COLORS"
      :key="color"
      type="button"
      :aria-label="`Use ${color} color`"
      class="h-4 w-4 shrink-0 rounded-full ring-offset-2 ring-offset-surface transition-all"
      :class="[DOT_CLASS[color], modelValue === color ? 'ring-2 ring-ink' : 'opacity-60 hover:opacity-100']"
      @click="emit('update:modelValue', color)"
    />
  </div>
</template>
