<template>
  <div class="space-y-5">
    <UiCard v-if="loadError">
      <UiCardContent class="pt-4 flex items-center justify-between gap-3">
        <p class="text-sm text-red-600 dark:text-red-400">{{ loadError }}</p>
        <UiButton variant="outline" @click="navigateTo(`/teams/${teamId}/projects`)">Back to Projects</UiButton>
      </UiCardContent>
    </UiCard>

    <div class="flex items-center justify-between gap-3">
      <div>
        <div class="text-xs text-slate-500">
          <NuxtLink :to="`/teams/${teamId}/projects`" class="hover:text-slate-700">Projects</NuxtLink>
          <span class="mx-1">/</span>
          <span>{{ project?.name || 'Project' }}</span>
        </div>
        <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-1">{{ project?.name }}</h2>
        <p class="text-sm text-slate-500 mt-1">{{ project?.description || 'No description' }}</p>
      </div>
      <UiButton v-if="isManager" @click="showCreate = true">
        <Plus class="h-4 w-4 mr-2" />
        New Task
      </UiButton>
    </div>

    <UiCard>
      <UiCardContent class="pt-4 space-y-4">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p class="text-slate-500">Status</p>
            <UiBadge class="mt-1" :variant="statusVariant(project?.status || '') as any">{{ statusLabel(project?.status || '') }}</UiBadge>
          </div>
          <div>
            <p class="text-slate-500">PIC</p>
            <div class="mt-1" v-if="isManager">
              <UiSelect v-model="editProject.picId" @update:model-value="handleUpdateProjectMeta">
                <option value="">Unassigned</option>
                <option v-for="m in members" :key="m.userId" :value="m.userId">{{ m.user.name }}</option>
              </UiSelect>
            </div>
            <div v-else class="font-medium text-slate-900 dark:text-slate-100 mt-1">{{ project?.pic?.name || 'Unassigned' }}</div>
          </div>
          <div>
            <p class="text-slate-500">Start</p>
            <UiInput v-if="isManager" v-model="editProject.startDate" type="date" class="mt-1" @change="handleUpdateProjectMeta" />
            <div v-else class="font-medium text-slate-900 dark:text-slate-100 mt-1">{{ formatDate(project?.startDate) }}</div>
          </div>
          <div>
            <p class="text-slate-500">Due</p>
            <UiInput v-if="isManager" v-model="editProject.dueDate" type="date" class="mt-1" @change="handleUpdateProjectMeta" />
            <div v-else class="font-medium text-slate-900 dark:text-slate-100 mt-1">{{ formatDate(project?.dueDate) }}</div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Progress</span>
            <span>{{ Number(project?.progress || 0).toFixed(2) }}%</span>
          </div>
          <div class="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div class="h-full bg-emerald-500 transition-all" :style="{ width: `${Math.min(100, Number(project?.progress || 0))}%` }" />
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="rounded-xl bg-slate-100 dark:bg-slate-800 h-64 animate-pulse" />
    </div>

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

    <UiModal v-model="showCreate" title="Create Task">
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

    <UiModal v-model="showDetail" :title="selectedTask?.title || ''" size="lg">
      <div v-if="selectedTask" class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <UiBadge :variant="(priorityVariant(selectedTask.priority) as any)">{{ selectedTask.priority }}</UiBadge>
          <UiBadge :variant="(taskStatusVariant(selectedTask.status) as any)">{{ taskStatusLabel(selectedTask.status) }}</UiBadge>
        </div>

        <div>
          <span class="text-sm text-slate-500">Description</span>
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
          <div>
            <span class="text-slate-500">Priority</span>
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

          <div>
            <span class="text-slate-500">Assignee</span>
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

          <div>
            <span class="text-slate-500">Due Date</span>
            <div class="mt-1">
              <UiInput v-if="isManager" v-model="editFields.dueDate" type="date" />
              <span v-else class="font-medium text-slate-900 dark:text-slate-200">{{ selectedTask.dueDate || 'No due date' }}</span>
            </div>
          </div>

          <div>
            <span class="text-slate-500">Status</span>
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
              <UiBadge v-else :variant="(taskStatusVariant(selectedTask.status) as any)">
                {{ taskStatusLabel(selectedTask.status) }}
              </UiBadge>
            </div>
          </div>
        </div>

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

