<template>
  <div class="space-y-8">
    <!-- Header Banner -->
    <div class="relative overflow-hidden bg-[linear-gradient(135deg,rgba(219,236,255,0.75)_0%,rgba(186,215,248,0.55)_40%,rgba(162,200,238,0.45)_100%)] dark:bg-[linear-gradient(135deg,#1B263B_0%,#111827_100%)] rounded-3xl p-6 md:p-8 text-[#1C3C62] dark:text-white mb-8 shadow-[0_8px_32px_rgba(42,74,116,0.12)] dark:shadow-xl border border-white/70 dark:border-white/5 backdrop-blur-xl ring-1 ring-[#7EB8E5]/20 dark:ring-0">
      <!-- Glass shimmer overlays (light mode only) -->
      <div class="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent dark:opacity-0 rounded-3xl pointer-events-none"></div>
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:opacity-0 rounded-t-3xl pointer-events-none"></div>
      <div class="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          <div class="p-3.5 bg-[#2A4A74]/15 dark:bg-white/10 rounded-2xl border border-[#2A4A74]/20 dark:border-white/10">
             <LayoutDashboard class="w-8 h-8 text-[#1C3C62] dark:text-white" />
          </div>
          <div>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight">Workspace Command Center</h1>
            <p class="text-[#2A4A74]/70 dark:text-slate-300 mt-1 flex items-center gap-2">
              Welcome back,
              <ClientOnly><span class="font-semibold text-[#1C3C62] dark:text-white">{{ authStore.user?.name ?? 'there' }}</span></ClientOnly>
              <span class="hidden md:inline text-[#2A4A74]/20 dark:text-white/20">•</span>
              <span class="text-sm opacity-80">Monitor team workload and projects.</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in stats"
        :key="`header-${stat.label}`"
        class="group relative bg-white/40 dark:bg-white/[0.03] backdrop-blur-md rounded-2xl p-5 border border-white/60 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(42,74,116,0.04)] hover:shadow-[0_8px_32px_rgba(42,74,116,0.08)] hover:bg-white/60 dark:hover:bg-white/[0.05] transition-all duration-300"
      >
        <div class="flex items-start justify-between">
          <div :class="`p-2.5 rounded-xl ${stat.iconBg} bg-opacity-10 dark:bg-opacity-20`">
             <component :is="stat.icon" :class="`w-5 h-5 ${stat.iconColor}`" />
          </div>
           <div class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#2A4A74]/5 dark:bg-white/5 text-[#2A4A74]/50 dark:text-slate-400 border border-[#2A4A74]/10 dark:border-white/5 uppercase tracking-widest">
             Status
          </div>
        </div>
        <div class="mt-5">
          <p class="text-[10px] font-bold text-[#2A4A74]/40 dark:text-slate-500 uppercase tracking-[0.14em] leading-tight">{{ stat.label }}</p>
          <p class="text-3xl font-extrabold text-[#1C3C62] dark:text-white mt-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ stat.value }}</p>
          <div class="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-medium">
             <div class="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div> <span class="opacity-70 uppercase tracking-tighter">Live Updates</span>
          </div>
        </div>
      </div>
    </div>

    <!-- My Teams -->
    <UiCard class="overflow-hidden">
      <UiCardHeader class="border-b border-slate-100 dark:border-slate-800/60 pb-4">
        <div class="flex items-center justify-between w-full">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">My Teams</h2>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400">{{ teams.length }} active teams</span>
            <UiButton size="sm" @click="showCreateTeam = true">
              <Plus class="h-3.5 w-3.5 mr-1" />
              New Team
            </UiButton>
          </div>
        </div>
      </UiCardHeader>
        
        <div v-if="teamStore.isLoading" class="p-6 space-y-4">
           <div v-for="n in 3" :key="n" class="h-16 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
        </div>

        <div v-else-if="teams.length === 0" class="p-12 text-center text-slate-400 text-sm">
          No teams yet. Create your first team to get started!
        </div>

        <div v-else class="divide-y divide-slate-100 dark:divide-slate-800/60">
          <NuxtLink
            v-for="team in teams"
            :key="team.id"
            :to="`/teams/${team.id}`"
            class="block group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors p-4 sm:px-6"
          >
            <div class="flex items-center gap-4">
              <!-- Team Icon -->
              <div class="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 border border-slate-200 dark:border-white/[0.05]">
                {{ team.name.slice(0, 2).toUpperCase() }}
              </div>
              
              <!-- Team Info -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-0.5">
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-sm">{{ team.name }}</h3>
                   <UiBadge :variant="team.role === 'ADMIN' ? 'info' : 'secondary'" class="text[10px] px-1.5 py-0">
                    {{ team.role === 'ADMIN' ? 'Manager' : 'Member' }}
                  </UiBadge>
                </div>
                <div class="flex items-center gap-3 text-xs text-slate-400">
                  <span class="flex items-center gap-1"><Users class="w-3 h-3" /> {{ team._count?.members ?? 0 }} members</span>
                  <span class="hidden sm:flex items-center gap-1"><Target class="w-3 h-3" /> {{ team._count?.projects ?? 0 }} projects</span>
                </div>
              </div>

               <!-- Team Stats (Right side) -->
              <div class="hidden sm:flex items-center gap-6 text-xs text-slate-500 shrink-0">
                 <div class="text-right">
                    <p class="font-medium text-slate-900 dark:text-slate-100">{{ team._count?.tasks ?? 0 }}</p>
                    <p class="text-[10px] text-slate-400 uppercase tracking-wide">Tasks</p>
                 </div>
                 <div class="text-right">
                    <p class="font-medium text-slate-900 dark:text-slate-100">{{ team._count?.announcements ?? 0 }}</p>
                    <p class="text-[10px] text-slate-400 uppercase tracking-wide">Updates</p>
                 </div>
              </div>
              
              <!-- Chevron -->
              <div class="text-slate-300 group-hover:text-primary-400 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>
          </NuxtLink>
        </div>
      </UiCard>

    <!-- Workload Chart + Focus Today -->
    <div class="grid grid-cols-1 xl:grid-cols-5 gap-4">
      <!-- Personal Task Activity Chart -->
      <UiCard class="xl:col-span-3 overflow-hidden flex flex-col h-full min-h-[400px]">
        <UiCardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <UiCardTitle class="text-base">My Task Activity</UiCardTitle>
            <span class="text-xs text-slate-400">Last 7 days</span>
          </div>
        </UiCardHeader>
        <UiCardContent class="flex-1 w-full relative p-4">
          <ClientOnly>
            <div v-if="isStatsLoading" class="absolute inset-0 p-4 flex flex-col gap-3 justify-end">
              <div class="h-2 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-full w-3/4 self-end"></div>
              <div class="flex items-end gap-2 h-40">
                <div v-for="n in 7" :key="n" class="flex-1 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-t-md" :style="`height: ${20 + (n * 11) % 70}%`"></div>
              </div>
            </div>
            <div v-else-if="taskStats.length === 0" class="absolute inset-0 p-4 flex flex-col items-center justify-center gap-2 text-slate-400">
              <CheckSquare class="w-8 h-8 opacity-25" />
              <p class="text-sm font-medium">No task activity in the last 7 days</p>
              <p class="text-xs opacity-70">Tasks assigned to you will appear here</p>
            </div>
            <div v-else class="absolute inset-0 p-4">
              <Line :data="chartData" :options="chartOptions" :key="`chart-${taskStats.length}-${isDark}`" />
            </div>
            <template #fallback>
              <div class="h-full w-full flex items-center justify-center text-slate-400 text-sm">Loading chart...</div>
            </template>
          </ClientOnly>
        </UiCardContent>
      </UiCard>

      <!-- Focus Today -->
      <UiCard class="xl:col-span-2">
        <UiCardHeader>
          <UiCardTitle class="text-base">Focus Today</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="pt-2 space-y-3">
          <div class="rounded-xl p-3.5 bg-white/40 dark:bg-white/[0.05] border-l-2 border-[#778DA9] border border-white/60 dark:border-white/[0.08]">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-[#415A77] dark:text-[#E0E1DD]">Top Priority</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
              {{ focusTopPriorityText }}
            </p>
          </div>
          <div class="rounded-xl p-3.5 bg-white/40 dark:bg-white/[0.05] border-l-2 border-primary-400 border border-white/60 dark:border-white/[0.08]">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400">Collaboration</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
              {{ focusCollaborationText }}
            </p>
          </div>
          <div class="rounded-xl p-3.5 bg-white/40 dark:bg-white/[0.05] border-l-2 border-[#415A77] border border-white/60 dark:border-white/[0.08]">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-[#1B263B] dark:text-[#E0E1DD]">Coverage</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
              {{ focusCoverageText }}
            </p>
          </div>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Pending Invitations -->
    <div v-if="pendingInvites.length > 0">
      <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">Pending Invitations</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="invite in pendingInvites" :key="invite.id">
          <UiCardContent class="pt-4">
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-white/50 dark:bg-white/[0.07] flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 border border-white/70 dark:border-white/[0.10]">
                  {{ invite.team.name.slice(0, 2).toUpperCase() }}
                </div>
                <div>
                  <p class="font-semibold text-slate-900 dark:text-slate-100 text-sm">{{ invite.team.name }}</p>
                  <p class="text-xs text-slate-400">by <span class="font-medium text-slate-500 dark:text-slate-400">{{ invite.sender.name }}</span></p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <UiButton size="sm" variant="outline" class="flex-1" :loading="decliningId === invite.id" @click="handleDeclineInvite(invite)">Decline</UiButton>
                <UiButton size="sm" class="flex-1" :loading="acceptingId === invite.id" @click="handleAcceptInvite(invite)">Accept</UiButton>
              </div>
            </div>
          </UiCardContent>
        </UiCard>
      </div>
    </div>

    <!-- Create Team Modal -->
    <UiModal v-model="showCreateTeam" title="Create New Team">
      <form class="space-y-4" @submit.prevent="handleCreateTeam">
        <div v-if="createError" class="rounded-xl bg-[#F6EAEA]/90 dark:bg-[#6A2F2F]/18 border border-[#B85C5C]/35 px-3.5 py-2.5 text-sm text-[#6A2F2F] dark:text-[#F6EAEA]">{{ createError }}</div>
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Team Name</label>
          <UiInput v-model="newTeamName" placeholder="e.g. Engineering Team" required />
        </div>
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Description <span class="text-slate-400 font-normal">(optional)</span></label>
          <UiTextarea v-model="newTeamDesc" placeholder="What does this team do?" :rows="3" />
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <UiButton variant="outline" type="button" @click="showCreateTeam = false">Cancel</UiButton>
          <UiButton type="submit" :loading="isCreating">Create Team</UiButton>
        </div>
      </form>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { Plus, Users, CheckSquare, Megaphone, Mail, Target, LayoutDashboard } from 'lucide-vue-next'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const authStore = useAuthStore()
const teamStore = useTeamStore()
const api = useApi()

const showCreateTeam = ref(false)
const newTeamName = ref('')
const newTeamDesc = ref('')
const createError = ref('')
const isCreating = ref(false)

interface Invite {
  id: string
  team: { id: string; name: string }
  sender: { name: string }
  role: string
}
const pendingInvites = ref<Invite[]>([])
const acceptingId = ref<string | null>(null)
const decliningId = ref<string | null>(null)

// Task Stats for Chart
const taskStats = ref<{ date: string; assigned: number; completed: number }[]>([])
const isStatsLoading = ref(true)
const { isDark } = useTheme()

const teams = computed(() => teamStore.teams)
const totalProjects = computed(() => teams.value.reduce((a, t) => a + (t._count?.projects ?? 0), 0))
const managedTeams = computed(() => teams.value.filter((t) => t.role === 'ADMIN').length)
const teamTaskLoads = computed(() =>
  teams.value.map((team) => ({
    name: team.name,
    tasks: team._count?.tasks ?? 0,
  }))
)
const dynamicHighLoadThreshold = computed(() => {
  const loads = teamTaskLoads.value.map((item) => item.tasks).filter((count) => count > 0)
  if (!loads.length) return 0
  const sorted = [...loads].sort((a, b) => a - b)
  const q3Index = Math.floor((sorted.length - 1) * 0.75)
  return Math.max(5, sorted[q3Index] ?? 0)
})
const overloadedTeams = computed(() =>
  dynamicHighLoadThreshold.value === 0
    ? []
    : teamTaskLoads.value
        .filter((item) => item.tasks > dynamicHighLoadThreshold.value)
        .sort((a, b) => b.tasks - a.tasks)
)
const focusTopPriorityText = computed(() => {
  if (!teams.value.length) {
    return 'Create your first team to start tracking workload insights.'
  }
  if (dynamicHighLoadThreshold.value === 0) {
    return 'No active tasks yet. Add tasks to generate workload priorities.'
  }
  if (!overloadedTeams.value.length) {
    return `No team is above the current load threshold (${dynamicHighLoadThreshold.value} tasks).`
  }
  const topTeam = overloadedTeams.value[0]
  const extraTeams = overloadedTeams.value.length - 1
  if (!topTeam) {
    return `Review teams with task load above ${dynamicHighLoadThreshold.value}.`
  }
  return extraTeams > 0
    ? `${topTeam.name} leads with ${topTeam.tasks} tasks, plus ${extraTeams} more high-load team${extraTeams === 1 ? '' : 's'}.`
    : `${topTeam.name} is above threshold with ${topTeam.tasks} tasks (${dynamicHighLoadThreshold.value}+ threshold).`
})
const focusCollaborationText = computed(() => {
  if (!pendingInvites.value.length) {
    return 'No pending invites right now. Collaboration queue is clear.'
  }
  return `${pendingInvites.value.length} pending invite${pendingInvites.value.length === 1 ? '' : 's'} waiting response.`
})
const focusCoverageText = computed(() => {
  if (!teams.value.length) {
    return 'Join or create a team to build your collaboration coverage.'
  }
  const memberTeams = teams.value.length - managedTeams.value
  if (memberTeams <= 0) {
    return `You are managing all ${teams.value.length} team${teams.value.length === 1 ? '' : 's'} currently.`
  }
  return `${memberTeams} team${memberTeams === 1 ? '' : 's'} where you contribute as member.`
})

const stats = computed(() => [
  { label: 'My Teams', value: String(teams.value.length), icon: Users, iconBg: 'bg-primary-50/80 dark:bg-primary-600/30', iconColor: 'text-primary-500 dark:text-primary-300', labelColor: 'text-slate-500 dark:text-slate-400', barColor: 'bg-primary-400/50 dark:bg-primary-500/50' },
  { label: 'My Projects', value: String(totalProjects.value), icon: Target, iconBg: 'bg-slate-100/80 dark:bg-slate-700/40', iconColor: 'text-slate-500 dark:text-slate-300', labelColor: 'text-slate-500 dark:text-slate-400', barColor: 'bg-slate-300/80 dark:bg-slate-600/40' },
  { label: 'Active Tasks', value: String(teams.value.reduce((a, t) => a + (t._count?.tasks ?? 0), 0)), icon: CheckSquare, iconBg: 'bg-slate-100/80 dark:bg-slate-700/40', iconColor: 'text-slate-500 dark:text-slate-300', labelColor: 'text-slate-500 dark:text-slate-400', barColor: 'bg-slate-300/80 dark:bg-slate-600/40' },
  { label: 'Pending Invites', value: String(pendingInvites.value.length), icon: Mail, iconBg: 'bg-slate-100/80 dark:bg-slate-700/40', iconColor: 'text-slate-500 dark:text-slate-300', labelColor: 'text-slate-500 dark:text-slate-400', barColor: 'bg-slate-300/80 dark:bg-slate-600/40' },
])

const chartData = computed(() => {
  // Sort stats by date to ensure correct order
  const sortedStats = [...taskStats.value].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  return {
    labels: sortedStats.map(s => {
      const d = new Date(s.date)
      return d.toLocaleDateString('en-US', { weekday: 'short' })
    }),
    datasets: [
      {
        label: 'Assigned',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx
          const gradient = ctx.createLinearGradient(0, 0, 0, 400)
          gradient.addColorStop(0, 'rgba(28, 100, 242, 0.15)')
          gradient.addColorStop(1, 'rgba(28, 100, 242, 0.01)')
          return gradient
        },
        borderColor: '#1c64f2',
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#1c64f2',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
        data: sortedStats.map(s => s.assigned),
        borderWidth: 3,
      },
      {
        label: 'Completed',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx
          const gradient = ctx.createLinearGradient(0, 0, 0, 400)
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)')
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)')
          return gradient
        },
        borderColor: '#10b981',
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#10b981',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
        data: sortedStats.map(s => s.completed),
        borderWidth: 3,
      }
    ]
  }
})

