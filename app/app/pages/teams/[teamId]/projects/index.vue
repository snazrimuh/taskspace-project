<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between rounded-3xl border border-slate-300 dark:border-slate-700 p-5 md:p-6 bg-slate-100 dark:bg-slate-900">
      <div>
        <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">Projects</h2>
        <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">Kelola project tim, PIC, progress, dan risiko deadline dari satu tampilan.</p>
        <p class="text-xs text-slate-500 mt-1.5">{{ inProgressCount }} ongoing · {{ dueSoonCount }} due soon · {{ atRiskCount }} at risk</p>
      </div>
      <UiButton v-if="isManager" @click="showCreate = true">
        <Plus class="h-4 w-4 mr-2" />
        New Project
      </UiButton>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <UiCard>
        <UiCardContent class="pt-4">
          <div class="flex items-center justify-between gap-2">
            <div>
              <p class="text-sm text-slate-500">Total Projects</p>
              <p class="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ projects.length }}</p>
            </div>
            <div class="h-9 w-9 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <FolderKanban class="h-4 w-4" />
            </div>
          </div>
          <div class="h-0.5 rounded-full bg-slate-500 dark:bg-slate-500 mt-3"></div>
        </UiCardContent>
      </UiCard>
      <UiCard>
        <UiCardContent class="pt-4">
          <div class="flex items-center justify-between gap-2">
            <div>
              <p class="text-sm text-slate-500">In Progress</p>
              <p class="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ inProgressCount }}</p>
            </div>
            <div class="h-9 w-9 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Activity class="h-4 w-4" />
            </div>
          </div>
          <div class="h-0.5 rounded-full bg-slate-500 dark:bg-slate-500 mt-3"></div>
        </UiCardContent>
      </UiCard>
      <UiCard>
        <UiCardContent class="pt-4">
          <div class="flex items-center justify-between gap-2">
            <div>
              <p class="text-sm text-slate-500">Completed</p>
              <p class="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ completedCount }}</p>
            </div>
            <div class="h-9 w-9 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <CheckCircle2 class="h-4 w-4" />
            </div>
          </div>
          <div class="h-0.5 rounded-full bg-slate-500 dark:bg-slate-500 mt-3"></div>
        </UiCardContent>
      </UiCard>
      <UiCard>
        <UiCardContent class="pt-4">
          <div class="flex items-center justify-between gap-2">
            <div>
              <p class="text-sm text-slate-500">Average Progress</p>
              <p class="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ avgProgress }}%</p>
            </div>
            <div class="h-9 w-9 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Gauge class="h-4 w-4" />
            </div>
          </div>
          <div class="h-0.5 rounded-full bg-slate-500 dark:bg-slate-500 mt-3"></div>
        </UiCardContent>
      </UiCard>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <UiCard class="border-amber-200/60 dark:border-amber-500/20">
        <UiCardContent class="pt-4">
          <p class="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300">Due Soon</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ dueSoonCount }}</p>
          <p class="text-xs text-slate-500 mt-1">Projects with due date in next 7 days</p>
        </UiCardContent>
      </UiCard>
      <UiCard class="border-rose-200/60 dark:border-rose-500/20">
        <UiCardContent class="pt-4">
          <p class="text-xs uppercase tracking-wider text-rose-700 dark:text-rose-300">At Risk</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ atRiskCount }}</p>
          <p class="text-xs text-slate-500 mt-1">Deadline near with progress under 50%</p>
        </UiCardContent>
      </UiCard>
      <UiCard class="border-teal-200/60 dark:border-teal-500/20">
        <UiCardContent class="pt-4">
          <p class="text-xs uppercase tracking-wider text-teal-700 dark:text-teal-300">Unassigned PIC</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ unassignedPicCount }}</p>
          <p class="text-xs text-slate-500 mt-1">Projects that need ownership assignment</p>
        </UiCardContent>
      </UiCard>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="rounded-xl bg-slate-100 dark:bg-slate-800 h-44 animate-pulse" />
    </div>

    <div v-else-if="projects.length === 0" class="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
      <p class="text-slate-600 dark:text-slate-300 font-medium">Belum ada project</p>
      <p class="text-sm text-slate-500 mt-1">Buat project terlebih dahulu, lalu tambahkan task di dalamnya.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <NuxtLink
        v-for="project in projects"
        :key="project.id"
        :to="`/teams/${teamId}/projects/${project.id}`"
        class="block"
        @click.capture="openProject(project.id, $event)"
      >
        <UiCard class="cursor-pointer hover:shadow-md transition-shadow">
          <UiCardContent class="pt-4 space-y-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="font-semibold text-slate-900 dark:text-slate-100 truncate">{{ project.name }}</h3>
                <p class="text-xs text-slate-500 mt-1 line-clamp-2">{{ project.description || 'No description' }}</p>
              </div>
              <UiBadge :variant="statusVariant(project.status) as any">{{ statusLabel(project.status) }}</UiBadge>
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-xs text-slate-500">
                <span>Progress</span>
                <span>{{ project.progress }}%</span>
              </div>
              <div class="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  class="h-full bg-emerald-500 transition-all"
                  :style="{ width: `${Math.min(100, Number(project.progress || 0))}%` }"
                />
              </div>
            </div>

            <div class="flex items-center justify-between text-xs text-slate-500">
              <div class="flex items-center gap-2">
                <UiAvatar :name="project.pic?.name || 'U'" :src="project.pic?.avatar || ''" size="sm" />
                <span class="truncate max-w-[120px]">PIC: {{ project.pic?.name || 'Unassigned' }}</span>
              </div>
              <span>{{ project._count?.tasks ?? 0 }} tasks</span>
            </div>
          </UiCardContent>
        </UiCard>
      </NuxtLink>
    </div>

    <UiModal v-model="showCreate" title="Create New Project" size="lg">
      <form class="space-y-4" @submit.prevent="handleCreate">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
          <UiInput v-model="newProject.name" placeholder="Project name" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <UiTextarea v-model="newProject.description" placeholder="Project description..." :rows="3" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PIC</label>
            <UiSelect v-model="newProject.picId">
              <option value="">Unassigned</option>
              <option v-for="m in members" :key="m.userId" :value="m.userId">{{ m.user.name }}</option>
            </UiSelect>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
            <UiInput v-model="newProject.startDate" type="date" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
            <UiInput v-model="newProject.dueDate" type="date" />
          </div>
        </div>

        <p v-if="createError" class="text-sm text-red-600 dark:text-red-400">{{ createError }}</p>

        <div class="flex justify-end gap-2">
          <UiButton variant="outline" type="button" @click="showCreate = false">Cancel</UiButton>
          <UiButton type="submit" :disabled="isCreating">{{ isCreating ? 'Creating...' : 'Create Project' }}</UiButton>
        </div>
      </form>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { Plus, FolderKanban, Activity, CheckCircle2, Gauge } from 'lucide-vue-next'

