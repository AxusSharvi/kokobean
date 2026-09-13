<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

interface Todo {
  id: number
  title: string
  pointsValue: number
  isDone: boolean
  dueDate: string | null
}
interface Category {
  id: number
  name: string
  color: CategoryColor
  icon: CategoryIconName
  bgColor: CategoryBgColor
  todos: Todo[]
}

const pointsBalance = usePointsBalance()
const categories = ref<Category[]>([])
const loading = ref(true)
const newCategoryName = ref('')
const newCategoryColor = ref<CategoryColor>('sage')
const newCategoryIcon = ref<CategoryIconName>('checklist')
const newCategoryBgColor = ref<CategoryBgColor>('none')
const newTodoTitle = ref<Record<number, string>>({})
const newTodoDueDate = ref<Record<number, string>>({})

const COLOR_STYLES: Record<CategoryColor, { icon: string; bar: string; track: string; pill: string; head: string }> = {
  sage: { icon: 'text-sage-strong', bar: 'bg-sage-strong', track: 'bg-sage/20', pill: 'bg-sage/20 text-ink', head: 'bg-sage/15' },
  terracotta: { icon: 'text-accent-strong', bar: 'bg-accent-strong', track: 'bg-accent/20', pill: 'bg-accent/20 text-ink', head: 'bg-accent/15' },
  brown: { icon: 'text-muted', bar: 'bg-muted', track: 'bg-muted/20', pill: 'bg-muted/20 text-ink', head: 'bg-muted/15' }
}

async function loadBoard() {
  const data = await $fetch<{ pointsBalance: number; categories: Category[] }>('/api/board')
  pointsBalance.value = data.pointsBalance
  categories.value = data.categories
}

async function addCategory() {
  if (!newCategoryName.value.trim()) return
  await $fetch('/api/categories', {
    method: 'POST',
    body: { name: newCategoryName.value, color: newCategoryColor.value, icon: newCategoryIcon.value, bgColor: newCategoryBgColor.value }
  })
  newCategoryName.value = ''
  newCategoryColor.value = 'sage'
  newCategoryIcon.value = 'checklist'
  newCategoryBgColor.value = 'none'
  await loadBoard()
}

async function setCategoryColor(category: Category, color: CategoryColor) {
  if (category.color === color) return
  await $fetch(`/api/categories/${category.id}`, { method: 'PATCH', body: { color } })
  await loadBoard()
}

async function setCategoryIcon(category: Category, icon: CategoryIconName) {
  if (category.icon === icon) return
  await $fetch(`/api/categories/${category.id}`, { method: 'PATCH', body: { icon } })
  await loadBoard()
}

async function setCategoryBgColor(category: Category, bgColor: CategoryBgColor) {
  if (category.bgColor === bgColor) return
  await $fetch(`/api/categories/${category.id}`, { method: 'PATCH', body: { bgColor } })
  await loadBoard()
}

const confirm = useConfirm()

async function deleteCategory(id: number) {
  if (!(await confirm('Delete this category and all its todos?', { title: 'Delete category', confirmText: 'Delete' }))) return
  await $fetch(`/api/categories/${id}`, { method: 'DELETE' })
  await loadBoard()
}

async function addTodo(categoryId: number) {
  const title = newTodoTitle.value[categoryId]?.trim()
  if (!title) return
  await $fetch('/api/todos', {
    method: 'POST',
    body: {
      categoryId,
      title,
      dueDate: newTodoDueDate.value[categoryId] || null
    }
  })
  newTodoTitle.value[categoryId] = ''
  newTodoDueDate.value[categoryId] = ''
  await loadBoard()
}

async function toggleTodo(todo: Todo) {
  await $fetch(`/api/todos/${todo.id}`, { method: 'PATCH', body: { isDone: !todo.isDone } })
  await loadBoard()
}

async function deleteTodo(id: number) {
  await $fetch(`/api/todos/${id}`, { method: 'DELETE' })
  await loadBoard()
}

const editingTodoId = ref<number | null>(null)
const editTitle = ref('')
const editPoints = ref(10)
const editDueDate = ref('')

function startEdit(todo: Todo) {
  editingTodoId.value = todo.id
  editTitle.value = todo.title
  editPoints.value = todo.pointsValue
  editDueDate.value = todo.dueDate || ''
}

function cancelEdit() {
  editingTodoId.value = null
}

async function saveEdit(todo: Todo) {
  const title = editTitle.value.trim()
  if (!title) return
  await $fetch(`/api/todos/${todo.id}`, {
    method: 'PATCH',
    body: {
      title,
      pointsValue: editPoints.value || 10,
      dueDate: editDueDate.value || null
    }
  })
  editingTodoId.value = null
  await loadBoard()
}