interface TaskUser { id: string; name: string; avatar?: string }
interface TeamMember { userId: string; user: { name: string } }
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
interface Project {
  id: string
  name: string
  description?: string
  status: string
  progress: number | string
  picId?: string
  pic?: TaskUser
  startDate?: string
  dueDate?: string
}

const route = useRoute()
const api = useApi()
const teamStore = useTeamStore()
const authStore = useAuthStore()

const teamId = computed(() => route.params.teamId as string)
const projectId = computed(() => route.params.projectId as string)
const isManager = computed(() => teamStore.isCurrentTeamManager)

const canChangeStatus = computed(() =>
  isManager.value || selectedTask.value?.assignee?.id === authStore.currentUser?.id,
)

const isLoading = ref(false)
const isCreating = ref(false)
const isSaving = ref(false)
const createError = ref('')
const editError = ref('')
const loadError = ref('')
const showCreate = ref(false)
const showDetail = ref(false)
const selectedTask = ref<Task | null>(null)
const project = ref<Project | null>(null)

const editProject = reactive({
  picId: '',
  startDate: '',
  dueDate: '',
})

const newTask = reactive({
  title: '',
  description: '',
  priority: 'MEDIUM',
  assigneeId: '',
  dueDate: '',
})

const editFields = reactive({
  description: '',
  priority: 'MEDIUM',
  assigneeId: '',
  dueDate: '',
})

const board = ref<Record<string, Task[]>>({
  TODO: [],
  IN_PROGRESS: [],
  REVIEW: [],
  DONE: [],
})

const members = computed(() => teamStore.currentTeamMembers as unknown as TeamMember[])

const columns = [
  { key: 'TODO', title: 'Todo', color: 'bg-slate-400' },
  { key: 'IN_PROGRESS', title: 'In Progress', color: 'bg-primary-500' },
  { key: 'REVIEW', title: 'Review', color: 'bg-amber-500' },
  { key: 'DONE', title: 'Done', color: 'bg-emerald-500' },
]

const fetchProject = async () => {
  isLoading.value = true
  loadError.value = ''
  try {
    const res = await api.get<{ success: boolean; data: any }>(`/teams/${teamId.value}/projects/${projectId.value}`)
    project.value = res.data

    editProject.picId = res.data.picId || ''
    editProject.startDate = res.data.startDate ? res.data.startDate.slice(0, 10) : ''
    editProject.dueDate = res.data.dueDate ? res.data.dueDate.slice(0, 10) : ''

    const tasks = res.data.tasks ?? []
    const grouped: Record<string, Task[]> = { TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [] }
    for (const t of tasks) {
      grouped[t.status]?.push(t)
    }
    board.value = grouped
  } catch (err: any) {
    project.value = null
    board.value = { TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [] }
    const status = Number(err?.status ?? 0)
    if (status === 404 || status === 403) {
      loadError.value = 'Project tidak ditemukan atau Anda tidak memiliki akses.'
      await navigateTo(`/teams/${teamId.value}/projects`)
      return
    }
    loadError.value = err?.data?.message ?? 'Gagal memuat detail project.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    teamStore.fetchTeam(teamId.value),
    teamStore.fetchMembers(teamId.value),
    fetchProject(),
  ])
})

watch([teamId, projectId], async () => {
  await Promise.all([
    teamStore.fetchTeam(teamId.value),
    teamStore.fetchMembers(teamId.value),
    fetchProject(),
  ])
})

const getTasksByStatus = (status: string) => board.value[status] ?? []

