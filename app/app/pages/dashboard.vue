<template>
  <div class="space-y-8">
    <!-- Header Banner -->
    <div class="rounded-3xl p-6 md:p-7 border border-primary-200/40 dark:border-primary-500/20 bg-[radial-gradient(circle_at_20%_20%,rgba(61,137,187,0.15),transparent_45%),linear-gradient(135deg,#f9fcff_0%,#eff6fb_45%,#e8f2f8_100%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(61,137,187,0.18),transparent_42%),linear-gradient(135deg,#0a1422_0%,#0b192a_60%,#10263a_100%)]">
      <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Workspace Command Center</h1>
      <p class="text-sm md:text-base text-slate-600 dark:text-slate-300 mt-1.5">
        Welcome back,
        <ClientOnly><span class="font-semibold text-primary-600 dark:text-primary-400">{{ authStore.user?.name ?? 'there' }}</span></ClientOnly>.
        Pantau beban kerja tim, health project, dan prioritas harian dari satu tempat.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
        <div class="rounded-2xl px-4 py-3 bg-white/80 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
          <p class="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">Managed Teams</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ managedTeams }}</p>
        </div>
        <div class="rounded-2xl px-4 py-3 bg-white/80 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
          <p class="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">Total Projects</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ totalProjects }}</p>
        </div>
        <div class="rounded-2xl px-4 py-3 bg-white/80 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
          <p class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Avg Tasks / Team</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ avgTasksPerTeam }}</p>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UiCard v-for="stat in stats" :key="stat.label" class="overflow-hidden">
        <UiCardContent class="pt-5">
          <div class="flex items-center justify-between">
            <div>
              <p :class="['text-[11px] font-semibold uppercase tracking-wider', stat.labelColor]">{{ stat.label }}</p>
              <p class="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1.5">{{ stat.value }}</p>
            </div>
            <div :class="['h-11 w-11 rounded-xl flex items-center justify-center', stat.iconBg]">
              <component :is="stat.icon" :class="['h-5 w-5', stat.iconColor]" />
            </div>
          </div>
          <div :class="['h-0.5 rounded-full mt-4', stat.barColor]"></div>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Workload Chart + Focus Today -->
    <div class="grid grid-cols-1 xl:grid-cols-5 gap-4">
      <!-- Team Workload Bar Chart -->
      <UiCard class="xl:col-span-3 overflow-hidden">
        <UiCardHeader>
          <div class="flex items-center justify-between">
            <UiCardTitle class="text-base">Team Workload</UiCardTitle>
            <span class="text-xs text-slate-400">Tasks per team</span>
          </div>
        </UiCardHeader>
        <UiCardContent class="pt-2 space-y-3">
          <div v-if="workloadTeams.length === 0" class="text-sm text-slate-400 text-center py-6">No teams yet.</div>
          <div
            v-for="team in workloadTeams"
            :key="team.id"
            class="space-y-1.5"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <div class="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 border border-slate-200 dark:border-slate-600">
                  {{ team.name.slice(0, 2).toUpperCase() }}
                </div>
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{{ team.name }}</span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-xs text-slate-500">{{ team._count?.tasks ?? 0 }} tasks</span>
                <UiBadge :variant="team.role === 'MANAGER' ? 'info' : 'secondary'" class="text-[10px]">
                  {{ team.role === 'MANAGER' ? 'Lead' : 'Member' }}
                </UiBadge>
              </div>
            </div>
            <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                class="h-full rounded-full bg-sky-500 dark:bg-sky-500 transition-all duration-700"
                :style="{ width: `${maxTaskLoad > 0 ? Math.max(4, ((team._count?.tasks ?? 0) / maxTaskLoad) * 100) : 4}%` }"
              />
            </div>
          </div>
        </UiCardContent>
      </UiCard>

      <!-- Focus Today -->
      <UiCard class="xl:col-span-2">
        <UiCardHeader>
          <UiCardTitle class="text-base">Focus Today</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="pt-2 space-y-3">
          <div class="rounded-xl p-3.5 bg-slate-50 dark:bg-slate-800/50 border-l-2 border-amber-400 border border-slate-200 dark:border-slate-700">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Top Priority</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
              Review teams with task load above {{ highLoadThreshold }}
            </p>
          </div>
          <div class="rounded-xl p-3.5 bg-slate-50 dark:bg-slate-800/50 border-l-2 border-sky-400 border border-slate-200 dark:border-slate-700">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">Collaboration</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
              {{ pendingInvites.length }} pending invite{{ pendingInvites.length === 1 ? '' : 's' }} waiting response
            </p>
          </div>
          <div class="rounded-xl p-3.5 bg-slate-50 dark:bg-slate-800/50 border-l-2 border-emerald-400 border border-slate-200 dark:border-slate-700">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Coverage</p>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
              {{ teams.length - managedTeams }} team{{ teams.length - managedTeams === 1 ? '' : 's' }} where you contribute as member
            </p>
          </div>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- My Teams -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">My Teams</h2>
        <UiButton size="sm" @click="showCreateTeam = true">
          <Plus class="h-3.5 w-3.5 mr-1" />
          New Team
        </UiButton>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-if="teamStore.isLoading" v-for="n in 3" :key="n" class="animate-pulse h-28" />

        <div v-else-if="teams.length === 0" class="col-span-3 text-center py-12 text-slate-400 text-sm">
          No teams yet. Create your first team!
        </div>

        <NuxtLink
          v-else
          v-for="team in teams"
          :key="team.id"
          :to="`/teams/${team.id}`"
          class="block group"
        >
          <UiCard class="hover:border-slate-300 dark:hover:border-slate-600/50 transition-all cursor-pointer h-full">
            <UiCardContent class="pt-4">
              <div class="flex items-start gap-3">
                <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                  {{ team.name.slice(0, 2).toUpperCase() }}
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-sm">{{ team.name }}</h3>
                  <p class="text-xs text-slate-400 mt-0.5">{{ team._count?.members ?? 0 }} members</p>
                </div>
                <UiBadge :variant="team.role === 'MANAGER' ? 'info' : 'secondary'">
                  {{ team.role === 'MANAGER' ? 'Manager' : 'Member' }}
                </UiBadge>
              </div>
              <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/20 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                <span class="flex items-center gap-1">
                  <CheckSquare class="h-3 w-3" />
                  {{ team._count?.tasks ?? 0 }} tasks
                </span>
                <span class="flex items-center gap-1">
                  <Megaphone class="h-3 w-3" />
                  {{ team._count?.announcements ?? 0 }}
                </span>
                <span class="flex items-center gap-1">
                  <Target class="h-3 w-3" />
                  {{ team._count?.projects ?? 0 }} projects
                </span>
              </div>
            </UiCardContent>
          </UiCard>
        </NuxtLink>
      </div>
    </div>

    <!-- Pending Invitations -->
    <div v-if="pendingInvites.length > 0">
      <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">Pending Invitations</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UiCard v-for="invite in pendingInvites" :key="invite.id">
          <UiCardContent class="pt-4">
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
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
        <div v-if="createError" class="rounded-md bg-red-100 border border-red-300 px-4 py-3 text-sm text-red-700">{{ createError }}</div>
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