interface TeamMember {
  userId: string
  user: { name: string }
}

interface Project {
  id: string
  name: string
  description?: string
  status: string
  progress: number | string
  dueDate?: string
  pic?: { id: string; name: string; avatar?: string }
  _count?: { tasks: number }
}

const route = useRoute()
const router = useRouter()
const api = useApi()
const teamStore = useTeamStore()

const teamId = computed(() => route.params.teamId as string)
const isManager = computed(() => teamStore.isCurrentTeamManager)

const isLoading = ref(false)
const isCreating = ref(false)
const createError = ref('')
const showCreate = ref(false)
const projects = ref<Project[]>([])

const newProject = reactive({
  name: '',
  description: '',
  picId: '',
  startDate: '',
  dueDate: '',
})

const members = computed(() => teamStore.currentTeamMembers as unknown as TeamMember[])

const openProject = async (projectId: string, event?: Event) => {
  const target = `/teams/${teamId.value}/projects/${projectId}`

  if (!event?.defaultPrevented) {
    try {
      await router.push(target)
      return
    } catch {
      // Fallback to full navigation below.
    }
  }

  if (import.meta.client) {
    window.location.assign(target)
  }
}

const fetchProjects = async () => {
  isLoading.value = true
  try {
    const res = await api.get<{ success: boolean; data: Project[] }>(`/teams/${teamId.value}/projects`)
    projects.value = res.data ?? []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    teamStore.fetchTeam(teamId.value),
    teamStore.fetchMembers(teamId.value),
    fetchProjects(),
  ])
})

watch(teamId, async () => {
  await Promise.all([
    teamStore.fetchTeam(teamId.value),
    teamStore.fetchMembers(teamId.value),
    fetchProjects(),
  ])
})

const handleCreate = async () => {
  if (!newProject.name.trim()) return
  createError.value = ''
  isCreating.value = true

  try {
    const res = await api.post<{ success: boolean; data: Project }>(`/teams/${teamId.value}/projects`, {
      name: newProject.name.trim(),
      description: newProject.description.trim() || undefined,
      picId: newProject.picId || undefined,
      startDate: newProject.startDate || undefined,
      dueDate: newProject.dueDate || undefined,
    })

    projects.value = [res.data, ...projects.value]
    Object.assign(newProject, { name: '', description: '', picId: '', startDate: '', dueDate: '' })
    showCreate.value = false
  } catch (err: any) {
    createError.value = err?.data?.message ?? 'Failed to create project'
  } finally {
    isCreating.value = false
  }
}

const statusVariant = (status: string) => {
  const map: Record<string, string> = {
    NOT_STARTED: 'secondary',
    IN_PROGRESS: 'info',
    ON_HOLD: 'warning',
    COMPLETED: 'success',
  }
  return map[status] ?? 'secondary'
}

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    ON_HOLD: 'On Hold',
    COMPLETED: 'Completed',
  }
  return map[status] ?? status
}

const inProgressCount = computed(() =>
  projects.value.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'ON_HOLD').length,
)

const completedCount = computed(() => projects.value.filter((p) => p.status === 'COMPLETED').length)

const dueSoonCount = computed(() => {
  const now = new Date()
  const limit = new Date(now)
  limit.setDate(now.getDate() + 7)
  return projects.value.filter((p) => {
    if (!p.dueDate || p.status === 'COMPLETED') return false
    const due = new Date(p.dueDate)
    return due >= now && due <= limit
  }).length
})

const atRiskCount = computed(() => {
  const now = new Date()
  const limit = new Date(now)
  limit.setDate(now.getDate() + 7)
  return projects.value.filter((p) => {
    if (!p.dueDate || p.status === 'COMPLETED') return false
    const progress = Number(p.progress || 0)
    const due = new Date(p.dueDate)
    return due >= now && due <= limit && progress < 50
  }).length
})

const unassignedPicCount = computed(() => projects.value.filter((p) => !p.pic?.id).length)

const avgProgress = computed(() => {
  if (!projects.value.length) return 0
  const total = projects.value.reduce((acc, p) => acc + Number(p.progress || 0), 0)
  return Math.round((total / projects.value.length) * 100) / 100
})
</script>
