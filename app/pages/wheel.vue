<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const STORAGE_KEY = 'kokobean-wheel-options'
const WINNERS_KEY = 'kokobean-wheel-winners'
const SPIN_MIN_MS = 7000
const SPIN_MAX_MS = 14000

const SLICE_COLORS = ['#A5AF79', '#9E5434', '#6E7C46', '#FFD6BA', '#FFE8CD', '#CDBBA7', '#E8A07C', '#FFF2EB']

const words = ref<string[]>([])
const winners = ref<string[]>([])
const newWord = ref('')
const rotation = ref(0)
const spinning = ref(false)
const winner = ref<string | null>(null)
const spinDurationMs = ref(SPIN_MIN_MS)
const confirm = useConfirm()

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) words.value = JSON.parse(saved)
  } catch {
    words.value = []
  }
  try {
    const savedWinners = localStorage.getItem(WINNERS_KEY)
    if (savedWinners) winners.value = JSON.parse(savedWinners)
  } catch {
    winners.value = []
  }
})

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words.value))
  } catch {
    // ignore storage errors (private browsing, quota, etc.)
  }
}

function persistWinners() {
  try {
    localStorage.setItem(WINNERS_KEY, JSON.stringify(winners.value))
  } catch {
    // ignore storage errors (private browsing, quota, etc.)
  }
}

function addWord() {
  const value = newWord.value.trim()
  if (!value) return
  words.value.push(value)
  newWord.value = ''
  winner.value = null
  persist()
}

function removeWord(index: number) {
  words.value.splice(index, 1)
  winner.value = null
  persist()
}

async function clearAll() {
  if (!(await confirm('Remove all words from the wheel?', { title: 'Clear all words', confirmText: 'Clear all' }))) return
  words.value = []
  winner.value = null
  persist()
}

async function clearWinners() {
  if (!(await confirm('Clear the winners list?', { title: 'Clear winners', confirmText: 'Clear' }))) return
  winners.value = []
  persistWinners()
}

const sliceAngle = computed(() => (words.value.length > 0 ? 360 / words.value.length : 0))

