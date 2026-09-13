<script setup lang="ts">
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const open = ref(false)
const trigger = ref<HTMLElement | null>(null)
const popover = ref<HTMLElement | null>(null)
const popoverStyle = ref({ top: '0px', left: '0px' })

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const today = new Date()
const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth())

function parseSelected(): Date | null {
  if (!props.modelValue) return null
  const d = new Date(`${props.modelValue}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

watch(
  () => props.modelValue,
  (value) => {
    const d = value ? new Date(`${value}T00:00:00`) : null
    if (d && !Number.isNaN(d.getTime())) {
      viewYear.value = d.getFullYear()
      viewMonth.value = d.getMonth()
    }
  },
  { immediate: true }
)

const cells = computed(() => {
  const firstWeekday = new Date(viewYear.value, viewMonth.value, 1).getDay()
  const totalDays = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const arr: Array<number | null> = []
  for (let i = 0; i < firstWeekday; i++) arr.push(null)
  for (let d = 1; d <= totalDays; d++) arr.push(d)
  return arr
})

function toISO(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isSelected(day: number) {
  const sel = parseSelected()
  return !!sel && sel.getFullYear() === viewYear.value && sel.getMonth() === viewMonth.value && sel.getDate() === day
}

function isToday(day: number) {
  return today.getFullYear() === viewYear.value && today.getMonth() === viewMonth.value && today.getDate() === day
}

function pick(day: number) {
  emit('update:modelValue', toISO(viewYear.value, viewMonth.value, day))
  open.value = false
}

function clear() {
  emit('update:modelValue', '')
  open.value = false
}

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value -= 1
  } else {
    viewMonth.value -= 1
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value += 1
  } else {
    viewMonth.value += 1
  }
}

const displayLabel = computed(() => {
  const sel = parseSelected()
  if (!sel) return ''
  return sel.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

// the popover is teleported to <body> so it can't be clipped by a
// scrolling/overflow-hidden ancestor (e.g. the todo table's rounded corners) --
// position it with fixed coordinates computed from the trigger button instead,
// clamped to the viewport so it never runs off-screen on narrow phones
function updatePosition() {
  if (!trigger.value) return
  const rect = trigger.value.getBoundingClientRect()
  const margin = 8
  const popoverWidth = popover.value?.offsetWidth ?? 256
  const popoverHeight = popover.value?.offsetHeight ?? 320

  let left = rect.left
  left = Math.min(left, window.innerWidth - popoverWidth - margin)
  left = Math.max(left, margin)

  let top = rect.bottom + 8
  if (top + popoverHeight + margin > window.innerHeight) {
    top = rect.top - popoverHeight - 8
  }
  top = Math.max(top, margin)

  popoverStyle.value = { top: `${top}px`, left: `${left}px` }
}

function toggleOpen() {
  open.value = !open.value
  if (open.value) nextTick(updatePosition)
}

function onDocumentMousedown(event: MouseEvent) {
  const target = event.target as Node
  if (trigger.value?.contains(target)) return
  if (popover.value?.contains(target)) return
  open.value = false
}

watch(open, (isOpen) => {
  if (isOpen) {
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
  } else {
    window.removeEventListener('scroll', updatePosition, true)
    window.removeEventListener('resize', updatePosition)
  }
})

onMounted(() => document.addEventListener('mousedown', onDocumentMousedown))
onUnmounted(() => {
  document.removeEventListener('mousedown', onDocumentMousedown)
  window.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
})
</script>

<template>
  <div class="inline-block">
    <button
      ref="trigger"
      type="button"
      class="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-line bg-canvas p-2 text-sm transition-shadow focus:shadow-soft sm:justify-start sm:px-2.5 sm:py-1.5"
      :class="displayLabel ? 'text-ink' : 'text-muted/70'"
      @click="toggleOpen"
    >
      <Icon name="calendar" class="h-3.5 w-3.5 shrink-0 text-muted" />
      <span class="hidden sm:inline">{{ displayLabel || 'Due date' }}</span>
    </button>

    <Teleport to="body">
      <div
        v-if="open"
        ref="popover"
        class="fixed z-50 w-64 rounded-xl border border-line bg-surface p-3 shadow-soft-lg"
        :style="popoverStyle"
      >
        <div class="mb-2 flex items-center justify-between">
          <button type="button" class="rounded-md p-1 text-muted transition-colors hover:bg-sage/15 hover:text-ink" @click="prevMonth">
            <Icon name="chevron-left" class="h-4 w-4" />
          </button>
          <span class="font-display text-sm font-semibold">{{ MONTH_NAMES[viewMonth] }} {{ viewYear }}</span>
          <button type="button" class="rounded-md p-1 text-muted transition-colors hover:bg-sage/15 hover:text-ink" @click="nextMonth">
            <Icon name="chevron-right" class="h-4 w-4" />
          </button>
        </div>
        <div class="mb-1 grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">
          <span v-for="d in WEEKDAYS" :key="d">{{ d }}</span>
        </div>
        <div class="grid grid-cols-7 gap-y-1 text-center text-sm">
          <template v-for="(day, i) in cells" :key="i">
            <button
              v-if="day"
              type="button"
              class="mx-auto flex h-7 w-7 items-center justify-center rounded-full transition-colors"
              :class="[
                isSelected(day) ? 'bg-accent-strong text-white' : 'text-ink hover:bg-sage/15',
                isToday(day) && !isSelected(day) ? 'ring-1 ring-sage-strong' : ''
              ]"
              @click="pick(day)"
            >
              {{ day }}
            </button>
            <span v-else />
          </template>
        </div>
        <button
          v-if="modelValue"
          type="button"
          class="mt-2 w-full text-center text-xs text-muted transition-colors hover:text-ink hover:underline"
          @click="clear"
        >
          Clear date
        </button>
      </div>
    </Teleport>
  </div>
</template>
