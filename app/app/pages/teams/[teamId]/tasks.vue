<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Tasks</h2>
      <UiButton v-if="isManager" @click="showCreate = true">
        <Plus class="h-4 w-4 mr-2" />
        New Task
      </UiButton>
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="rounded-xl bg-slate-100 dark:bg-slate-800 h-64 animate-pulse" />
    </div>

    <!-- Kanban Board -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <TaskColumn
        v-for="column in columns"
        :key="column.key"
        :title="column.title"
        :status="column.key"
        :tasks="getTasksByStatus(column.key).map(flatTask)"
        :color="column.color"
        @task-click="(t: { id: string }) => openTask(getTasksByStatus(column.key).find(x => x.id === t.id)!)"
        @status-change="handleStatusChange"
      />
    </div>

    <!-- Create Task Modal -->
    <UiModal v-model="showCreate" title="Create New Task">
      <form class="space-y-4" @submit.prevent="handleCreate">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
          <UiInput v-model="newTask.title" placeholder="Task title" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <UiTextarea v-model="newTask.description" placeholder="Task description..." :rows="3" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
            <UiSelect v-model="newTask.priority">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </UiSelect>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assignee</label>
            <UiSelect v-model="newTask.assigneeId">
              <option value="">Unassigned</option>
              <option v-for="m in members" :key="m.userId" :value="m.userId">{{ m.user.name }}</option>
            </UiSelect>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
          <UiInput v-model="newTask.dueDate" type="date" />
        </div>
        <p v-if="createError" class="text-sm text-red-600 dark:text-red-400">{{ createError }}</p>
        <div class="flex justify-end gap-2">
          <UiButton variant="outline" type="button" @click="showCreate = false">Cancel</UiButton>
          <UiButton type="submit" :disabled="isCreating">{{ isCreating ? 'Creating...' : 'Create Task' }}</UiButton>
        </div>
      </form>
    </UiModal>

    <!-- Task Detail Modal -->
    <UiModal v-model="showDetail" :title="selectedTask?.title || ''" size="lg">
      <div v-if="selectedTask" class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <UiBadge :variant="(priorityVariant(selectedTask.priority) as any)">{{ selectedTask.priority }}</UiBadge>
          <UiBadge :variant="(statusVariant(selectedTask.status) as any)">{{ statusLabel(selectedTask.status) }}</UiBadge>
        </div>

        <!-- Description -->
        <div>
          <span class="text-sm text-slate-500 dark:text-slate-500">Description</span>
          <UiTextarea
            v-if="isManager"
            v-model="editFields.description"
            placeholder="Add a description..."
            :rows="3"
            class="mt-1"
          />
          <div v-else class="text-sm text-slate-700 dark:text-slate-300 mt-1">
            {{ selectedTask.description || 'No description' }}
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <!-- Priority -->
          <div>
            <span class="text-slate-500 dark:text-slate-500">Priority</span>
            <div class="mt-1">
              <UiSelect v-if="isManager" v-model="editFields.priority">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </UiSelect>
              <span v-else class="font-medium text-slate-900 dark:text-slate-200">{{ selectedTask.priority }}</span>
            </div>
          </div>

          <!-- Assignee -->
          <div>
            <span class="text-slate-500 dark:text-slate-500">Assignee</span>
            <div class="mt-1">
              <UiSelect v-if="isManager" v-model="editFields.assigneeId">
                <option value="">Unassigned</option>
                <option v-for="m in members" :key="m.userId" :value="m.userId">{{ m.user.name }}</option>
              </UiSelect>
              <div v-else class="flex items-center gap-2">
                <UiAvatar :name="selectedTask.assignee?.name || 'U'" size="sm" />
                <span class="font-medium text-slate-900 dark:text-slate-200">{{ selectedTask.assignee?.name || 'Unassigned' }}</span>
              </div>
            </div>
          </div>

          <!-- Due Date -->
          <div>
            <span class="text-slate-500 dark:text-slate-500">Due Date</span>
            <div class="mt-1">
              <UiInput v-if="isManager" v-model="editFields.dueDate" type="date" />
              <span v-else class="font-medium text-slate-900 dark:text-slate-200">{{ selectedTask.dueDate || 'No due date' }}</span>
            </div>
          </div>

          <!-- Status -->
          <div>
            <span class="text-slate-500 dark:text-slate-500">Status</span>
            <div class="mt-1">
              <UiSelect
                v-if="canChangeStatus"
                :model-value="selectedTask.status"
                @update:model-value="handleStatusChange(selectedTask!.id, $event)"
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </UiSelect>
              <UiBadge v-else :variant="(statusVariant(selectedTask.status) as any)">
                {{ statusLabel(selectedTask.status) }}
              </UiBadge>
            </div>
          </div>

          <!-- Created By -->
          <div>
            <span class="text-slate-500 dark:text-slate-500">Created By</span>
            <div class="font-medium text-slate-900 dark:text-slate-200 mt-1">{{ selectedTask.createdBy?.name }}</div>
          </div>
        </div>

        <!-- Save / Delete buttons for manager -->
        <div v-if="isManager" class="flex justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <UiButton variant="danger" type="button" @click="handleDeleteTask(selectedTask!.id)">Delete Task</UiButton>
          <div class="flex gap-2">
            <p v-if="editError" class="text-sm text-red-600 dark:text-red-400 self-center">{{ editError }}</p>
            <UiButton variant="outline" type="button" @click="showDetail = false">Cancel</UiButton>
            <UiButton :disabled="isSaving" @click="handleSaveTask">{{ isSaving ? 'Saving...' : 'Save Changes' }}</UiButton>
          </div>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