const slices = computed(() => {
  return words.value.map((label, i) => {
    const startAngle = i * sliceAngle.value
    const endAngle = startAngle + sliceAngle.value
    const midAngle = (startAngle + endAngle) / 2
    return {
      label,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
      path: slicePath(startAngle, endAngle),
      labelTransform: `translate(150,150) rotate(${midAngle - 90}) translate(${words.value.length === 1 ? 0 : 100},0)`
    }
  })
})

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function slicePath(startAngle: number, endAngle: number) {
  const cx = 150
  const cy = 150
  const r = 146
  if (endAngle - startAngle >= 360) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`
  }
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

async function spin() {
  if (spinning.value || words.value.length === 0) return
  spinning.value = true
  winner.value = null

  const duration = Math.round(SPIN_MIN_MS + Math.random() * (SPIN_MAX_MS - SPIN_MIN_MS))
  spinDurationMs.value = duration

  const winnerIndex = Math.floor(Math.random() * words.value.length)
  const sliceStart = winnerIndex * sliceAngle.value
  const jitter = (Math.random() - 0.5) * sliceAngle.value * 0.7
  const targetCenter = sliceStart + sliceAngle.value / 2 + jitter

  const desiredMod = (360 - targetCenter + 360) % 360
  const currentMod = rotation.value % 360
  const delta = (desiredMod - currentMod + 360) % 360
  const extraSpins = Math.round(duration / 700) * 360

  rotation.value += extraSpins + delta

  await new Promise((resolve) => setTimeout(resolve, duration))
  const chosen = words.value[winnerIndex] ?? null
  winner.value = chosen
  if (chosen !== null) {
    winners.value.push(chosen)
    persistWinners()
    words.value.splice(winnerIndex, 1)
    persist()
  }
  spinning.value = false
}
</script>

<template>
  <div>
    <div class="mb-8 animate-fade-up">
      <h1 class="font-display text-2xl font-semibold">Wheel</h1>
      <p class="mt-0.5 text-sm text-muted">Add your options, spin, and let it decide.</p>
    </div>

    <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div class="flex flex-col items-center gap-6">
        <div class="relative w-full max-w-sm">
          <div class="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
            <svg width="28" height="24" viewBox="0 0 28 24">
              <path d="M14 24 L1 2 L27 2 Z" fill="#9E5434" stroke="#FFEED6" stroke-width="1.5" />
            </svg>
          </div>
          <svg
            viewBox="0 0 300 300"
            class="w-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
            :style="{ transform: `rotate(${rotation}deg)`, transition: spinning ? `transform ${spinDurationMs}ms cubic-bezier(0.13,0.72,0.24,1)` : 'none' }"
          >
            <circle cx="150" cy="150" r="146" fill="#FFEED6" />
            <template v-if="slices.length > 0">
              <path
                v-for="(slice, i) in slices"
                :key="i"
                :d="slice.path"
                :fill="slice.color"
                stroke="#FFEED6"
                stroke-width="2"
              />
              <text
                v-for="(slice, i) in slices"
                :key="`label-${i}`"
                :transform="slice.labelTransform"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="#3f3626"
                font-size="13"
                font-weight="600"
                font-family="Karla, sans-serif"
              >
                {{ slice.label.length > 14 ? `${slice.label.slice(0, 13)}…` : slice.label }}
              </text>
            </template>
            <circle cx="150" cy="150" r="146" fill="none" stroke="#A5AF79" stroke-width="3" />
          </svg>
          <div class="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sage bg-surface shadow-soft" />
        </div>

        <button
          class="rounded-xl bg-accent-strong px-8 py-3 font-medium text-white transition-all duration-150 hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="spinning || words.length === 0"
          @click="spin"
        >
          {{ spinning ? 'Spinning…' : words.length === 0 ? 'Add words to spin' : 'Spin the wheel' }}
        </button>

        <div v-if="winner" :key="winner" class="animate-pop rounded-2xl border border-line bg-surface px-6 py-4 text-center shadow-soft">
          <p class="text-xs uppercase tracking-wide text-muted">Result</p>
          <p class="font-display text-2xl font-semibold text-ink">{{ winner }}</p>
        </div>
      </div>

      <div class="animate-fade-up">
        <form class="mb-3 flex gap-2" @submit.prevent="addWord">
          <input
            v-model="newWord"
            placeholder="Add a word or option"
            class="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm shadow-soft transition-shadow placeholder:text-muted/60 focus:shadow-soft-lg"
          >
          <button class="shrink-0 rounded-xl bg-sage-strong px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:brightness-110 active:scale-[0.97]">
            Add
          </button>
        </form>

        <p v-if="words.length === 0" class="text-sm text-muted">
          No words yet — add a few above to build your wheel.
        </p>

        <TransitionGroup v-else name="list" tag="ul" class="relative divide-y divide-line/60 rounded-2xl border border-line bg-surface shadow-soft">
          <li
            v-for="(word, i) in words"
            :key="word + i"
            class="flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <span class="flex min-w-0 items-center gap-2 text-sm">
              <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: SLICE_COLORS[i % SLICE_COLORS.length] }" />
              <span class="truncate">{{ word }}</span>
            </span>
            <button class="shrink-0 text-muted transition-colors hover:text-ink" @click="removeWord(i)">
              <Icon name="close" class="h-4 w-4" />
            </button>
          </li>
        </TransitionGroup>

        <button
          v-if="words.length > 0"
          class="mt-3 text-xs text-muted transition-colors hover:text-ink hover:underline"
          @click="clearAll"
        >
          Clear all
        </button>
      </div>
    </div>

    <div v-if="winners.length > 0" class="mt-10 animate-fade-up">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="font-display text-lg font-semibold">Winners</h2>
        <button class="text-xs text-muted transition-colors hover:text-ink hover:underline" @click="clearWinners">
          Clear winners
        </button>
      </div>
      <TransitionGroup name="list" tag="ol" class="relative max-w-sm divide-y divide-line/60 rounded-2xl border border-line bg-surface shadow-soft">
        <li
          v-for="(w, i) in winners"
          :key="i"
          class="flex items-center gap-3 px-4 py-2.5"
        >
          <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage/20 font-mono text-xs font-semibold text-ink">
            {{ i + 1 }}
          </span>
          <span class="truncate text-sm">{{ w }}</span>
        </li>
      </TransitionGroup>
    </div>
  </div>
</template>
