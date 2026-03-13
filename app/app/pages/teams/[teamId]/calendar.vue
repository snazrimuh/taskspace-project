<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Team Calendar</h2>
      <UiButton v-if="isManager" @click="showCreate = true">
        <Plus class="h-4 w-4 mr-2" />
        Add Event
      </UiButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Calendar Grid -->
      <UiCard class="lg:col-span-2">
        <UiCardContent class="pt-4">
          <!-- Calendar Header -->
          <div class="flex items-center justify-between mb-4">
            <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700/40 rounded-lg" @click="prevMonth">
              <ChevronLeft class="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
            <h3 class="font-semibold text-slate-900 dark:text-slate-100">
              {{ monthYear }}
            </h3>
            <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700/40 rounded-lg" @click="nextMonth">
              <ChevronRight class="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          <!-- Day Headers -->
          <div class="grid grid-cols-7 gap-px mb-1">
            <div
              v-for="day in weekDays"
              :key="day"
              class="text-center text-xs font-medium text-slate-400 py-2"
            >
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7 gap-px">
            <div
              v-for="(day, i) in calendarDays"
              :key="i"
              :class="[
                'min-h-[80px] p-1.5 rounded-lg text-sm transition-colors',
                day.isCurrentMonth ? 'bg-white dark:bg-slate-800/20' : 'bg-slate-50 dark:bg-slate-900/40 text-slate-300 dark:text-slate-700',
                day.isToday ? 'ring-2 ring-primary-500' : '',
              ]"
            >
              <div :class="['text-xs mb-1', day.isToday ? 'font-bold text-primary-600' : 'text-slate-500']">
                {{ day.day }}
              </div>
              <div class="space-y-0.5">
                <div
                  v-for="(event, j) in day.events"
                  :key="j"
                  :class="[
                    'text-[10px] px-1.5 py-0.5 rounded-md truncate cursor-pointer',
                    eventColor(event.type),
                  ]"
                  @click="selectedEvent = event; showDetail = true"
                >
                  {{ event.title }}
                </div>
              </div>
            </div>
          </div>
        </UiCardContent>
      </UiCard>

      <!-- Upcoming Events Sidebar -->
      <div class="space-y-4">
        <UiCard>
          <UiCardHeader>
            <UiCardTitle class="text-base">Upcoming Events</UiCardTitle>
          </UiCardHeader>
          <UiCardContent class="space-y-3">
            <div
              v-for="(event, i) in upcomingEvents"
              :key="i"
              class="flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-xl p-2 -mx-2 transition-colors"
              @click="selectedEvent = event; showDetail = true"
            >
              <div :class="['h-2 w-2 rounded-full mt-1.5 shrink-0', eventDotColor(event.type)]" />
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{{ event.title }}</div>
                <div class="text-xs text-slate-500">{{ formatEventDate(event.startDate, event.endDate) }}</div>
              </div>
              <UiBadge :variant="eventBadgeVariant(event.type)" size="sm">{{ event.type }}</UiBadge>
            </div>
          </UiCardContent>
        </UiCard>

        <!-- Task Deadlines -->
        <UiCard>
          <UiCardHeader>
            <UiCardTitle class="text-base">My Task Deadlines</UiCardTitle>
          </UiCardHeader>
          <UiCardContent class="space-y-2">
            <div
              v-for="(task, i) in taskDeadlines"
              :key="task.id ?? i"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-slate-700 dark:text-slate-300 truncate">{{ task.title }}</span>
              <span class="text-xs text-slate-400 dark:text-slate-600 shrink-0 ml-2">{{ formatDueDate(task.dueDate) }}</span>
            </div>
            <div v-if="taskDeadlines.length === 0" class="text-xs text-slate-400 dark:text-slate-500">
              No personal task deadlines.
            </div>
          </UiCardContent>
        </UiCard>

        <!-- Project Deadlines -->
        <UiCard>
          <UiCardHeader>
            <UiCardTitle class="text-base">Project Deadlines</UiCardTitle>
          </UiCardHeader>
          <UiCardContent class="space-y-2">
            <div
              v-for="(project, i) in projectDeadlines"
              :key="project.id ?? i"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-slate-700 dark:text-slate-300 truncate">{{ project.name }}</span>
              <span class="text-xs text-slate-400 dark:text-slate-600 shrink-0 ml-2">{{ formatDueDate(project.dueDate) }}</span>
            </div>
            <div v-if="projectDeadlines.length === 0" class="text-xs text-slate-400 dark:text-slate-500">
              No project deadlines.
            </div>
          </UiCardContent>
        </UiCard>
      </div>
    </div>

    <!-- Create Event Modal -->
    <UiModal v-model="showCreate" title="Create Event">
      <form class="space-y-4" @submit.prevent="handleCreate">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
          <UiInput v-model="newEvent.title" placeholder="Event title" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <UiTextarea v-model="newEvent.description" placeholder="Event description..." :rows="2" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
            <UiSelect v-model="newEvent.type">
              <option value="MEETING">Meeting</option>
              <option value="TRAINING">Training</option>
              <option value="DEADLINE">Deadline</option>
              <option value="INTERNAL">Internal</option>
            </UiSelect>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
            <UiInput v-model="newEvent.startDate" type="datetime-local" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date (optional)</label>
          <UiInput v-model="newEvent.endDate" type="datetime-local" />
        </div>
        <p v-if="createError" class="text-sm text-red-600 dark:text-red-400">{{ createError }}</p>
        <div class="flex justify-end gap-2">
          <UiButton variant="outline" type="button" @click="showCreate = false">Cancel</UiButton>
          <UiButton type="submit" :disabled="isCreating">{{ isCreating ? 'Creating...' : 'Create Event' }}</UiButton>
        </div>
      </form>
    </UiModal>

    <!-- Event Detail Modal -->
    <UiModal v-model="showDetail" :title="selectedEvent?.title || ''">
      <div v-if="selectedEvent" class="space-y-3">
        <UiBadge :variant="eventBadgeVariant(selectedEvent.type)">{{ selectedEvent.type }}</UiBadge>
        <div v-if="selectedEvent.description" class="text-sm text-slate-700 dark:text-slate-300">{{ selectedEvent.description }}</div>
        <div class="text-sm text-slate-500">{{ formatEventDate(selectedEvent.startDate, selectedEvent.endDate) }}</div>
        <div class="text-xs text-slate-400">Created by {{ selectedEvent.createdBy?.name }}</div>
        <div v-if="isManager && !selectedEvent._isTaskDeadline && !selectedEvent._isProjectDeadline" class="flex justify-end pt-2">
          <UiButton variant="danger" size="sm" @click="handleDelete(selectedEvent.id)">Delete Event</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { Plus, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const route = useRoute()
const teamStore = useTeamStore()
const authStore = useAuthStore()
const api = useApi()

const teamId = computed(() => route.params.teamId as string)
const isManager = computed(() => teamStore.isCurrentTeamManager)

// ── State ──────────────────────────────────────────────────────────────
const showCreate = ref(false)
const showDetail = ref(false)
const selectedEvent = ref<any>(null)
const events = ref<any[]>([])
const projects = ref<any[]>([])
const taskDeadlines = ref<any[]>([])
const myTasks = ref<any[]>([])
const projectDeadlines = ref<any[]>([])
const isLoading = ref(false)
const isCreating = ref(false)
const createError = ref('')

const currentDate = ref(new Date())
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const newEvent = reactive({
  title: '',
  description: '',
  type: 'MEETING',
  startDate: '',
  endDate: '',
})

// ── Fetch ──────────────────────────────────────────────────────────────
const fetchData = async () => {
  isLoading.value = true
  try {
    const [evRes, taskRes, projectRes] = await Promise.all([
      api.get<{ success: boolean; data: any[] }>(`/teams/${teamId.value}/events`),
      api.get<{ success: boolean; data: Record<string, any[]> }>(`/teams/${teamId.value}/tasks`),
      api.get<{ success: boolean; data: any[] }>(`/teams/${teamId.value}/projects`),
    ])
    events.value = evRes.data ?? []
    projects.value = projectRes.data ?? []

    const allTasks = Object.values(taskRes.data ?? {}).flat() as any[]
    myTasks.value = allTasks.filter((t) => t.assignee?.id === authStore.currentUser?.id)

    taskDeadlines.value = myTasks.value
      .filter((t) => t.dueDate)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 6)

    projectDeadlines.value = projects.value
      .filter((p) => p.dueDate)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 6)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchData(),
    teamStore.fetchMembers(teamId.value),
  ])
})
watch(teamId, async () => {
  await Promise.all([
    fetchData(),
    teamStore.fetchMembers(teamId.value),
  ])
})

