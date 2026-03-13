<template>
  <div class="space-y-6">
    <!-- Team Header -->
    <div class="flex items-start justify-between rounded-3xl border border-primary-200/40 dark:border-primary-500/20 p-5 md:p-6 bg-[radial-gradient(circle_at_20%_20%,rgba(61,137,187,0.20),transparent_45%),linear-gradient(135deg,#f9fcff_0%,#eff6fb_45%,#e8f2f8_100%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(61,137,187,0.18),transparent_42%),linear-gradient(135deg,#0a1422_0%,#0b192a_60%,#10263a_100%)]">
      <div class="flex items-center gap-4">
        <div class="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xl font-bold text-slate-700 dark:text-slate-200">
          {{ teamName.slice(0, 2).toUpperCase() }}
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ teamName }}</h1>
          <p class="text-sm text-slate-600 dark:text-slate-300">{{ teamDescription }}</p>
          <p class="text-xs text-slate-500 mt-1">{{ activeTaskCount }} active · {{ completedTaskCount }} completed · {{ upcomingTimeline.length }} upcoming</p>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <UiCard v-for="stat in quickStats" :key="stat.label" class="overflow-hidden">
        <UiCardContent class="pt-4">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider" :class="stat.labelColor">{{ stat.label }}</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ stat.value }}</p>
            </div>
            <div :class="['h-9 w-9 rounded-xl flex items-center justify-center shrink-0', stat.iconBg]">
              <component :is="stat.icon" :class="['h-4 w-4', stat.iconColor]" />
            </div>
          </div>
          <div :class="['h-0.5 rounded-full mt-3', stat.bar]"></div>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Task Overview + My Assignment + Upcoming Timeline -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Task Distribution Chart -->
      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-base">Task Overview</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="pt-2 space-y-4">
          <!-- Stacked bar -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Distribution</span>
              <span>{{ totalTaskCount }} total</span>
            </div>
            <div class="h-3 rounded-full flex overflow-hidden gap-0.5 bg-white/30 dark:bg-white/[0.08]">
              <div
                v-if="taskDist.todo > 0"
                class="h-full bg-slate-400/80 dark:bg-slate-500/70 rounded-l-full transition-all duration-500"
                :style="{ width: `${taskDist.todoP}%` }"
              />
              <div
                v-if="taskDist.inProgress > 0"
                class="h-full bg-sky-400/80 dark:bg-sky-500/70 transition-all duration-500"
                :style="{ width: `${taskDist.inProgressP}%` }"
              />
              <div
                v-if="taskDist.review > 0"
                class="h-full bg-amber-400/80 dark:bg-amber-500/70 transition-all duration-500"
                :style="{ width: `${taskDist.reviewP}%` }"
              />
              <div
                v-if="taskDist.done > 0"
                class="h-full bg-emerald-400/80 dark:bg-emerald-500/70 rounded-r-full transition-all duration-500"
                :style="{ width: `${taskDist.doneP}%` }"
              />
            </div>
          </div>

          <!-- Legend + Count Breakdown -->
          <div class="grid grid-cols-2 gap-3">
            <div v-for="s in taskStatuses" :key="s.label" class="flex items-center gap-2.5 rounded-xl p-2.5 border border-white/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.05]">
              <div :class="['h-2.5 w-2.5 rounded-full shrink-0', s.dot]" />
              <div class="min-w-0">
                <p class="text-xs text-slate-500">{{ s.label }}</p>
                <p class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">{{ s.count }}</p>
              </div>
            </div>
          </div>
        </UiCardContent>
      </UiCard>

      <!-- My Assignment -->
      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-base">My Assignment</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="pt-2 space-y-3">
          <div class="rounded-xl p-4 border border-white/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.05] border-l-2 border-l-sky-400">
            <p class="text-xs font-semibold uppercase tracking-wider text-sky-500 dark:text-sky-400">Assigned To Me</p>
            <p class="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1.5">{{ myAssignedTaskCount }}</p>
            <p class="text-xs text-slate-400 mt-1">active tasks</p>
          </div>
          <div class="rounded-xl p-4 border border-white/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.05] border-l-2 border-l-amber-400">
            <p class="text-xs font-semibold uppercase tracking-wider text-amber-500 dark:text-amber-400">Due In 7 Days</p>
            <p class="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1.5">{{ myDueSoonCount }}</p>
            <p class="text-xs text-slate-400 mt-1">tasks due soon</p>
          </div>
        </UiCardContent>
      </UiCard>

      <!-- Upcoming Timeline -->
      <UiCard>
        <UiCardHeader>
          <div class="flex items-center justify-between">
            <UiCardTitle class="text-base">Upcoming Timeline</UiCardTitle>
            <NuxtLink :to="`/teams/${teamId}/calendar`" class="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
              View
            </NuxtLink>
          </div>
        </UiCardHeader>
        <UiCardContent class="pt-2 space-y-2">
          <div v-if="upcomingTimeline.length === 0" class="rounded-xl p-4 border border-white/60 dark:border-white/[0.08] text-sm text-slate-400 text-center">
            No upcoming items.
          </div>
          <div
            v-for="item in upcomingTimeline"
            :key="item.id"
            class="rounded-xl px-3 py-2.5 border border-white/60 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.05] flex items-center justify-between gap-2"
          >
            <div class="min-w-0 flex items-center gap-2.5">
              <div :class="['h-2 w-2 rounded-full shrink-0', item.variant === 'info' ? 'bg-sky-500' : 'bg-amber-500']" />
              <div class="min-w-0">
                <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{{ item.title }}</p>
                <p class="text-xs text-slate-500">{{ item.subtitle }}</p>
              </div>
            </div>
            <UiBadge :variant="item.variant as any" size="sm" class="shrink-0">{{ item.badge }}</UiBadge>
          </div>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Project Health -->
    <UiCard>
      <UiCardHeader>
        <div class="flex items-center justify-between">
          <UiCardTitle class="text-base">Project Health</UiCardTitle>
          <span class="text-xs text-slate-400">{{ projects.length }} projects total</span>
        </div>
      </UiCardHeader>
      <UiCardContent class="pt-2 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="rounded-xl p-4 border border-white/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.05] border-l-2 border-l-emerald-400">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">On Track</p>
              <div class="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
            </div>
            <p class="text-3xl font-bold text-slate-900 dark:text-slate-100">{{ projectHealth.onTrack }}</p>
            <p class="text-xs text-slate-400 mt-1">Progress ≥ 60% or completed</p>
          </div>
          <div class="rounded-xl p-4 border border-white/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.05] border-l-2 border-l-amber-400">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-semibold uppercase tracking-wider text-amber-500 dark:text-amber-400">Needs Attention</p>
              <div class="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
            </div>
            <p class="text-3xl font-bold text-slate-900 dark:text-slate-100">{{ projectHealth.attention }}</p>
            <p class="text-xs text-slate-400 mt-1">Progress &lt; 60% and active</p>
          </div>
          <div class="rounded-xl p-4 border border-white/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.05] border-l-2 border-l-rose-400">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-semibold uppercase tracking-wider text-rose-500 dark:text-rose-400">Overdue</p>
              <div class="h-1.5 w-1.5 rounded-full bg-rose-500"></div>
            </div>
            <p class="text-3xl font-bold text-slate-900 dark:text-slate-100">{{ projectHealth.overdue }}</p>
            <p class="text-xs text-slate-400 mt-1">Due date passed, not done</p>
          </div>
        </div>
        <!-- Health Visual Bar -->
        <div v-if="projects.length > 0" class="space-y-1">
          <div class="h-2 rounded-full flex overflow-hidden gap-0.5 bg-white/30 dark:bg-white/[0.08]">
            <div
              v-if="projectHealth.onTrack > 0"
              class="h-full bg-emerald-400/80 dark:bg-emerald-500/70 rounded-l-full transition-all duration-500"
              :style="{ width: `${(projectHealth.onTrack / projects.length) * 100}%` }"
            />
            <div
              v-if="projectHealth.attention > 0"
              class="h-full bg-amber-400/80 dark:bg-amber-500/70 transition-all duration-500"
              :style="{ width: `${(projectHealth.attention / projects.length) * 100}%` }"
            />
            <div
              v-if="projectHealth.overdue > 0"
              class="h-full bg-rose-400/80 dark:bg-rose-500/70 rounded-r-full transition-all duration-500"
              :style="{ width: `${(projectHealth.overdue / projects.length) * 100}%` }"
            />
          </div>
        </div>
      </UiCardContent>
    </UiCard>


  </div>