const chartOptions = computed(() => {
  const tickColor = isDark.value ? '#E0E1DD' : '#0D1B2A'
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'rectRounded',
          boxWidth: 12,
          boxHeight: 12,
          padding: 30,
          font: { size: 14, family: "'Inter', sans-serif", weight: 500 },
          color: tickColor,
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: isDark.value ? 'rgba(13, 27, 42, 0.95)' : 'rgba(224, 225, 221, 0.95)',
        titleColor: isDark.value ? '#E0E1DD' : '#0D1B2A',
        bodyColor: isDark.value ? '#E0E1DD' : '#1B263B',
        borderColor: 'rgba(224,225,221,0.4)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        titleFont: { size: 13, weight: 600, family: "'Inter', sans-serif" },
        bodyFont: { size: 12, family: "'Inter', sans-serif" },
        displayColors: true,
        boxPadding: 4,
        callbacks: {
          label: function(context: any) {
            return ` ${context.dataset.label}: ${context.parsed.y}`
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 10, family: "'Inter', sans-serif" },
          color: tickColor,
        },
        border: { display: false }
      },
      y: {
        grid: {
          color: isDark.value ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          drawTicks: false,
        },
        ticks: {
          stepSize: 1,
          font: { size: 10, family: "'Inter', sans-serif" },
          color: tickColor,
          padding: 10
        },
        beginAtZero: true,
        border: { display: false }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    elements: {
      line: {
        borderJoinStyle: 'round' as const
      }
    }
  }
})