const teams = computed(() => teamStore.teams)
const totalProjects = computed(() => teams.value.reduce((a, t) => a + (t._count?.projects ?? 0), 0))
const managedTeams = computed(() => teams.value.filter((t) => t.role === 'MANAGER').length)
const avgTasksPerTeam = computed(() => {
  if (!teams.value.length) return 0
  const totalTasks = teams.value.reduce((a, t) => a + (t._count?.tasks ?? 0), 0)
  return Math.round((totalTasks / teams.value.length) * 10) / 10
})

const maxTaskLoad = computed(() => Math.max(...teams.value.map((t) => t._count?.tasks ?? 0), 1))
const highLoadThreshold = computed(() => Math.max(8, Math.ceil(maxTaskLoad.value * 0.7)))
const workloadTeams = computed(() =>
  [...teams.value]
    .sort((a, b) => (b._count?.tasks ?? 0) - (a._count?.tasks ?? 0))
    .slice(0, 5),
)

const stats = computed(() => [
  { label: 'My Teams', value: String(teams.value.length), icon: Users, iconBg: 'bg-sky-100 dark:bg-sky-900/40', iconColor: 'text-sky-600 dark:text-sky-400', labelColor: 'text-sky-600 dark:text-sky-400', barColor: 'bg-sky-400 dark:bg-sky-600' },
  { label: 'Active Tasks', value: String(teams.value.reduce((a, t) => a + (t._count?.tasks ?? 0), 0)), icon: CheckSquare, iconBg: 'bg-amber-100 dark:bg-amber-900/40', iconColor: 'text-amber-600 dark:text-amber-400', labelColor: 'text-amber-600 dark:text-amber-400', barColor: 'bg-amber-400 dark:bg-amber-600' },
  { label: 'Announcements', value: String(teams.value.reduce((a, t) => a + (t._count?.announcements ?? 0), 0)), icon: Megaphone, iconBg: 'bg-emerald-100 dark:bg-emerald-900/40', iconColor: 'text-emerald-600 dark:text-emerald-400', labelColor: 'text-emerald-600 dark:text-emerald-400', barColor: 'bg-emerald-400 dark:bg-emerald-600' },
  { label: 'Pending Invites', value: String(pendingInvites.value.length), icon: Mail, iconBg: 'bg-violet-100 dark:bg-violet-900/40', iconColor: 'text-violet-600 dark:text-violet-400', labelColor: 'text-violet-600 dark:text-violet-400', barColor: 'bg-violet-400 dark:bg-violet-600' },
])

onMounted(async () => {
  await teamStore.fetchTeams()
  try {
    const res = await api.get<{ success: boolean; data: Invite[] }>('/invites')
    pendingInvites.value = res.data
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
