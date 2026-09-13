<script setup lang="ts">
defineOptions({ inheritAttrs: false })
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [string] }>()

const visible = ref(false)
</script>

<template>
  <div class="relative">
    <input
      :type="visible ? 'text' : 'password'"
      :value="modelValue"
      v-bind="$attrs"
      class="w-full rounded-lg border border-line bg-canvas px-3 py-2 pr-10 text-ink transition-shadow placeholder:text-muted/60 focus:shadow-soft"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <button
      type="button"
      tabindex="-1"
      class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink"
      @click="visible = !visible"
    >
      <Icon :name="visible ? 'eye-off' : 'eye'" class="h-4 w-4" />
    </button>
  </div>
</template>