// ── Calendar computed ──────────────────────────────────────────────────
const monthYear = computed(() =>
  currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

const prevMonth = () => {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() - 1)
  currentDate.value = d
}

const nextMonth = () => {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() + 1)
  currentDate.value = d
}

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const today = new Date()
  const days: any[] = []

  // Previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, isToday: false, events: [] })
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year
    const dayEvents = events.value.filter((e) => {
      const d = new Date(e.startDate)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === i
    })
    // Merge personal task deadlines as virtual DEADLINE events
    const dayTaskDeadlines = myTasks.value
      .filter((t) => {
        if (!t.dueDate) return false
        const d = new Date(t.dueDate)
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === i
      })
      .map((t) => ({
        id: `task-${t.id}`,
        title: `Deadline: ${t.title}`,
        type: 'DEADLINE',
        startDate: t.dueDate,
        description: t.description,
        createdBy: t.createdBy,
        _isTaskDeadline: true,
      }))

    const dayProjectDeadlines = projectDeadlines.value
      .filter((p) => {
        if (!p.dueDate) return false
        const d = new Date(p.dueDate)
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === i
      })
      .map((p) => ({
        id: `project-${p.id}`,
        title: `Project Deadline: ${p.name}`,
        type: 'DEADLINE',
        startDate: p.dueDate,
        description: p.description,
        _isProjectDeadline: true,
      }))

    days.push({
      day: i,
      isCurrentMonth: true,
      isToday,
      events: [...dayEvents, ...dayProjectDeadlines, ...dayTaskDeadlines],
    })
  }

  // Next month filler
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, isCurrentMonth: false, isToday: false, events: [] })
  }

  return days
})

