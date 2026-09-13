<script setup lang="ts">
import { CATEGORY_BG_COLORS, CATEGORY_BG_HEX, CATEGORY_BG_LABEL, type CategoryBgColor } from '../../shared/utils/categoryBgColors'

defineProps<{ modelValue: CategoryBgColor }>()
const emit = defineEmits<{ 'update:modelValue': [CategoryBgColor] }>()
</script>

<template>
  <div class="flex items-center gap-1.5">
    <button
      v-for="bgColor in CATEGORY_BG_COLORS"
      :key="bgColor"
      type="button"
      :aria-label="`Use ${CATEGORY_BG_LABEL[bgColor]} card background`"
      class="h-4 w-4 shrink-0 rounded-full border border-line/50 ring-offset-2 ring-offset-surface transition-all"
      :class="modelValue === bgColor ? 'ring-2 ring-ink' : 'opacity-70 hover:opacity-100'"
      :style="{ backgroundColor: CATEGORY_BG_HEX[bgColor] }"
      @click="emit('update:modelValue', bgColor)"
    />
  </div>
</template>