function progress(category: Category) {
  if (category.todos.length === 0) return 0
  return Math.round((category.todos.filter((t) => t.isDone).length / category.todos.length) * 100)
}

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

onMounted(async () => {
  await loadBoard()
  loading.value = false
})
</script>

<template>
  <div>
    <div class="mb-8 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 animate-fade-up">
      <div>
        <h1 class="font-display text-xl font-semibold sm:text-2xl">Hi Love, These are your todos <3</h1>
        <p class="mt-0.5 text-sm text-muted">Sort your tasks into categories and bank your KP.</p>
      </div>
      <div class="hidden shrink-0 items-baseline gap-1.5 pt-1 sm:flex">
        <span class="font-display text-2xl font-bold tabular-nums">{{ pointsBalance }}</span>
        <span class="text-xs text-muted">KP</span>
      </div>
    </div>

    <div v-if="loading" class="text-muted">
      Loading…
    </div>

    <div v-else class="space-y-6">
      <form class="flex flex-wrap items-center gap-3 animate-fade-up" @submit.prevent="addCategory">
        <input
          v-model="newCategoryName"
          placeholder="New category, e.g. Chores"
          class="order-1 min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm shadow-soft transition-shadow placeholder:text-muted/60 focus:shadow-soft-lg"
        >
        <button class="order-2 shrink-0 rounded-xl border border-accent-strong bg-accent-strong px-3 py-3 text-xs font-medium text-white transition-all duration-150 hover:brightness-110 active:scale-[0.97] sm:order-3 sm:px-5 sm:py-2.5 sm:text-sm">
          Add category
        </button>
        <div class="order-3 flex w-full items-center gap-4 overflow-x-auto pb-1 sm:order-2 sm:w-auto sm:overflow-visible sm:pb-0">
          <IconSwatchPicker v-model="newCategoryIcon" class="shrink-0" />
          <span class="h-4 w-px shrink-0 bg-line" />
          <ColorSwatchPicker v-model="newCategoryColor" class="shrink-0" />
          <span class="h-4 w-px shrink-0 bg-line" />
          <BgColorSwatchPicker v-model="newCategoryBgColor" class="shrink-0" />
        </div>
      </form>

      <p v-if="categories.length === 0" class="text-sm text-muted">
        No categories yet — add one above to get started.
      </p>

      <TransitionGroup name="list" tag="div" class="relative columns-1 gap-6 md:columns-2 xl:columns-3">
        <div
          v-for="category in categories"
          :key="category.id"
          class="mb-6 flex flex-col break-inside-avoid rounded-2xl border border-line p-4 shadow-soft transition-shadow duration-200 hover:shadow-soft-lg sm:p-6"
          :style="{ backgroundColor: CATEGORY_BG_HEX[category.bgColor] }"
        >
          <div class="mb-4 border-b border-line/70 pb-4">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <Icon :name="category.icon" class="h-6 w-6 shrink-0" :class="COLOR_STYLES[category.color].icon" />
                <h2 class="font-display text-lg font-semibold">{{ category.name }}</h2>
              </div>
              <button class="shrink-0 text-xs text-muted transition-colors hover:text-ink hover:underline" @click="deleteCategory(category.id)">
                Delete category
              </button>
            </div>
            <form class="mb-3 flex flex-wrap gap-2" @submit.prevent="addTodo(category.id)">
              <input
                v-model="newTodoTitle[category.id]"
                placeholder="New todo"
                class="min-w-[10rem] flex-1 rounded-lg border border-line bg-canvas px-3 py-1.5 text-sm transition-shadow placeholder:text-muted/60 focus:shadow-soft"
              >
              <DatePicker
                :model-value="newTodoDueDate[category.id] || ''"
                @update:model-value="(v) => (newTodoDueDate[category.id] = v)"
              />
              <button class="shrink-0 rounded-lg bg-accent-strong px-3 py-1.5 text-sm font-medium text-white transition-all duration-150 hover:brightness-110 active:scale-[0.97]">
                Add
              </button>
            </form>
            <div class="flex items-center gap-4 overflow-x-auto pb-1 sm:flex-wrap sm:gap-x-4 sm:gap-y-2 sm:overflow-visible sm:pb-0">
              <IconSwatchPicker :model-value="category.icon" class="shrink-0" @update:model-value="(i) => setCategoryIcon(category, i)" />
              <span class="h-4 w-px shrink-0 bg-line" />
              <ColorSwatchPicker :model-value="category.color" class="shrink-0" @update:model-value="(c) => setCategoryColor(category, c)" />
              <span class="h-4 w-px shrink-0 bg-line" />
              <BgColorSwatchPicker :model-value="category.bgColor" class="shrink-0" @update:model-value="(c) => setCategoryBgColor(category, c)" />
            </div>
          </div>

          <div v-if="category.todos.length > 0" class="mb-4 flex items-center gap-3">
            <div class="h-1.5 flex-1 overflow-hidden rounded-full" :class="COLOR_STYLES[category.color].track">
              <div
                class="h-full rounded-full transition-all duration-300 ease-out"
                :class="COLOR_STYLES[category.color].bar"
                :style="{ width: `${progress(category)}%` }"
              />
            </div>
            <span class="shrink-0 font-mono text-xs text-muted">{{ progress(category) }}%</span>
          </div>

          <div v-if="category.todos.length > 0" class="mb-4 overflow-x-auto rounded-lg border border-line/70">
            <table class="w-full min-w-[420px] border-collapse text-sm">
              <thead>
              <tr class="text-xs font-semibold uppercase tracking-wide text-muted" :class="COLOR_STYLES[category.color].head">
                <th class="w-10 border border-line/70 px-3 py-2" />
                <th class="border border-line/70 px-3 py-2 text-left">Task</th>
                <th class="border border-line/70 px-3 py-2 text-right">Due</th>
                <th class="border border-line/70 px-3 py-2 text-right">KP</th>
                <th class="border border-line/70 px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <TransitionGroup name="row" tag="tbody">
              <tr
                v-for="(todo, idx) in category.todos"
                :key="todo.id"
                class="group transition-colors hover:bg-sage/10"
                :class="idx % 2 === 1 ? COLOR_STYLES[category.color].track : 'bg-surface'"
              >
                <td class="border border-line/50 px-3 py-2.5">
                  <Checkbox :checked="todo.isDone" @toggle="toggleTodo(todo)" />
                </td>
                <td class="border border-line/50 px-3 py-2.5 text-sm">
                  <input
                    v-if="editingTodoId === todo.id"
                    v-model="editTitle"
                    class="w-full rounded-md border border-line bg-canvas px-2 py-1 text-sm focus:shadow-soft"
                    @keyup.enter="saveEdit(todo)"
                    @keyup.esc="cancelEdit"
                  >
                  <span v-else class="transition-colors" :class="todo.isDone ? 'text-muted line-through' : 'text-ink'">
                    {{ todo.title }}
                  </span>
                </td>
                <td class="border border-line/50 px-3 py-2.5 text-right">
                  <DatePicker
                    v-if="editingTodoId === todo.id"
                    :model-value="editDueDate"
                    @update:model-value="(v) => (editDueDate = v)"
                  />
                  <span v-else class="font-mono text-xs text-muted">{{ formatDate(todo.dueDate) }}</span>
                </td>
                <td class="border border-line/50 px-3 py-2.5 text-right">
                  <input
                    v-if="editingTodoId === todo.id"
                    v-model.number="editPoints"
                    type="number"
                    min="1"
                    class="w-16 rounded-md border border-line bg-canvas px-2 py-1 text-right text-sm focus:shadow-soft"
                  >
                  <span v-else class="whitespace-nowrap rounded-full px-2.5 py-1 font-mono text-xs font-semibold text-ink" :class="COLOR_STYLES[category.color].pill">
                    +{{ todo.pointsValue }} KP
                  </span>
                </td>
                <td class="border border-line/50 px-3 py-2.5 whitespace-nowrap">
                  <div class="flex items-center justify-end gap-3">
                    <template v-if="editingTodoId === todo.id">
                      <button class="flex text-sage-strong transition-colors hover:text-ink" @click="saveEdit(todo)">
                        <Icon name="check" class="h-4 w-4" />
                      </button>
                      <button class="flex text-muted transition-colors hover:text-ink" @click="cancelEdit">
                        <Icon name="close" class="h-4 w-4" />
                      </button>
                    </template>
                    <template v-else>
                      <button class="flex text-muted transition-colors hover:text-ink" @click="startEdit(todo)">
                        <Icon name="edit" class="h-4 w-4" />
                      </button>
                      <button class="flex text-muted transition-colors hover:text-ink" @click="deleteTodo(todo.id)">
                        <Icon name="close" class="h-4 w-4" />
                      </button>
                    </template>
                  </div>
                </td>
              </tr>
            </TransitionGroup>
            </table>
          </div>
          <p v-if="category.todos.length === 0" class="text-sm text-muted">
            No todos in this category yet.
          </p>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>
