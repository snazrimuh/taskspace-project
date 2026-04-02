<template>
  <div class="space-y-4">
    <!-- Header Banner -->
    <div class="relative overflow-hidden bg-[linear-gradient(135deg,rgba(219,236,255,0.75)_0%,rgba(186,215,248,0.55)_40%,rgba(162,200,238,0.45)_100%)] dark:bg-[linear-gradient(135deg,#1B263B_0%,#111827_100%)] rounded-3xl p-6 md:p-8 text-[#1C3C62] dark:text-white mb-8 shadow-[0_8px_32px_rgba(42,74,116,0.12)] dark:shadow-xl border border-white/70 dark:border-white/5 backdrop-blur-xl ring-1 ring-[#7EB8E5]/20 dark:ring-0">
      <!-- Glass shimmer overlays (light mode only) -->
      <div class="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent dark:opacity-0 rounded-3xl pointer-events-none"></div>
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:opacity-0 rounded-t-3xl pointer-events-none"></div>
      <div class="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          <div class="p-3.5 bg-[#2A4A74]/15 dark:bg-white/10 rounded-2xl border border-[#2A4A74]/20 dark:border-white/10">
             <Users class="w-8 h-8 text-[#1C3C62] dark:text-white" />
          </div>
          <div>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight">Team Members</h1>
            <p class="text-[#2A4A74]/70 dark:text-slate-300 mt-1 flex items-center gap-2">
              <span class="text-sm opacity-80">Manage roles and active invitations centrally.</span>
            </p>
          </div>
        </div>
        
        <div v-if="isManager">
           <UiButton class="bg-[#1C3C62] !text-white dark:bg-white/10 dark:!text-white dark:hover:bg-white/20 hover:bg-[#2A4A74] transition-all duration-300 shadow-lg px-6 py-2.5 rounded-xl font-bold border-none" @click="showInvite = true">
              <UserPlus class="h-4 w-4 mr-2 !text-white dark:!text-white" />
              Invite Member
           </UiButton>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <UiCard>
        <UiCardContent class="pt-4">
          <p class="text-xs uppercase tracking-wider text-slate-500">Total Members</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ members.length }}</p>
        </UiCardContent>
      </UiCard>
      <UiCard>
        <UiCardContent class="pt-4">
          <p class="text-xs uppercase tracking-wider text-slate-500">Managers</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ managerCount }}</p>
        </UiCardContent>
      </UiCard>
      <UiCard>
        <UiCardContent class="pt-4">
          <p class="text-xs uppercase tracking-wider text-slate-500">Members</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ contributorCount }}</p>
        </UiCardContent>
      </UiCard>
      <UiCard>
        <UiCardContent class="pt-4">
          <p class="text-xs uppercase tracking-wider text-slate-500">Pending Invites</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ pendingInvites.length }}</p>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Members List -->
    <UiCard>
      <UiCardContent class="pt-4 divide-y divide-white/60 dark:divide-white/[0.06]">
        <div
          v-for="member in members"
          :key="member.id"
          class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
        >
          <div class="flex items-center gap-3">
            <UiAvatar :name="member.user.name" :src="member.user.avatar || ''" size="md" />
            <div>
              <div class="text-sm font-medium text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <span>{{ member.user.name }}</span>
                <span
                  v-if="member.userId === currentUserId"
                  class="text-[10px] px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300"
                >
                  You
                </span>
              </div>
              <div class="text-xs text-slate-500">{{ member.user.email }}</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <UiBadge :variant="member.role === 'ADMIN' ? 'default' : 'secondary'">
              {{ member.role === 'ADMIN' ? 'Manager' : 'Member' }}
            </UiBadge>
            <div v-if="isManager && member.userId !== currentUserId" class="relative">
              <button
                class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-white/40 dark:hover:bg-white/[0.06] transition-colors"
                @click="toggleMenu(member.id)"
              >
                <MoreVertical class="h-4 w-4" />
              </button>
              <div
                v-if="openMenuId === member.id"
                class="absolute right-0 top-full mt-1 w-48 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/70 dark:border-white/[0.10] py-1 z-10"
              >
                <button
                  class="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/[0.07] transition-colors"
                  @click="handleRoleChange(member)"
                >
                  {{ member.role === 'ADMIN' ? 'Demote to Member' : 'Promote to Manager' }}
                </button>
                <button
                  class="w-full text-left px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-500/10 transition-colors"
                  @click="handleRemove(member)"
                >
                  Remove from team
                </button>
              </div>
            </div>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <!-- Pending Invites -->
    <div v-if="pendingInvites.length > 0">
      <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Pending Invitations</h3>
      <UiCard>
        <UiCardContent class="pt-4 divide-y divide-slate-100 dark:divide-slate-700/20">
          <div
            v-for="invite in pendingInvites"
            :key="invite.id"
            class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-3">
                <UiAvatar :name="invite.receiver?.name || invite.email" :src="invite.receiver?.avatar || ''" size="md" />
              <div>
                <div class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ invite.receiver?.name || invite.email }}</div>
                <div class="text-xs text-slate-500">Invited {{ invite.createdAt ? new Date(invite.createdAt).toLocaleDateString() : '' }}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <UiBadge variant="warning">Pending</UiBadge>
              <button
                class="text-sm text-red-600 hover:text-red-700"
                @click="handleCancelInvite(invite.id)"
              >
                Cancel
              </button>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Invite Modal -->
    <UiModal v-model="showInvite" title="Invite Member">
      <form class="space-y-4" @submit.prevent="handleInvite">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email or Username</label>
          <UiInput v-model="inviteEmail" placeholder="Search by email or username..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
          <UiSelect v-model="inviteRole">
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Manager</option>
          </UiSelect>
        </div>
        <p v-if="inviteError" class="text-sm text-red-600 dark:text-red-400">{{ inviteError }}</p>
        <div class="flex justify-end gap-2">
          <UiButton variant="outline" type="button" @click="showInvite = false">Cancel</UiButton>
          <UiButton type="submit" :disabled="isInviting">{{ isInviting ? 'Sending...' : 'Send Invite' }}</UiButton>
        </div>
      </form>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { Users, UserPlus, MoreVertical } from 'lucide-vue-next'