const route = useRoute()
const teamId = computed(() => route.params.teamId as string)
const teamStore = useTeamStore()
const authStore = useAuthStore()
const api = useApi()

const isManager = computed(() => teamStore.isCurrentTeamManager)
const canChangeStatus = computed(() =>
  isManager.value || selectedTask.value?.assignee?.id === authStore.currentUser?.id
)

// ── State ──────────────────────────────────────────────────────────────
const showCreate = ref(false)
const showDetail = ref(false)
const selectedTask = ref<Task | null>(null)
const isLoading = ref(false)
const isCreating = ref(false)
const createError = ref('')
const isSaving = ref(false)
const editError = ref('')
const editFields = reactive({
  description: '',
  priority: 'MEDIUM',
  assigneeId: '',
  dueDate: '',
})

interface TaskUser { id: string; name: string; avatar?: string }
interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  assignee?: TaskUser
  createdBy: TaskUser
}

const board = ref<Record<string, Task[]>>({
  TODO: [],
  IN_PROGRESS: [],
  REVIEW: [],
  DONE: [],
})

// Members for assignee dropdown
const members = computed(() => teamStore.currentTeamMembers)

const newTask = reactive({
  title: '',
  description: '',
  priority: 'MEDIUM',
  assigneeId: '',
  dueDate: '',
})

// ── Columns config ─────────────────────────────────────────────────────
const columns = [
  { key: 'TODO', title: 'Todo', color: 'bg-slate-400' },
  { key: 'IN_PROGRESS', title: 'In Progress', color: 'bg-primary-500' },
  { key: 'REVIEW', title: 'Review', color: 'bg-amber-500' },
  { key: 'DONE', title: 'Done', color: 'bg-emerald-500' },
]

// ── Fetch ──────────────────────────────────────────────────────────────
const fetchBoard = async () => {
  isLoading.value = true
  try {
    const res = await api.get<{ success: boolean; data: Record<string, Task[]> }>(`/teams/${teamId.value}/tasks`)
    board.value = res.data
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchBoard(),
    teamStore.fetchMembers(teamId.value),
  ])
})

watch(teamId, fetchBoard)

// ── Helpers ────────────────────────────────────────────────────────────
const getTasksByStatus = (status: string) => board.value[status] ?? []

const openTask = (task: Task) => {
  selectedTask.value = { ...task }
  editFields.description = task.description || ''
  editFields.priority = task.priority
  editFields.assigneeId = task.assignee?.id || ''
  editFields.dueDate = task.dueDate ? task.dueDate.slice(0, 10) : ''
  editError.value = ''
  showDetail.value = true
}

