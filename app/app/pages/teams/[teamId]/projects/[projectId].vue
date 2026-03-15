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

    <div v-else class="space-y-4">
      <UiCard>
        <UiCardContent class="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="inline-flex items-center rounded-xl border border-white/60 dark:border-white/[0.10] bg-white/45 dark:bg-white/[0.04] p-1">
            <button
              :class="[
                'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                activeProjectView === 'KANBAN'
                  ? 'bg-[#1F3F68] text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/[0.08]',
              ]"
              @click="activeProjectView = 'KANBAN'"
            >
              Kanban
            </button>
            <button
              :class="[
                'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                activeProjectView === 'TIMELINE'
                  ? 'bg-[#1F3F68] text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/[0.08]',
              ]"
              @click="activeProjectView = 'TIMELINE'"
            >
              Timeline
            </button>
          </div>

        </UiCardContent>
      </UiCard>

      <div v-if="activeProjectView === 'KANBAN'" class="grid grid-cols-1 lg:grid-cols-4 gap-4">
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

      <UiCard v-else>
        <UiCardContent class="pt-4 space-y-4">
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Project Task Timeline (Gantt View)</h3>
            <div class="flex items-center gap-3">
              <span class="text-xs text-slate-500 dark:text-slate-400">
                {{ isSingleMonthTimeline ? `1 bulan · mode ${timelineModeLabel}` : 'Weekly' }}
              </span>
              <div
                v-if="isSingleMonthTimeline"
                class="inline-flex items-center rounded-xl border border-white/60 dark:border-white/[0.10] bg-white/45 dark:bg-white/[0.04] p-1"
              >
                <button
                  :class="[
                    'px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors',
                    timelineRange === 'DAILY'
                      ? 'bg-[#16A34A] text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/[0.08]',
                  ]"
                  @click="timelineRange = 'DAILY'"
                >
                  Harian
                </button>
                <button
                  :class="[
                    'px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors',
                    timelineRange === 'WEEKLY'
                      ? 'bg-[#16A34A] text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/[0.08]',
                  ]"
                  @click="timelineRange = 'WEEKLY'"
                >
                  Mingguan
                </button>
              </div>
            </div>
          </div>

          <div v-if="ganttRows.length === 0 || timelineColumns.length === 0" class="h-64 rounded-xl border border-dashed border-white/60 dark:border-white/[0.10] flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            Belum ada task bertanggal untuk ditampilkan dalam timeline.
          </div>

          <div v-else class="rounded-2xl border border-white/60 dark:border-white/[0.08] bg-white/35 dark:bg-white/[0.03] p-3.5">
            <div class="overflow-x-auto">
              <div class="min-w-[980px] space-y-2">
                <div v-if="monthHeaderSegments.length > 1" class="flex items-center gap-2">
                  <div class="w-52" />
                  <div class="flex-1 flex gap-0 border border-white/70 dark:border-white/[0.12]">
                    <div
                      v-for="segment in monthHeaderSegments"
                      :key="segment.key"
                      class="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-r border-white/70 dark:border-white/[0.12] py-1"
                      :style="{ width: `${(segment.count / timelineColumns.length) * 100}%` }"
                    >
                      {{ segment.label }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <div class="w-52 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Task</div>
                  <div class="flex-1 grid gap-0 border border-white/70 dark:border-white/[0.12]" :style="{ gridTemplateColumns: `repeat(${timelineColumns.length}, minmax(54px, 1fr))` }">
                    <div
                      v-for="col in timelineColumns"
                      :key="col.key"
                      class="text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-r border-white/70 dark:border-white/[0.12] py-1"
                      :title="col.tooltip"
                    >
                      {{ col.label }}
                    </div>
                  </div>
                </div>

                <div v-for="row in ganttRows" :key="row.task.id" class="flex items-center gap-2">
                  <button
                    class="w-52 text-left text-[11px] font-medium text-slate-800 dark:text-slate-100 truncate hover:text-primary-600 dark:hover:text-primary-300 transition-colors"
                    :title="row.task.title"
                    @click="openTask(row.task)"
                  >
                    {{ row.task.title }}
                  </button>

                  <div class="flex-1 grid gap-0 border border-white/70 dark:border-white/[0.12]" :style="{ gridTemplateColumns: `repeat(${timelineColumns.length}, minmax(54px, 1fr))` }">
                    <button
                      v-for="(col, colIndex) in timelineColumns"
                      :key="`${row.task.id}-${col.key}`"
                      class="h-[30px] rounded-none border-b transition-colors"
                      :class="
                        colIndex >= row.startIndex && colIndex <= row.endIndex
                          ? [
                              row.task.status === 'TODO'
                                ? 'bg-[#E0E1DD]/70 border-b-[#E0E1DD]/70'
                                : row.task.status === 'IN_PROGRESS'
                                  ? 'bg-[#778DA9]/25 border-b-[#778DA9]/25'
                                  : row.task.status === 'REVIEW'
                                    ? 'bg-[#415A77]/60 border-b-[#415A77]/60'
                                    : 'bg-[#1B263B]/90 border-b-[#1B263B]/90',
                              colIndex === row.endIndex ? 'border-r border-white/70 dark:border-white/[0.12]' : ''
                            ]
                          : 'bg-white/40 dark:bg-white/[0.04] border-r border-white/70 dark:border-white/[0.12] border-b-white/70 dark:border-b-white/[0.12]'
                      "
                      @click="openTask(row.task)"
                      :title="`${row.task.title} (${row.startLabel} - ${row.endLabel})`"
                    >
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
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
  createdAt?: string
  updatedAt?: string
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
const activeProjectView = ref<'KANBAN' | 'TIMELINE'>('KANBAN')
const timelineRange = ref<'DAILY' | 'WEEKLY'>('DAILY')

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

const allTasks = computed(() => Object.values(board.value).flat() as Task[])

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const endOfDay = (d: Date) => {
  const x = startOfDay(d)
  x.setHours(23, 59, 59, 999)
  return x
}
const parseSafeDate = (value?: string) => {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const timelineTaskDate = (task: Task) => parseSafeDate(task.dueDate || task.updatedAt || task.createdAt)

const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)
const monthEnd = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
const weekInMonth = (date: Date) => Math.floor((date.getDate() - 1) / 7) + 1

const timelineTaskEntries = computed(() =>
  allTasks.value
    .map((task) => {
      const anchorDate = timelineTaskDate(task)
      if (!anchorDate) return null

      const rawStart = parseSafeDate(task.createdAt || task.updatedAt || task.dueDate) || anchorDate
      const rawEnd = parseSafeDate(task.dueDate || task.updatedAt || task.createdAt) || anchorDate
      const startDate = rawStart.getTime() <= rawEnd.getTime() ? rawStart : rawEnd
      const endDate = rawStart.getTime() <= rawEnd.getTime() ? rawEnd : rawStart

      return { task, anchorDate, startDate, endDate }
    })
    .filter((x): x is { task: Task; anchorDate: Date; startDate: Date; endDate: Date } => x !== null)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
)

const timelineDomain = computed(() => {
  const firstEntry = timelineTaskEntries.value[0]
  if (!firstEntry) return null
  const min = timelineTaskEntries.value.reduce((acc, x) => x.startDate < acc ? x.startDate : acc, firstEntry.startDate)
  const max = timelineTaskEntries.value.reduce((acc, x) => x.endDate > acc ? x.endDate : acc, firstEntry.endDate)
  return {
    start: startOfDay(min),
    end: endOfDay(max),
  }
})

const isSingleMonthTimeline = computed(() => {
  const d = timelineDomain.value
  if (!d) return false
  return d.start.getFullYear() === d.end.getFullYear() && d.start.getMonth() === d.end.getMonth()
})

const timelineMode = computed<'DAILY' | 'WEEKLY'>(() => (isSingleMonthTimeline.value ? timelineRange.value : 'WEEKLY'))
const timelineModeLabel = computed(() => (timelineMode.value === 'DAILY' ? 'harian' : 'mingguan'))

const timelineColumns = computed(() => {
  const domain = timelineDomain.value
  if (!domain) return [] as Array<{ key: string; label: string; tooltip: string; monthKey: string; monthLabel: string; start: Date; end: Date }>

  if (timelineMode.value === 'DAILY') {
    const columns: Array<{ key: string; label: string; tooltip: string; monthKey: string; monthLabel: string; start: Date; end: Date }> = []
    const cursor = new Date(domain.start)
    while (cursor <= domain.end) {
      const start = new Date(cursor)
      const end = endOfDay(start)
      const monthKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`
      columns.push({
        key: `${monthKey}-${String(start.getDate()).padStart(2, '0')}`,
        label: String(start.getDate()),
        tooltip: start.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        monthKey,
        monthLabel: start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        start,
        end,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    return columns
  }

  const columns: Array<{ key: string; label: string; tooltip: string; monthKey: string; monthLabel: string; start: Date; end: Date }> = []
  let current = new Date(domain.start)
  const domainStart = domain.start
  const domainEnd = domain.end
  while (current <= domain.end) {
    const y = current.getFullYear()
    const m = current.getMonth()
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const weeksTotal = Math.ceil(daysInMonth / 7)
    const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`
    const monthLabel = new Date(y, m, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

    for (let wk = 1; wk <= weeksTotal; wk += 1) {
      const startDay = (wk - 1) * 7 + 1
      const endDay = Math.min(daysInMonth, wk * 7)
      const start = new Date(y, m, startDay)
      const end = new Date(y, m, endDay, 23, 59, 59, 999)
      if (end < domainStart || start > domainEnd) {
        continue
      }
      columns.push({
        key: `${monthKey}-w${wk}`,
        label: `W${wk}`,
        tooltip: `${monthLabel} - Week ${wk}`,
        monthKey,
        monthLabel,
        start,
        end,
      })
    }

    current = new Date(y, m + 1, 1)
  }

  return columns
})

const monthHeaderSegments = computed(() => {
  const cols = timelineColumns.value
  if (!cols.length) return [] as Array<{ key: string; label: string; count: number }>
  const segments: Array<{ key: string; label: string; count: number }> = []
  for (const col of cols) {
    const last = segments[segments.length - 1]
    if (!last || last.key !== col.monthKey) {
      segments.push({ key: col.monthKey, label: col.monthLabel, count: 1 })
    } else {
      last.count += 1
    }
  }
  return segments
})

const rangeIntersect = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => aStart <= bEnd && bStart <= aEnd

const ganttRows = computed(() => {
  const cols = timelineColumns.value
  if (!cols.length) return [] as Array<{ task: Task; startIndex: number; endIndex: number; startLabel: string; endLabel: string }>

  return timelineTaskEntries.value
    .map((entry) => {
      let startIndex = -1
      let endIndex = -1
      for (let i = 0; i < cols.length; i += 1) {
        const col = cols[i]
        if (!col) continue
        if (rangeIntersect(entry.startDate, entry.endDate, col.start, col.end)) {
          if (startIndex === -1) startIndex = i
          endIndex = i
        }
      }
      if (startIndex === -1 || endIndex === -1) return null
      return {
        task: entry.task,
        startIndex,
        endIndex,
        startLabel: entry.startDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        endLabel: entry.endDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      }
    })
    .filter((x): x is { task: Task; startIndex: number; endIndex: number; startLabel: string; endLabel: string } => x !== null)
})

const ganttBarClass = (status: string) => {
  const map: Record<string, string> = {
    TODO: 'bg-[#E0E1DD]',
    IN_PROGRESS: 'bg-[#778DA9]',
    REVIEW: 'bg-[#415A77]',
    DONE: 'bg-[#1B263B]',
  }
  return map[status] ?? 'bg-[#64748B]'
}

const ganttBarTextClass = (status: string) => {
  const map: Record<string, string> = {
    TODO: 'text-[#1B263B]',
    IN_PROGRESS: 'text-[#0D1B2A]',
    REVIEW: 'text-white',
    DONE: 'text-white',
  }
  return map[status] ?? 'text-white'
}

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
