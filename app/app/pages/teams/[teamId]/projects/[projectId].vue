<template>
  <div class="space-y-5">
    <UiCard v-if="loadError">
      <UiCardContent class="pt-4 flex items-center justify-between gap-3">
        <p class="text-sm text-[#6A2F2F] dark:text-[#F6EAEA]">{{ loadError }}</p>
        <UiButton variant="outline" @click="navigateTo(`/teams/${teamId}/projects`)">Back to Projects</UiButton>
      </UiCardContent>
    </UiCard>

    <UiCard class="mb-6">
      <UiCardContent class="pt-6">
        <div class="flex flex-col gap-6">
          <!-- Top row with title and New Task button -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="text-xs text-slate-500 mb-2">
                <NuxtLink :to="`/teams/${teamId}/projects`" class="hover:text-slate-700 dark:hover:text-slate-300">Projects</NuxtLink>
                <span class="mx-1">/</span>
                <span>{{ project?.name || 'Project' }}</span>
              </div>
              
              <div class="flex items-center gap-3">
                 <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ project?.name }}</h2>
                 <UiBadge :variant="statusVariant(project?.status || '') as any">{{ statusLabel(project?.status || '') }}</UiBadge>
                 <button v-if="isManager" @click="showEditProject = true" class="text-slate-400 hover:text-primary-500 transition-colors">
                    <Edit2 class="w-4 h-4" />
                 </button>
              </div>
            </div>
            
            <UiButton v-if="isManager" @click="showCreate = true" class="shrink-0">
              <Plus class="h-4 w-4 mr-2" />
              New Task
            </UiButton>
          </div>

          <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div class="flex-1 min-w-0">
              <p class="text-sm text-slate-500 mt-0 mb-4 max-w-2xl leading-relaxed">{{ project?.description || 'No description provided.' }}</p>

              <div class="flex items-center gap-4 mb-5 text-xs text-slate-500 font-medium">
                 <div class="flex items-center gap-1.5" title="Person In Charge">
                    <User class="w-3.5 h-3.5" />
                    <span>{{ project?.pic?.name || 'Unassigned' }}</span>
                 </div>
                 <div class="flex items-center gap-1.5" title="Timeline">
                   <Calendar class="w-3.5 h-3.5" />
                   <span>{{ formatDate(project?.startDate) }} - {{ formatDate(project?.dueDate) }}</span>
                 </div>
                 <div class="flex items-center gap-1.5" :class="{'text-[#B85C5C]': daysLeft === 'Overdue'}">
                   <Clock class="w-3.5 h-3.5" />
                   <span>{{ daysLeft === 'Overdue' ? 'Overdue' : `${daysLeft} days left` }}</span>
                 </div>
              </div>
              
              <!-- Completion Progress -->
              <div class="max-w-md">
                <div class="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span class="font-medium">Completion Progress</span>
                  <span class="font-bold text-emerald-700 dark:text-emerald-300">{{ completionProgress.toFixed(0) }}%</span>
                </div>
                <div class="h-2 w-full rounded-full bg-[rgba(224,225,221,0.5)] overflow-hidden">
                  <div class="h-full bg-[linear-gradient(90deg,#16A34A_0%,#22C55E_100%)] transition-all duration-500 ease-out" :style="{ width: `${Math.min(100, completionProgress)}%` }" />
                </div>
              </div>
            </div>

            <!-- Stats in Header -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 lg:w-[480px]">
               <div class="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.05] border border-slate-100 dark:border-white/[0.1] shadow-sm">
                  <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Total</p>
                  <p class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ totalTaskCount }}</p>
               </div>
              <div class="p-3 rounded-xl bg-[#E0E1DD]/70 dark:bg-[#E0E1DD]/18 border border-[#778DA9]/45 shadow-sm">
                <p class="text-[10px] uppercase tracking-wider text-[#1B263B] dark:text-[#E0E1DD] mb-0.5">Todo</p>
                <p class="text-xl font-bold text-[#1B263B] dark:text-[#E0E1DD]">{{ todoCount }}</p>
               </div>
              <div class="p-3 rounded-xl bg-[#778DA9]/25 dark:bg-[#778DA9]/28 border border-[#415A77]/35 shadow-sm">
                <p class="text-[10px] uppercase tracking-wider text-[#0D1B2A] dark:text-[#E0E1DD] mb-0.5">In Progress</p>
                <p class="text-xl font-bold text-[#0D1B2A] dark:text-[#E0E1DD]">{{ progressCount }}</p>
               </div>
              <div class="p-3 rounded-xl bg-[#1B263B]/90 dark:bg-[#1B263B]/80 border border-[#0D1B2A]/45 shadow-sm">
                <p class="text-[10px] uppercase tracking-wider text-white/90 mb-0.5">Done</p>
                <p class="text-xl font-bold text-white">{{ doneCount }}</p>
               </div>
            </div>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="rounded-xl bg-white/30 dark:bg-white/[0.04] h-64 animate-pulse" />
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

    <UiModal v-model="showEditProject" title="Edit Project Details">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
           <!-- Assuming name is not editable here based on user request "start, due, dan pic". If needed I can add project name too, but let's stick to request. -->
           <div class="text-sm font-semibold text-slate-900 dark:text-slate-100">{{ project?.name }}</div>
        </div>

        <div>
           <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PIC (Person In Charge)</label>
           <UiSelect v-model="editProject.picId">
              <option value="">Unassigned</option>
              <option v-for="m in members" :key="m.userId" :value="m.userId">{{ m.user.name }}</option>
           </UiSelect>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
            <UiInput v-model="editProject.startDate" type="date" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
            <UiInput v-model="editProject.dueDate" type="date" />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
           <UiButton variant="outline" @click="showEditProject = false">Cancel</UiButton>
           <UiButton @click="handleUpdateProjectMeta">Save Changes</UiButton>
        </div>
      </div>
    </UiModal>

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
        <p v-if="createError" class="text-sm text-[#6A2F2F] dark:text-[#F6EAEA]">{{ createError }}</p>
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
                <UiAvatar :name="selectedTask.assignee?.name || 'U'" :src="selectedTask.assignee?.avatar || ''" size="sm" />
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

        <div v-if="isManager" class="flex justify-between gap-2 pt-2 border-t border-white/60 dark:border-white/[0.08]">
          <UiButton variant="danger" type="button" @click="handleDeleteTask(selectedTask!.id)">Delete Task</UiButton>
          <div class="flex gap-2">
            <p v-if="editError" class="text-sm text-[#6A2F2F] dark:text-[#F6EAEA] self-center">{{ editError }}</p>
            <UiButton variant="outline" type="button" @click="showDetail = false">Cancel</UiButton>
            <UiButton :disabled="isSaving" @click="handleSaveTask">{{ isSaving ? 'Saving...' : 'Save Changes' }}</UiButton>
          </div>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { Plus, Edit2, User, Calendar, Clock } from 'lucide-vue-next'

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
const showEditProject = ref(false)
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
  { key: 'TODO', title: 'Todo', color: 'bg-[#E0E1DD] ring-1 ring-[#778DA9]/45' },
  { key: 'IN_PROGRESS', title: 'In Progress', color: 'bg-[#778DA9]' },
  { key: 'REVIEW', title: 'Review', color: 'bg-[#415A77]' },
  { key: 'DONE', title: 'Done', color: 'bg-[#1B263B]' },
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

