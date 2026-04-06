<template>
  <div class="space-y-6">
    <!-- Team Header Banner -->
    <div class="relative overflow-hidden bg-[linear-gradient(135deg,rgba(219,236,255,0.75)_0%,rgba(186,215,248,0.55)_40%,rgba(162,200,238,0.45)_100%)] dark:bg-[linear-gradient(135deg,#1B263B_0%,#111827_100%)] rounded-3xl p-6 md:p-8 text-[#1C3C62] dark:text-white mb-8 shadow-[0_8px_32px_rgba(42,74,116,0.12)] dark:shadow-xl border border-white/70 dark:border-white/5 backdrop-blur-xl ring-1 ring-[#7EB8E5]/20 dark:ring-0">
      <!-- Glass shimmer overlays (light mode only) -->
      <div class="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent dark:opacity-0 rounded-3xl pointer-events-none"></div>
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:opacity-0 rounded-t-3xl pointer-events-none"></div>
      <div class="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          <div class="h-16 w-16 bg-[#2A4A74]/15 dark:bg-white/10 rounded-2xl border border-[#2A4A74]/20 dark:border-white/10 flex items-center justify-center text-2xl font-bold">
             {{ (teamName || 'TM').slice(0, 2).toUpperCase() }}
          </div>
          <div>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight">{{ teamName }}</h1>
            <p class="text-[#2A4A74]/70 dark:text-slate-300 mt-1 flex items-center gap-2">
              <span class="text-sm opacity-80">{{ teamDescription || 'Team collaboration workspace' }}</span>
              <span class="hidden md:inline text-[#2A4A74]/20 dark:text-white/20">•</span>
              <span class="text-xs opacity-70">{{ activeTaskCount }} active tasks</span>
            </p>
          </div>
        </div>
        
        <div>
           <UiButton class="bg-[#1C3C62] !text-white dark:bg-white/10 dark:!text-white dark:hover:bg-white/20 hover:bg-[#2A4A74] transition-all duration-300 shadow-lg px-6 py-2.5 rounded-xl font-bold border-none">
              <UserPlus class="w-4 h-4 mr-2 !text-white" />
              Invite Member
           </UiButton>
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

    <!-- Project Health -->
    <UiCard>
      <UiCardHeader>
        <UiCardTitle class="text-base">Project Health</UiCardTitle>
      </UiCardHeader>
      <UiCardContent class="pt-2">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="rounded-xl p-3.5 border border-white/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.05]">
            <div class="flex items-center justify-between mb-1.5">
              <p class="text-xs font-semibold uppercase tracking-wider text-[#15803D] dark:text-[#86EFAC]">On Track</p>
              <div class="h-3 w-3 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            </div>
            <p class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ projectHealth.onTrack }}</p>
            <p class="text-xs text-slate-400 mt-0.5">Progress ≥ 60% or completed</p>
          </div>
          <div class="rounded-xl p-3.5 border border-white/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.05]">
            <div class="flex items-center justify-between mb-1.5">
              <p class="text-xs font-semibold uppercase tracking-wider text-[#B45309] dark:text-[#FCD34D]">Needs Attention</p>
              <div class="h-3 w-3 rounded-full bg-[#FBBF24] shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
            </div>
            <p class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ projectHealth.attention }}</p>
            <p class="text-xs text-slate-400 mt-0.5">Progress &lt; 60% and active</p>
          </div>
          <div class="rounded-xl p-3.5 border border-white/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.05]">
            <div class="flex items-center justify-between mb-1.5">
              <p class="text-xs font-semibold uppercase tracking-wider text-[#DC2626] dark:text-[#FCA5A5]">Overdue</p>
              <div class="h-3 w-3 rounded-full bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
            </div>
            <p class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ projectHealth.overdue }}</p>
            <p class="text-xs text-slate-400 mt-0.5">Due date passed, not done</p>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <!-- Task Overview + My Assignment + Upcoming Timeline -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Task Distribution Chart -->
      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-base text-slate-900 dark:text-slate-100">Task Overview</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="pt-2">
          <div class="relative flex items-center justify-center py-6">
            <svg class="w-48 h-48 -rotate-90 transform" viewBox="0 0 160 160">
              <!-- Background circle -->
              <circle
                cx="80"
                cy="80"
                r="65"
                fill="transparent"
                stroke="currentColor"
                stroke-width="14"
                class="text-slate-100 dark:text-white/5"
              />
              <!-- Progress segments -->
              <circle
                v-for="seg in taskDonutSegments"
                :key="seg.label"
                cx="80"
                cy="80"
                r="65"
                fill="transparent"
                stroke-width="14"
                stroke-linecap="round"
                :stroke-dasharray="seg.dash"
                :stroke-dashoffset="seg.offset"
                :class="seg.color"
                class="transition-all duration-1000 ease-out"
              />
            </svg>
            
            <!-- Central Label -->
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center -mt-1">
              <span class="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
                {{ Math.round(taskDist.doneP) }}%
              </span>
              <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mt-2">
                Project Ended
              </span>
            </div>
          </div>

          <!-- Subtle Breakdown -->
          <div class="grid grid-cols-2 gap-2 mt-4">
            <div v-for="s in taskStatuses" :key="s.label" class="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <div :class="['h-2 w-2 rounded-full shrink-0 shadow-sm', s.dot]" />
              <div class="min-w-0 flex items-baseline justify-between w-full">
                <span class="text-[10px] font-medium text-slate-500 truncate mr-2">{{ s.label }}</span>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{{ s.count }}</span>
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
          <div class="rounded-xl p-4 border border-white/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.05] border-l-2 border-l-primary-400">
            <p class="text-xs font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400">Assigned To Me</p>
            <p class="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1.5">{{ myAssignedTaskCount }}</p>
            <p class="text-xs text-slate-400 mt-1">active tasks</p>
          </div>
          <div class="rounded-xl p-4 border border-white/60 dark:border-white/[0.08] bg-white/40 dark:bg-white/[0.05] border-l-2 border-l-amber-400">
            <p class="text-xs font-semibold uppercase tracking-wider text-[#415A77] dark:text-[#E0E1DD]">Due In 7 Days</p>
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
              <div :class="['h-2 w-2 rounded-full shrink-0', item.variant === 'info' ? 'bg-[#415A77]' : 'bg-[#C2A75C]']" />
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

  </div>
