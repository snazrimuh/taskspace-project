<template>
  <div class="space-y-8">
    <!-- Header Banner -->
    <div class="glass rounded-2xl p-6 md:p-7">
      <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Workspace Command Center</h1>
      <p class="text-sm md:text-base text-slate-600 dark:text-slate-300 mt-1.5">
        Welcome back,
        <ClientOnly><span class="font-semibold text-primary-600 dark:text-primary-400">{{ authStore.user?.name ?? 'there' }}</span></ClientOnly>.
        Pantau beban kerja tim, health project, dan prioritas harian dari satu tempat.
      </p>

      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(stat, idx) in stats"
          :key="`header-${stat.label}`"
          class="rounded-xl bg-white/40 dark:bg-white/[0.05] border border-white/60 dark:border-white/[0.1] p-4 flex items-center justify-between transition-transform hover:-translate-y-1 duration-300"
        >
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ stat.value }}</p>
          </div>
          <div :class="`p-2.5 rounded-lg ${stat.iconBg}`">
             <component :is="stat.icon" :class="`w-5 h-5 ${stat.iconColor}`" />
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
                    {{ team.role === 'ADMIN' ? 'Admin' : 'Member' }}
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
        <UiCardHeader>
          <div class="flex items-center justify-between">
            <UiCardTitle class="text-base">My Task Activity</UiCardTitle>
            <span class="text-xs text-slate-400">Last 7 days</span>
          </div>
        </UiCardHeader>
        <UiCardContent class="flex-1 w-full relative p-4">
          <ClientOnly>
            <div class="absolute inset-0 p-4">
              <Line :data="chartData" :options="chartOptions" />
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
          <div class="rounded-xl p-3.5 bg-white/40 dark:bg-white/[0.05] border-l-2 border-amber-400 border border-white/60 dark:border-white/[0.08]">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-amber-500 dark:text-amber-400">Top Priority</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
              Review teams with task load above {{ highLoadThreshold }}
            </p>
          </div>
          <div class="rounded-xl p-3.5 bg-white/40 dark:bg-white/[0.05] border-l-2 border-primary-400 border border-white/60 dark:border-white/[0.08]">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-primary-500 dark:text-primary-400">Collaboration</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
              {{ pendingInvites.length }} pending invite{{ pendingInvites.length === 1 ? '' : 's' }} waiting response
            </p>
          </div>
          <div class="rounded-xl p-3.5 bg-white/40 dark:bg-white/[0.05] border-l-2 border-emerald-400 border border-white/60 dark:border-white/[0.08]">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">Coverage</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
              {{ teams.length - managedTeams }} team{{ teams.length - managedTeams === 1 ? '' : 's' }} where you contribute as member
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
        <div v-if="createError" class="rounded-xl bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20 px-3.5 py-2.5 text-sm text-rose-700 dark:text-rose-400">{{ createError }}</div>
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
import { Plus, Users, CheckSquare, Megaphone, Mail, Target } from 'lucide-vue-next'
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

const teams = computed(() => teamStore.teams)
const totalProjects = computed(() => teams.value.reduce((a, t) => a + (t._count?.projects ?? 0), 0))
const managedTeams = computed(() => teams.value.filter((t) => t.role === 'ADMIN').length)

const stats = computed(() => [
  { label: 'My Team', value: String(teams.value.length), icon: Users, iconBg: 'bg-primary-50/80 dark:bg-primary-500/[0.10]', iconColor: 'text-primary-500 dark:text-primary-400', labelColor: 'text-slate-500 dark:text-slate-400', barColor: 'bg-primary-400/50 dark:bg-primary-500/40' },
  { label: 'My Project', value: String(totalProjects.value), icon: Target, iconBg: 'bg-slate-100/80 dark:bg-white/[0.06]', iconColor: 'text-slate-500 dark:text-slate-400', labelColor: 'text-slate-500 dark:text-slate-400', barColor: 'bg-slate-300/80 dark:bg-slate-500/30' },
  { label: 'Active Task', value: String(teams.value.reduce((a, t) => a + (t._count?.tasks ?? 0), 0)), icon: CheckSquare, iconBg: 'bg-slate-100/80 dark:bg-white/[0.06]', iconColor: 'text-slate-500 dark:text-slate-400', labelColor: 'text-slate-500 dark:text-slate-400', barColor: 'bg-slate-300/80 dark:bg-slate-500/30' },
  { label: 'Pending Invites', value: String(pendingInvites.value.length), icon: Mail, iconBg: 'bg-slate-100/80 dark:bg-white/[0.06]', iconColor: 'text-slate-500 dark:text-slate-400', labelColor: 'text-slate-500 dark:text-slate-400', barColor: 'bg-slate-300/80 dark:bg-slate-500/30' },
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
          const gradient = ctx.createLinearGradient(0, 0, 0, 300)
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)') // indigo-500
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)')
          return gradient
        },
        borderColor: '#6366f1', // indigo-500
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
        data: sortedStats.map(s => s.assigned),
        borderWidth: 2,
      },
      {
        label: 'Completed',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx
          const gradient = ctx.createLinearGradient(0, 0, 0, 300)
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)') // emerald-500
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)')
          return gradient
        },
        borderColor: '#10b981', // emerald-500
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
        data: sortedStats.map(s => s.completed),
        borderWidth: 2,
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      align: 'end' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 6,
        padding: 20,
        font: { size: 11, family: "'Inter', sans-serif", weight: 500 },
        color: '#94a3b8' // slate-400
      }
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: 'rgba(15, 23, 42, 0.95)', // slate-900 high opacity
      titleColor: '#f8fafc',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(255,255,255,0.05)',
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
      grid: { display: false, drawBorder: false },
      ticks: { 
        font: { size: 10, family: "'Inter', sans-serif" },
        color: '#94a3b8' // slate-400
      },
      border: { display: false }
    },
    y: {
      grid: { 
        color: 'rgba(255, 255, 255, 0.03)', 
        drawBorder: false,
      },
      ticks: { 
        stepSize: 1, 
        font: { size: 10, family: "'Inter', sans-serif" },
        color: '#94a3b8',
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

onMounted(async () => {
  await teamStore.fetchTeams()
  try {
    const [invitesRes, statsRes] = await Promise.all([
       api.get<{ success: boolean; data: Invite[] }>('/invites').catch(() => ({ data: [] })),
       api.get<{ success: boolean; data: any[] }>('/users/me/stats/tasks').catch(() => ({ data: [] }))
    ])
    pendingInvites.value = invitesRes.data || []
    taskStats.value = Array.isArray(statsRes?.data) ? statsRes.data : []
  } catch { /* invites optional */ }
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
    await teamStore.fetchTeams()
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