</template>

<script setup lang="ts">
import { Users, FolderKanban, CheckSquare, Megaphone } from 'lucide-vue-next'

const route = useRoute()
const teamStore = useTeamStore()
const authStore = useAuthStore()
const api = useApi()

const teamId = computed(() => route.params.teamId as string)

// ── State ──────────────────────────────────────────────────────────────
const isLoading = ref(false)
const recentAnnouncements = ref<any[]>([])
const activeTasks = ref<any[]>([])
const activeTaskCount = ref(0)
const completedTaskCount = ref(0)
const todoCount = ref(0)
const inProgressCount = ref(0)
const reviewCount = ref(0)
const upcomingEvents = ref<any[]>([])
const projects = ref<any[]>([])

const team = computed(() => teamStore.currentTeam)
const teamName = computed(() => team.value?.name ?? '')
const teamDescription = computed(() => (team.value as any)?.description ?? '')

const quickStats = computed(() => [
  {
    label: 'Members',
    value: team.value?._count?.members ?? '-',
    icon: Users,
    iconBg: 'bg-slate-100 dark:bg-slate-700/60',
    iconColor: 'text-sky-500 dark:text-sky-400',
    labelColor: 'text-slate-500 dark:text-slate-400',
    bar: 'bg-sky-400/60 dark:bg-sky-500/50',
  },
  {
    label: 'Projects',
    value: team.value?._count?.projects ?? '-',
    icon: FolderKanban,
    iconBg: 'bg-slate-100 dark:bg-slate-700/60',
    iconColor: 'text-violet-500 dark:text-violet-400',
    labelColor: 'text-slate-500 dark:text-slate-400',
    bar: 'bg-violet-400/60 dark:bg-violet-500/50',
  },
  {
    label: 'Active Tasks',
    value: activeTaskCount.value,
    icon: CheckSquare,
    iconBg: 'bg-slate-100 dark:bg-slate-700/60',
    iconColor: 'text-amber-500 dark:text-amber-400',
    labelColor: 'text-slate-500 dark:text-slate-400',
    bar: 'bg-amber-400/60 dark:bg-amber-500/50',
  },
  {
    label: 'Announcements',
    value: team.value?._count?.announcements ?? '-',
    icon: Megaphone,
    iconBg: 'bg-slate-100 dark:bg-slate-700/60',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    labelColor: 'text-slate-500 dark:text-slate-400',
    bar: 'bg-emerald-400/60 dark:bg-emerald-500/50',
  },
])