const todoCount = computed(() => board.value.TODO?.length ?? 0)
const progressCount = computed(() => (board.value.IN_PROGRESS?.length ?? 0) + (board.value.REVIEW?.length ?? 0))
const doneCount = computed(() => board.value.DONE?.length ?? 0)
const totalTaskCount = computed(() => todoCount.value + progressCount.value + doneCount.value)
const completionProgress = computed(() => {
  if (totalTaskCount.value === 0) return Number(project.value?.progress || 0)
  return (doneCount.value / totalTaskCount.value) * 100
})

const daysLeft = computed(() => {
  if (!project.value?.dueDate) return '-'
  const now = new Date()
  const due = new Date(project.value.dueDate)
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'Overdue'
  return String(diff)
})

const flatTask = (t: Task) => ({
  ...t,
  assignee: t.assignee ? { name: t.assignee.name, avatar: t.assignee.avatar } : undefined,
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
    // No fetchProject() here to keep it realtime
  } catch {
    // Only refresh on error to rollback
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
    showEditProject.value = false
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
  const map: Record<string, string> = { TODO: 'todo', IN_PROGRESS: 'progress', REVIEW: 'review', DONE: 'done' }
  return map[s] ?? 'secondary'
}

const taskStatusLabel = (s: string) => {
  const map: Record<string, string> = { TODO: 'Todo', IN_PROGRESS: 'In Progress', REVIEW: 'Review', DONE: 'Done' }
  return map[s] ?? s
}

const statusVariant = (s: string) => {
  const map: Record<string, string> = {
    NOT_STARTED: 'todo',
    IN_PROGRESS: 'progress',
    ON_HOLD: 'warning',
    COMPLETED: 'done',
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