const upcomingEvents = computed(() => {
  const now = new Date()
  return events.value
    .filter((e) => new Date(e.startDate) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 8)
})

// ── Date helpers ───────────────────────────────────────────────────────
const formatEventDate = (startDate: string, endDate?: string) => {
  const s = new Date(startDate)
  const timeStr = s.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const dateStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (endDate) {
    const e = new Date(endDate)
    const eTime = e.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    return `${dateStr} ${timeStr} - ${eTime}`
  }
  return `${dateStr} ${timeStr}`
}

const formatDueDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Create ─────────────────────────────────────────────────────────────
const handleCreate = async () => {
  if (!newEvent.title.trim() || !newEvent.startDate) return
  createError.value = ''
  isCreating.value = true
  try {
    const res = await api.post<{ success: boolean; data: any }>(`/teams/${teamId.value}/events`, {
      title: newEvent.title.trim(),
      description: newEvent.description.trim() || undefined,
      type: newEvent.type,
      startDate: newEvent.startDate,
      endDate: newEvent.endDate || undefined,
    })
    events.value.push(res.data)
    Object.assign(newEvent, { title: '', description: '', type: 'MEETING', startDate: '', endDate: '' })
    showCreate.value = false
  } catch (err: any) {
    createError.value = err?.data?.message ?? 'Failed to create event'
  } finally {
    isCreating.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────────────────
const handleDelete = async (eventId: string) => {
  try {
    await api.delete(`/teams/${teamId.value}/events/${eventId}`)
    events.value = events.value.filter((e) => e.id !== eventId)
    showDetail.value = false
  } catch { /* ignore */ }
}

// ── Style helpers ──────────────────────────────────────────────────────
const eventColor = (type: string) => {
  const colors: Record<string, string> = {
    MEETING: 'bg-primary-100 text-primary-700',
    TRAINING: 'bg-purple-100 text-purple-700',
    DEADLINE: 'bg-red-100 text-red-700',
    INTERNAL: 'bg-emerald-100 text-emerald-700',
  }
  return colors[type] ?? 'bg-slate-100 text-slate-700'
}

const eventDotColor = (type: string) => {
  const colors: Record<string, string> = {
    MEETING: 'bg-primary-500',
    TRAINING: 'bg-purple-500',
    DEADLINE: 'bg-red-500',
    INTERNAL: 'bg-emerald-500',
  }
  return colors[type] ?? 'bg-slate-500'
}

const eventBadgeVariant = (type: string) => {
  const map: Record<string, any> = {
    MEETING: 'info',
    TRAINING: 'secondary',
    DEADLINE: 'danger',
    INTERNAL: 'success',
  }
  return map[type] ?? 'secondary'
}
</script>
