<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Dashboard</h1>
      <p class="text-sm text-slate-500 dark:text-slate-500 mt-1">Welcome back, <ClientOnly><span class="font-semibold text-gradient">{{ authStore.user?.name ?? 'there' }}</span></ClientOnly>. Here's what's happening.</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <UiCard v-for="stat in stats" :key="stat.label" class="overflow-hidden relative group">
        <UiCardContent class="pt-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ stat.label }}</p>
              <p class="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1.5">{{ stat.value }}</p>
            </div>
            <div :class="['h-10 w-10 rounded-xl flex items-center justify-center', stat.iconBg]">
              <component :is="stat.icon" :class="['h-[18px] w-[18px]', stat.iconColor]" />
            </div>
          </div>
          <div :class="['h-0.5 rounded-full mt-4', stat.barColor]"></div>
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
        <!-- Loading skeleton -->
        <div v-if="teamStore.isLoading" v-for="n in 3" :key="n" class="rounded-2xl border border-slate-200 dark:border-slate-700/40 animate-pulse h-28" />

        <!-- Empty state -->
        <div v-else-if="teams.length === 0" class="col-span-3 text-center py-12 text-slate-400">
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
                  <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{{ team._count?.members ?? 0 }} members</p>
                </div>
                <UiBadge :variant="team.role === 'MANAGER' ? 'default' : 'secondary'">
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
                  {{ team._count?.announcements ?? 0 }} announcements
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
        <UiCard v-for="invite in pendingInvites" :key="invite.id" class="border-primary-200/60 dark:border-primary-500/15">
          <UiCardContent class="pt-4">
            <div class="flex flex-col gap-3">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-500/10 dark:to-primary-500/5 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400 border border-primary-200/50 dark:border-primary-500/20">
                  {{ invite.team.name.slice(0, 2).toUpperCase() }}
                </div>
                <div>
                  <p class="font-semibold text-slate-900 dark:text-slate-100 text-sm">{{ invite.team.name }}</p>
                  <p class="text-xs text-slate-400 dark:text-slate-500">by <span class="font-medium text-slate-500 dark:text-slate-400">{{ invite.sender.name }}</span></p>
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
        <div v-if="createError" class="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{{ createError }}</div>
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Team Name</label>
          <UiInput v-model="newTeamName" placeholder="e.g. Engineering Team" required />
        </div>
        <div class="space-y-1.5">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Description <span class="text-slate-400 dark:text-slate-600 font-normal">(optional)</span></label>
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
import { Plus, Users, CheckSquare, Megaphone, CalendarDays } from 'lucide-vue-next'

const authStore = useAuthStore()
const teamStore = useTeamStore()
const api = useApi()

const showCreateTeam = ref(false)
const newTeamName = ref('')
const newTeamDesc = ref('')
const createError = ref('')
const isCreating = ref(false)

// Pending invites
interface Invite {
  id: string
  team: { id: string; name: string }
  sender: { name: string }
  role: string
}
const pendingInvites = ref<Invite[]>([])
const acceptingId = ref<string | null>(null)
const decliningId = ref<string | null>(null)

// Derived team list enhanced with member count
const teams = computed(() => teamStore.teams)

const stats = computed(() => [
  { label: 'My Teams', value: String(teams.value.length), icon: Users, iconBg: 'bg-primary-50 dark:bg-primary-500/10', iconColor: 'text-primary-600 dark:text-primary-400', barColor: 'bg-primary-500/20 dark:bg-primary-400/15' },
  { label: 'Active Tasks', value: String(teams.value.reduce((a, t) => a + (t._count?.tasks ?? 0), 0)), icon: CheckSquare, iconBg: 'bg-emerald-50 dark:bg-emerald-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400', barColor: 'bg-emerald-500/20 dark:bg-emerald-400/15' },
  { label: 'Announcements', value: String(teams.value.reduce((a, t) => a + (t._count?.announcements ?? 0), 0)), icon: Megaphone, iconBg: 'bg-amber-50 dark:bg-amber-500/10', iconColor: 'text-amber-600 dark:text-amber-400', barColor: 'bg-amber-500/20 dark:bg-amber-400/15' },
  { label: 'Pending Invites', value: String(pendingInvites.value.length), icon: CalendarDays, iconBg: 'bg-violet-50 dark:bg-violet-500/10', iconColor: 'text-violet-600 dark:text-violet-400', barColor: 'bg-violet-500/20 dark:bg-violet-400/15' },
])

// Fetch teams + invites on mount
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