onMounted(async () => {
  isStatsLoading.value = true
  try {
    const [, invitesRes, statsRes] = await Promise.all([
      teamStore.fetchTeams(),
      api.get<{ success: boolean; data: Invite[] }>('/invites').catch(() => ({ data: [] })),
      api.get<{ success: boolean; data: any[] }>('/users/me/stats/tasks').catch(() => ({ data: [] }))
    ])
    pendingInvites.value = invitesRes.data || []
    taskStats.value = Array.isArray(statsRes?.data) ? statsRes.data : []
  } catch { /* invites optional */ } finally {
    isStatsLoading.value = false
  }
})


const handleCreateTeam = async () => {
  if (!newTeamName.value.trim()) return
  createError.value = ''
  isCreating.value = true
  try {
    const team = await teamStore.createTeam(newTeamName.value.trim(), newTeamDesc.value.trim() || undefined)
    showCreateTeam.value = false
    newTeamName.value = ''
    newTeamDesc.value = ''
    await navigateTo(`/teams/${team.id}`)
  } catch (err: any) {
    createError.value = err?.data?.message ?? 'Failed to create team'
  } finally {
    isCreating.value = false
  }
}

const handleAcceptInvite = async (invite: Invite) => {
  acceptingId.value = invite.id
  try {
    await api.post(`/invites/${invite.id}/accept`)
    pendingInvites.value = pendingInvites.value.filter((i) => i.id !== invite.id)
    await teamStore.fetchTeams(true)
  } finally {
    acceptingId.value = null
  }
}

const handleDeclineInvite = async (invite: Invite) => {
  decliningId.value = invite.id
  try {
    await api.post(`/invites/${invite.id}/decline`)
    pendingInvites.value = pendingInvites.value.filter((i) => i.id !== invite.id)
  } finally {
    decliningId.value = null
  }
}
</script>
