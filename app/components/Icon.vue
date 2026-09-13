<script setup lang="ts">
defineProps<{
  name: 'checklist' | 'users' | 'gift' | 'receipt' | 'tag' | 'home' | 'heart' | 'star' | 'flag' | 'bolt' | 'calendar' | 'chevron-left' | 'chevron-right' | 'edit' | 'check' | 'eye' | 'eye-off' | 'coin' | 'close'
}>()
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'checklist'">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M8 12.5l2.5 2.5L16.5 9" />
    </template>
    <template v-else-if="name === 'users'">
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <circle cx="17" cy="9.5" r="2.2" />
      <path d="M15.7 13.6c2.4.5 4 2.3 4.3 5.4" />
    </template>
    <template v-else-if="name === 'gift'">
      <rect x="3.5" y="9" width="17" height="11" rx="1.5" />
      <path d="M3.5 9h17M12 9v11" />
      <path d="M12 9c-1.8 0-3.3-1.2-3.3-3s1.5-2.7 3-1.3c.2.2.3.4.3.6 0-.2.1-.4.3-.6 1.5-1.4 3-.5 3 1.3S13.8 9 12 9Z" />
    </template>
    <template v-else-if="name === 'receipt'">
      <path d="M6.5 3h11v17.5l-2.2-1.4-1.8 1.4-1.8-1.4-1.8 1.4-1.8-1.4-1.6 1.4V3Z" />
      <path d="M9 8.5h6M9 12.5h6" />
    </template>
    <template v-else-if="name === 'tag'">
      <path d="M11.5 3.5h5a2 2 0 0 1 2 2v5a2 2 0 0 1-.6 1.4l-8 8a2 2 0 0 1-2.8 0l-5-5a2 2 0 0 1 0-2.8l8-8a2 2 0 0 1 1.4-.6Z" />
      <circle cx="15.5" cy="7.5" r="1.25" />
    </template>
    <template v-else-if="name === 'home'">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5h12V10" />
      <path d="M10 19.5v-6h4v6" />
    </template>
    <template v-else-if="name === 'heart'">
      <path d="M12 20s-7.2-4.4-9.4-8.8C1.1 8 2.9 5 6 5c2 0 3.4 1.1 4 2.4C10.6 6.1 12 5 14 5c3.1 0 4.9 3 3.4 6.2C15.2 15.6 12 20 12 20Z" />
    </template>
    <template v-else-if="name === 'star'">
      <path d="M12 3.5l2.4 5.1 5.6.6-4.1 3.9 1.1 5.6L12 15.9l-4.9 2.8 1-5.6-4-3.9 5.5-.6L12 3.5Z" />
    </template>
    <template v-else-if="name === 'flag'">
      <path d="M5 20V4" />
      <path d="M5 5h11l-2.2 3.5L16 12H5" />
    </template>
    <template v-else-if="name === 'bolt'">
      <path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" />
    </template>
    <template v-else-if="name === 'calendar'">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </template>
    <template v-else-if="name === 'chevron-left'">
      <path d="M14.5 5 8 12l6.5 7" />
    </template>
    <template v-else-if="name === 'chevron-right'">
      <path d="M9.5 5 16 12l-6.5 7" />
    </template>
    <template v-else-if="name === 'edit'">
      <path d="M4 20.5l1-4.2L15.6 5.7a1.5 1.5 0 0 1 2.1 0l1.6 1.6a1.5 1.5 0 0 1 0 2.1L8.7 20l-4.2 1Z" />
      <path d="M13.5 7.5l3 3" />
    </template>
    <template v-else-if="name === 'check'">
      <path d="M5 13l4 4L19 7" />
    </template>
    <template v-else-if="name === 'eye'">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </template>
    <template v-else-if="name === 'eye-off'">
      <path d="M3 3l18 18" />
      <path d="M10 5.2c.6-.1 1.3-.2 2-.2 6.5 0 10 7 10 7a18 18 0 0 1-3.4 4.5" />
      <path d="M6.3 6.4C3.6 8.1 2 12 2 12s3.5 7 10 7c1.3 0 2.5-.3 3.6-.7" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </template>
    <template v-else-if="name === 'coin'">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.8" />
    </template>
    <template v-else-if="name === 'close'">
      <path d="M6 6l12 12M18 6L6 18" />
    </template>
  </svg>
</template>
