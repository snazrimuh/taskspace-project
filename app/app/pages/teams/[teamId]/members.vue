<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Team Members</h2>
      <UiButton v-if="isManager" @click="showInvite = true">
        <UserPlus class="h-4 w-4 mr-2" />
        Invite
      </UiButton>
    </div>

    <!-- Members List -->
    <UiCard>
      <UiCardContent class="pt-4 divide-y divide-slate-100">
        <div
          v-for="member in members"
          :key="member.id"
          class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
        >
          <div class="flex items-center gap-3">
            <UiAvatar :name="member.user.name" size="md" />
            <div>
              <div class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ member.user.name }}</div>
              <div class="text-xs text-slate-500">{{ member.user.email }}</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <UiBadge :variant="member.role === 'MANAGER' ? 'default' : 'secondary'">
              {{ member.role === 'MANAGER' ? 'Manager' : 'Member' }}
            </UiBadge>
            <div v-if="isManager && member.userId !== currentUserId" class="relative">
              <button
                class="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                @click="toggleMenu(member.id)"
              >
                <MoreVertical class="h-4 w-4" />
              </button>
              <div
                v-if="openMenuId === member.id"
                class="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700/40 py-1 z-10"
              >
                <button
                  class="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                  @click="handleRoleChange(member)"
                >
                  {{ member.role === 'MANAGER' ? 'Demote to Member' : 'Promote to Manager' }}
                </button>
                <button
                  class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
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
              <UiAvatar :name="invite.receiver?.name || invite.email" size="md" />
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
            <option value="MANAGER">Manager</option>
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
import { UserPlus, MoreVertical } from 'lucide-vue-next'

const route = useRoute()
const teamStore = useTeamStore()
const authStore = useAuthStore()
const api = useApi()

const teamId = computed(() => route.params.teamId as string)
const isManager = computed(() => teamStore.isCurrentTeamManager)
const currentUserId = computed(() => authStore.user?.id)

const members = computed(() => teamStore.currentTeamMembers)

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
  const newRole = member.role === 'MANAGER' ? 'MEMBER' : 'MANAGER'
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
    await teamStore.sendInvite(teamId.value, inviteEmail.value.trim(), inviteRole.value as 'MANAGER' | 'MEMBER')
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