const totalTaskCount = computed(() => todoCount.value + inProgressCount.value + reviewCount.value + completedTaskCount.value)

const taskDist = computed(() => {
  const total = totalTaskCount.value || 1
  return {
    todo: todoCount.value,
    inProgress: inProgressCount.value,
    review: reviewCount.value,
    done: completedTaskCount.value,
    todoP: (todoCount.value / total) * 100,
    inProgressP: (inProgressCount.value / total) * 100,
    reviewP: (reviewCount.value / total) * 100,
    doneP: (completedTaskCount.value / total) * 100,
  }
})

const taskStatuses = computed(() => [
  { label: 'Todo', count: todoCount.value, dot: 'bg-slate-400' },
  { label: 'In Progress', count: inProgressCount.value, dot: 'bg-sky-500' },
  { label: 'Review', count: reviewCount.value, dot: 'bg-amber-500' },
  { label: 'Done', count: completedTaskCount.value, dot: 'bg-emerald-500' },
])

const myAssignedTaskCount = computed(() =>
  activeTasks.value.filter((t) => t.assignee?.id === authStore.currentUser?.id).length,
)

const myDueSoonCount = computed(() => {
  const now = new Date()
  const nextWeek = new Date(now)
  nextWeek.setDate(now.getDate() + 7)
  return activeTasks.value.filter((t) => {
    if (!t.dueDate || t.assignee?.id !== authStore.currentUser?.id) return false
    const due = new Date(t.dueDate)
    return due >= now && due <= nextWeek
  }).length
})