const route = useRoute()
const teamStore = useTeamStore()
const authStore = useAuthStore()
const api = useApi()

const teamId = computed(() => route.params.teamId as string)
const isManager = computed(() => teamStore.isCurrentTeamManager)
const currentUserId = computed(() => authStore.user?.id)

const members = computed(() => teamStore.currentTeamMembers)
const managerCount = computed(() => members.value.filter((m) => m.role === 'ADMIN').length)
const contributorCount = computed(() => members.value.filter((m) => m.role !== 'ADMIN').length)

// ── State ──────────────────────────────────────────────────────────────
const showInvite = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('MEMBER')
const inviteError = ref('')
const isInviting = ref(false)
const openMenuId = ref<string | null>(null)
const pendingInvites = ref<any[]>([])
const isLoading = ref(false)

// ── Fetch ──────────────────────────────────────────────────────────────
const fetchPendingInvites = async () => {
  try {
    const res = await api.get<{ success: boolean; data: any[] }>(`/teams/${teamId.value}/invites/pending`)
    pendingInvites.value = res.data ?? []
  } catch {
    pendingInvites.value = []
  }
}

onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([
      teamStore.fetchMembers(teamId.value),
      fetchPendingInvites(),
    ])
  } finally {
    isLoading.value = false
  }
})

watch(teamId, async () => {
  await Promise.all([
    teamStore.fetchMembers(teamId.value),
    fetchPendingInvites(),
  ])
})

// ── Actions ────────────────────────────────────────────────────────────
const toggleMenu = (id: string) => {
  openMenuId.value = openMenuId.value === id ? null : id
}

const handleRoleChange = async (member: any) => {
  openMenuId.value = null
  const newRole = member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN'
  try {
    await teamStore.updateMemberRole(teamId.value, member.userId, newRole)
  } catch {
    // error silently — store will revert nothing; let UI stay
  }
}

const handleRemove = async (member: any) => {
  openMenuId.value = null
  try {
    await teamStore.removeMember(teamId.value, member.userId)
  } catch {
    // handled in store
  }
}

const handleInvite = async () => {
  if (!inviteEmail.value.trim()) return
  inviteError.value = ''
  isInviting.value = true
  try {
    await teamStore.sendInvite(teamId.value, inviteEmail.value.trim(), inviteRole.value as 'ADMIN' | 'MEMBER')
    await fetchPendingInvites()
    inviteEmail.value = ''
    inviteRole.value = 'MEMBER'
    showInvite.value = false
  } catch (err: any) {
    inviteError.value = err?.data?.message ?? 'Failed to send invitation'
  } finally {
    isInviting.value = false
  }
}

const handleCancelInvite = async (inviteId: string) => {
  try {
    await api.delete(`/teams/${teamId.value}/invites/${inviteId}`)
    pendingInvites.value = pendingInvites.value.filter((i) => i.id !== inviteId)
  } catch {
    // handled silently
  }
}
</script>