</template>

<script setup lang="ts">
import { Users, FolderKanban, CheckSquare, Megaphone, UserPlus } from 'lucide-vue-next'

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
    iconBg: 'bg-primary-50/80 dark:bg-primary-500/[0.10]',
    iconColor: 'text-primary-500 dark:text-primary-400',
    labelColor: 'text-slate-500 dark:text-slate-400',
    bar: 'bg-primary-400/50 dark:bg-primary-500/40',
  },
  {
    label: 'Projects',
    value: team.value?._count?.projects ?? '-',
    icon: FolderKanban,
    iconBg: 'bg-slate-100/80 dark:bg-white/[0.06]',
    iconColor: 'text-slate-500 dark:text-slate-400',
    labelColor: 'text-slate-500 dark:text-slate-400',
    bar: 'bg-slate-300/80 dark:bg-slate-500/30',
  },
  {
    label: 'Active Tasks',
    value: activeTaskCount.value,
    icon: CheckSquare,
    iconBg: 'bg-slate-100/80 dark:bg-white/[0.06]',
    iconColor: 'text-slate-500 dark:text-slate-400',
    labelColor: 'text-slate-500 dark:text-slate-400',
    bar: 'bg-slate-300/80 dark:bg-slate-500/30',
  },
  {
    label: 'Announcements',
    value: team.value?._count?.announcements ?? '-',
    icon: Megaphone,
    iconBg: 'bg-slate-100/80 dark:bg-white/[0.06]',
    iconColor: 'text-slate-500 dark:text-slate-400',
    labelColor: 'text-slate-500 dark:text-slate-400',
    bar: 'bg-slate-300/80 dark:bg-slate-500/30',
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
  { label: 'Todo', count: todoCount.value, dot: 'bg-slate-300 dark:bg-slate-600' },
  { label: 'In Progress', count: inProgressCount.value, dot: 'bg-[#93C5FD]' },
  { label: 'Review', count: reviewCount.value, dot: 'bg-[#60A5FA]' },
  { label: 'Done', count: completedTaskCount.value, dot: 'bg-[#3B82F6]' },
])

const taskDonutSegments = computed(() => {
  const total = totalTaskCount.value || 1
  const circumference = 2 * Math.PI * 65 // ~408.4
  let currentOffset = 0
  
  const items = [
    { label: 'Done', count: completedTaskCount.value, color: 'stroke-[#3B82F6]' },
    { label: 'Review', count: reviewCount.value, color: 'stroke-[#60A5FA]' },
    { label: 'In Progress', count: inProgressCount.value, color: 'stroke-[#93C5FD]' },
    { label: 'Todo', count: todoCount.value, color: 'stroke-slate-300 dark:stroke-slate-600' },
  ].filter(i => i.count > 0)
  
  return items.map(item => {
    const percentage = (item.count / total) * 100
    const dash = (percentage / 100) * circumference
    const offset = currentOffset
    currentOffset += dash
    
    return {
      ...item,
      dash: `${dash} ${circumference}`,
      offset: -offset
    }
  })
})

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
  await Promise.all([
    teamStore.fetchTeam(teamId.value),
    fetchData(),
  ])
})

watch(teamId, async () => {
  await Promise.all([
    teamStore.fetchTeam(teamId.value, true),
    fetchData(),
  ])
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
    TODO: 'bg-[#E0E1DD]',
    IN_PROGRESS: 'bg-[#778DA9]',
    REVIEW: 'bg-[#415A77]',
    DONE: 'bg-[#1B263B]',
  }
  return colors[status] ?? 'bg-[#E0E1DD]'
}

const priorityVariant = (priority: string) => {
  const variants: Record<string, string> = {
    LOW: 'secondary', MEDIUM: 'info', HIGH: 'warning', URGENT: 'danger',
  }
  return (variants[priority] ?? 'secondary') as any
}
</script>