const projectHealth = computed(() => {
  const now = new Date()
  let onTrack = 0
  let attention = 0
  let overdue = 0

  for (const p of projects.value) {
    const progress = Number(p.progress ?? 0)
    const isCompleted = p.status === 'COMPLETED'
    const isOverdue = !!p.dueDate && new Date(p.dueDate) < now && !isCompleted

    if (isOverdue) { overdue += 1; continue }
    if (isCompleted || progress >= 60) onTrack += 1
    else attention += 1
  }

  return { onTrack, attention, overdue }
})

const upcomingTimeline = computed(() => {
  const now = new Date()

  const eventItems = upcomingEvents.value
    .filter((e) => new Date(e.startDate) >= now)
    .map((e) => ({
      id: `event-${e.id}`,
      title: e.title,
      subtitle: `Event · ${new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      badge: 'Event',
      variant: 'info',
      time: new Date(e.startDate).getTime(),
    }))

  const deadlineItems = projects.value
    .filter((p) => !!p.dueDate && p.status !== 'COMPLETED')
    .map((p) => ({
      id: `project-${p.id}`,
      title: p.name,
      subtitle: `Project deadline · ${new Date(p.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      badge: 'Deadline',
      variant: 'warning',
      time: new Date(p.dueDate).getTime(),
    }))

  return [...eventItems, ...deadlineItems]
    .sort((a, b) => a.time - b.time)
    .slice(0, 5)
})

// ── Fetch ──────────────────────────────────────────────────────────────
const fetchData = async () => {
  isLoading.value = true
  try {
    const [annRes, taskRes, eventRes, projectRes] = await Promise.all([
      api.get<{ success: boolean; data: any[] }>(`/teams/${teamId.value}/announcements`),
      api.get<{ success: boolean; data: Record<string, any[]> }>(`/teams/${teamId.value}/tasks`),
      api.get<{ success: boolean; data: any[] }>(`/teams/${teamId.value}/events`),
      api.get<{ success: boolean; data: any[] }>(`/teams/${teamId.value}/projects`),
    ])
    recentAnnouncements.value = (annRes.data ?? []).slice(0, 3)
    upcomingEvents.value = eventRes.data ?? []
    projects.value = projectRes.data ?? []
    const { TODO = [], IN_PROGRESS = [], REVIEW = [], DONE = [] } = taskRes.data ?? {}
    const allActive = [...TODO, ...IN_PROGRESS, ...REVIEW]
    todoCount.value = TODO.length
    inProgressCount.value = IN_PROGRESS.length
    reviewCount.value = REVIEW.length
    activeTaskCount.value = allActive.length
    completedTaskCount.value = DONE.length
    activeTasks.value = allActive.slice(0, 5)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await teamStore.fetchTeam(teamId.value)
  await fetchData()
})

watch(teamId, async () => {
  await teamStore.fetchTeam(teamId.value)
  await fetchData()
})

// ── Helpers ────────────────────────────────────────────────────────────
const formatTime = (date: string) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const statusColor = (status: string) => {
  const colors: Record<string, string> = {
    TODO: 'bg-slate-400',
    IN_PROGRESS: 'bg-sky-500',
    REVIEW: 'bg-amber-500',
    DONE: 'bg-emerald-500',
  }
  return colors[status] ?? 'bg-slate-400'
}

const priorityVariant = (priority: string) => {
  const variants: Record<string, string> = {
    LOW: 'secondary', MEDIUM: 'info', HIGH: 'warning', URGENT: 'danger',
  }
  return (variants[priority] ?? 'secondary') as any
}
</script>
