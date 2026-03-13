<template>
  <div class="space-y-6">
    <!-- Team Header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-4">
        <div class="h-14 w-14 rounded-2xl bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-600">
          {{ teamName.slice(0, 2).toUpperCase() }}
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ teamName }}</h1>
        <p class="text-sm text-slate-500">{{ teamDescription }}</p>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <UiCard v-for="stat in quickStats" :key="stat.label">
        <UiCardContent class="pt-4">
          <p class="text-sm text-slate-500">{{ stat.label }}</p>
          <p class="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ stat.value }}</p>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Recent Announcements -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Announcements</h2>
          <NuxtLink :to="`/teams/${teamId}/announcements`" class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
          View all
        </NuxtLink>
      </div>
      <div class="space-y-3">
        <UiCard v-for="(a, i) in recentAnnouncements" :key="a.id ?? i">
          <UiCardContent class="pt-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-slate-900 dark:text-slate-200">{{ a.title }}</h3>
                <p class="text-sm text-slate-500 mt-0.5">by {{ a.author?.name }} · {{ formatTime(a.createdAt) }}</p>
              </div>
              <UiBadge v-if="a.pinned" variant="warning">Pinned</UiBadge>
            </div>
          </UiCardContent>
        </UiCard>
      </div>
    </div>

    <!-- Active Tasks -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Active Tasks (Across Projects)</h2>
          <NuxtLink :to="`/teams/${teamId}/projects`" class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
          View projects
        </NuxtLink>
      </div>
      <UiCard>
        <UiCardContent class="pt-4 divide-y divide-slate-100 dark:divide-slate-700/20">
          <div
            v-for="(task, i) in activeTasks"
            :key="task.id ?? i"
            class="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-3">
              <div :class="['h-2 w-2 rounded-full', statusColor(task.status)]" />
              <span class="text-sm text-slate-700 dark:text-slate-300">{{ task.title }}</span>
            </div>
            <div class="flex items-center gap-2">
              <UiBadge :variant="priorityVariant(task.priority)" size="sm">{{ task.priority }}</UiBadge>
              <UiAvatar v-if="task.assignee" :name="task.assignee.name" size="sm" />
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Upcoming Events -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Upcoming Events</h2>
          <NuxtLink :to="`/teams/${teamId}/calendar`" class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
          View calendar
        </NuxtLink>
      </div>
      <div v-if="upcomingEvents.length === 0" class="text-sm text-slate-400">
        No upcoming events.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const teamStore = useTeamStore()
const api = useApi()

const teamId = computed(() => route.params.teamId as string)

// ── State ──────────────────────────────────────────────────────────────
const isLoading = ref(false)
const recentAnnouncements = ref<any[]>([])
const activeTasks = ref<any[]>([])
const activeTaskCount = ref(0)

const team = computed(() => teamStore.currentTeam)
const teamName = computed(() => team.value?.name ?? '')
const teamDescription = computed(() => (team.value as any)?.description ?? '')

const quickStats = computed(() => [
  { label: 'Members', value: team.value?._count?.members ?? '-' },
  { label: 'Projects', value: team.value?._count?.projects ?? '-' },
  { label: 'Active Tasks', value: activeTaskCount.value },
  { label: 'Announcements', value: team.value?._count?.announcements ?? '-' },
])

// ── Upcoming Events (placeholder until calendar is integrated) ─────────
const upcomingEvents: never[] = []

// ── Fetch ──────────────────────────────────────────────────────────────
const fetchData = async () => {
  isLoading.value = true
  try {
    const [annRes, taskRes] = await Promise.all([
      api.get<{ success: boolean; data: any[] }>(`/teams/${teamId.value}/announcements`),
      api.get<{ success: boolean; data: Record<string, any[]> }>(`/teams/${teamId.value}/tasks`),
    ])
    recentAnnouncements.value = (annRes.data ?? []).slice(0, 3)
    const { TODO = [], IN_PROGRESS = [], REVIEW = [] } = taskRes.data ?? {}
    const allActive = [...TODO, ...IN_PROGRESS, ...REVIEW]
    activeTaskCount.value = allActive.length
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
    IN_PROGRESS: 'bg-primary-500',
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