// ── Create ─────────────────────────────────────────────────────────────
const handleCreate = async () => {
  if (!newTask.title.trim()) return
  createError.value = ''
  isCreating.value = true
  try {
    const res = await api.post<{ success: boolean; data: Task }>(`/teams/${teamId.value}/tasks`, {
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      priority: newTask.priority,
      assigneeId: newTask.assigneeId || undefined,
      dueDate: newTask.dueDate || undefined,
    })
    board.value.TODO = [res.data, ...(board.value.TODO ?? [])]
    Object.assign(newTask, { title: '', description: '', priority: 'MEDIUM', assigneeId: '', dueDate: '' })
    showCreate.value = false
  } catch (err: any) {
    createError.value = err?.data?.message ?? 'Failed to create task'
  } finally {
    isCreating.value = false
  }
}

// ── Status change ──────────────────────────────────────────────────────
const handleStatusChange = async (taskId: string, newStatus: string) => {
  // Optimistic update
  let movedTask: Task | undefined
  for (const col of Object.values(board.value)) {
    const idx = col.findIndex((t) => t.id === taskId)
    if (idx !== -1) {
      movedTask = col.splice(idx, 1)[0]
      break
    }
  }
  if (movedTask) {
    movedTask.status = newStatus
    board.value[newStatus] = [movedTask, ...(board.value[newStatus] ?? [])]
    if (selectedTask.value?.id === taskId) selectedTask.value.status = newStatus
  }

  try {
    await api.patch(`/teams/${teamId.value}/tasks/${taskId}/status`, { status: newStatus })
  } catch {
    // Revert on error
    await fetchBoard()
  }
}

// ── Save task edits (manager) ──────────────────────────────────────────
const handleSaveTask = async () => {
  if (!selectedTask.value) return
  isSaving.value = true
  editError.value = ''
  try {
    const res = await api.patch<{ success: boolean; data: Task }>(
      `/teams/${teamId.value}/tasks/${selectedTask.value.id}`,
      {
        description: editFields.description || undefined,
        priority: editFields.priority,
        assigneeId: editFields.assigneeId || null,
        dueDate: editFields.dueDate || null,
      },
    )
    // Update the board with the returned task
    const updated = res.data
    for (const col of Object.values(board.value)) {
      const idx = col.findIndex(t => t.id === updated.id)
      if (idx !== -1) { col[idx] = updated; break }
    }
    selectedTask.value = { ...updated }
    showDetail.value = false
  } catch (err: any) {
    editError.value = err?.data?.message ?? 'Failed to update task'
  } finally {
    isSaving.value = false
  }
}

// ── Delete task ────────────────────────────────────────────────────────
const handleDeleteTask = async (taskId: string) => {
  try {
    await api.delete(`/teams/${teamId.value}/tasks/${taskId}`)
    for (const col of Object.values(board.value)) {
      const idx = col.findIndex(t => t.id === taskId)
      if (idx !== -1) { col.splice(idx, 1); break }
    }
    showDetail.value = false
  } catch { /* ignore */ }
}

// ── Variant helpers ────────────────────────────────────────────────────
const priorityVariant = (p: string) => {
  const map: Record<string, string> = { LOW: 'secondary', MEDIUM: 'info', HIGH: 'warning', URGENT: 'danger' }
  return map[p] ?? 'secondary'
}

const statusVariant = (s: string) => {
  const map: Record<string, string> = { TODO: 'secondary', IN_PROGRESS: 'info', REVIEW: 'warning', DONE: 'success' }
  return map[s] ?? 'secondary'
}

const statusLabel = (s: string) => {
  const map: Record<string, string> = { TODO: 'Todo', IN_PROGRESS: 'In Progress', REVIEW: 'Review', DONE: 'Done' }
  return map[s] ?? s
}

// Adapter for TaskCard (expects flat `assignee` string name)
const flatTask = (t: Task) => ({
  ...t,
  assignee: t.assignee?.name,
})
</script>