const flatTask = (t: Task) => ({
  ...t,
  assignee: t.assignee?.name,
})

const openTask = (task: Task) => {
  selectedTask.value = { ...task }
  editFields.description = task.description || ''
  editFields.priority = task.priority
  editFields.assigneeId = task.assignee?.id || ''
  editFields.dueDate = task.dueDate ? task.dueDate.slice(0, 10) : ''
  editError.value = ''
  showDetail.value = true
}

const handleCreate = async () => {
  if (!newTask.title.trim()) return
  createError.value = ''
  isCreating.value = true
  try {
    const res = await api.post<{ success: boolean; data: Task }>(
      `/teams/${teamId.value}/tasks`,
      {
        projectId: projectId.value,
        title: newTask.title.trim(),
        description: newTask.description.trim() || undefined,
        priority: newTask.priority,
        assigneeId: newTask.assigneeId || undefined,
        dueDate: newTask.dueDate || undefined,
      },
    )

    board.value.TODO = [res.data, ...(board.value.TODO ?? [])]
    Object.assign(newTask, { title: '', description: '', priority: 'MEDIUM', assigneeId: '', dueDate: '' })
    showCreate.value = false
    await fetchProject()
  } catch (err: any) {
    createError.value = err?.data?.message ?? 'Failed to create task'
  } finally {
    isCreating.value = false
  }
}

const handleStatusChange = async (taskId: string, newStatus: string) => {
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
    await fetchProject()
  } catch {
    await fetchProject()
  }
}

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

    const updated = res.data
    for (const col of Object.values(board.value)) {
      const idx = col.findIndex((t) => t.id === updated.id)
      if (idx !== -1) {
        col[idx] = updated
        break
      }
    }

    selectedTask.value = { ...updated }
    showDetail.value = false
    await fetchProject()
  } catch (err: any) {
    editError.value = err?.data?.message ?? 'Failed to update task'
  } finally {
    isSaving.value = false
  }
}

const handleDeleteTask = async (taskId: string) => {
  try {
    await api.delete(`/teams/${teamId.value}/tasks/${taskId}`)
    for (const col of Object.values(board.value)) {
      const idx = col.findIndex((t) => t.id === taskId)
      if (idx !== -1) {
        col.splice(idx, 1)
        break
      }
    }
    showDetail.value = false
    await fetchProject()
  } catch {
    // no-op
  }
}

const handleUpdateProjectMeta = async () => {
  if (!isManager.value || !project.value) return

  try {
    const res = await api.patch<{ success: boolean; data: Project }>(
      `/teams/${teamId.value}/projects/${projectId.value}`,
      {
        picId: editProject.picId || null,
        startDate: editProject.startDate || null,
        dueDate: editProject.dueDate || null,
      },
    )
    project.value = { ...project.value, ...res.data }
  } catch {
    await fetchProject()
  }
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const priorityVariant = (p: string) => {
  const map: Record<string, string> = { LOW: 'secondary', MEDIUM: 'info', HIGH: 'warning', URGENT: 'danger' }
  return map[p] ?? 'secondary'
}

const taskStatusVariant = (s: string) => {
  const map: Record<string, string> = { TODO: 'secondary', IN_PROGRESS: 'info', REVIEW: 'warning', DONE: 'success' }
  return map[s] ?? 'secondary'
}

const taskStatusLabel = (s: string) => {
  const map: Record<string, string> = { TODO: 'Todo', IN_PROGRESS: 'In Progress', REVIEW: 'Review', DONE: 'Done' }
  return map[s] ?? s
}

const statusVariant = (s: string) => {
  const map: Record<string, string> = {
    NOT_STARTED: 'secondary',
    IN_PROGRESS: 'info',
    ON_HOLD: 'warning',
    COMPLETED: 'success',
  }
  return map[s] ?? 'secondary'
}

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    ON_HOLD: 'On Hold',
    COMPLETED: 'Completed',
  }
  return map[s] ?? s
}
</script>
