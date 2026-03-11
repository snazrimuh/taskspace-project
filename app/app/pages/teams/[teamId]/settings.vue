<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Team Settings</h2>
      <p class="text-sm text-slate-500 mt-1">Manage your team configuration.</p>
    </div>

    <!-- Tabs -->
    <div class="border-b border-slate-200 dark:border-slate-700/30">
      <nav class="flex gap-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="[
            'pb-3 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === tab.key
              ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
              : 'border-transparent text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
          ]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- General Tab -->
    <div v-if="activeTab === 'general'" class="space-y-6">
      <UiCard>
        <UiCardHeader>
          <UiCardTitle>Team Information</UiCardTitle>
        </UiCardHeader>
        <UiCardContent>
          <form class="space-y-4 max-w-lg" @submit.prevent="handleSave">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Team Name</label>
              <UiInput v-model="teamName" :disabled="!isManager" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <UiTextarea v-model="teamDescription" :rows="3" :disabled="!isManager" />
            </div>
            <p v-if="saveError" class="text-sm text-red-600 dark:text-red-400">{{ saveError }}</p>
            <div v-if="isManager" class="flex justify-end">
              <UiButton :disabled="isSaving">{{ isSaving ? 'Saving...' : 'Save Changes' }}</UiButton>
            </div>
          </form>
        </UiCardContent>
      </UiCard>

      <!-- Danger Zone -->
      <UiCard class="border-red-200">
        <UiCardHeader>
          <UiCardTitle class="text-red-600">Danger Zone</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-900 dark:text-slate-200">Transfer Ownership</p>
              <p class="text-sm text-slate-500">Transfer team ownership to another manager.</p>
            </div>
            <UiButton variant="outline" size="sm">Transfer</UiButton>
          </div>
          <div class="border-t dark:border-slate-700/30 pt-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-900 dark:text-slate-200">Leave Team</p>
              <p class="text-sm text-slate-500">You will lose access to this team's workspace.</p>
            </div>
            <UiButton variant="outline" size="sm" @click="handleLeave">Leave</UiButton>
          </div>
          <div class="border-t dark:border-slate-700/30 pt-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-red-600">Delete Team</p>
              <p class="text-sm text-slate-500">Permanently delete this team and all its data.</p>
            </div>
            <UiButton v-if="isManager" variant="danger" size="sm" @click="handleDelete">Delete Team</UiButton>
          </div>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Members Tab -->
    <div v-if="activeTab === 'members'" class="space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm text-slate-500">{{ memberCount }} members in this team</p>
        <UiButton size="sm">
          <UserPlus class="h-4 w-4 mr-1" />
          Invite
        </UiButton>
      </div>
      <UiCard>
        <UiCardContent class="pt-4 divide-y divide-slate-100 dark:divide-slate-700/20">
          <div
            v-for="member in membersList"
            :key="member.id"
            class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-3">
              <UiAvatar :name="member.user.name" />
              <div>
                <div class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ member.user.name }}</div>
                <div class="text-xs text-slate-500">{{ member.user.email }}</div>
              </div>
            </div>
            <UiBadge :variant="member.role === 'MANAGER' ? 'default' : 'secondary'">{{ member.role === 'MANAGER' ? 'Manager' : 'Member' }}</UiBadge>
          </div>
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserPlus } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const teamStore = useTeamStore()

const teamId = computed(() => route.params.teamId as string)
const isManager = computed(() => teamStore.isCurrentTeamManager)

const tabs = [
  { key: 'general', label: 'General' },
  { key: 'members', label: 'Members' },
]
const activeTab = ref('general')

// ── Form state ─────────────────────────────────────────────────────────
const teamName = ref('')
const teamDescription = ref('')
const saveError = ref('')
const isSaving = ref(false)
const isDangerous = ref(false)

// ── Members ────────────────────────────────────────────────────────────
const membersList = computed(() => teamStore.currentTeamMembers)
const memberCount = computed(() => membersList.value.length)

// ── Init ───────────────────────────────────────────────────────────────
const initForm = () => {
  const t = teamStore.currentTeam
  teamName.value = t?.name ?? ''
  teamDescription.value = (t as any)?.description ?? ''
}

onMounted(async () => {
  if (!teamStore.currentTeam || teamStore.currentTeam.id !== teamId.value) {
    await teamStore.fetchTeam(teamId.value)
  }
  if (!membersList.value.length) {
    await teamStore.fetchMembers(teamId.value)
  }
  initForm()
})

watch(() => teamStore.currentTeam, initForm)

// ── Save ───────────────────────────────────────────────────────────────
const handleSave = async () => {
  if (!teamName.value.trim()) return
  saveError.value = ''
  isSaving.value = true
  try {
    await teamStore.updateTeam(teamId.value, {
      name: teamName.value.trim(),
      description: teamDescription.value.trim() || undefined,
    })
  } catch (err: any) {
    saveError.value = err?.data?.message ?? 'Failed to save changes'
  } finally {
    isSaving.value = false
  }
}

// ── Leave ──────────────────────────────────────────────────────────────
const handleLeave = async () => {
  if (!confirm('Are you sure you want to leave this team?')) return
  try {
    await teamStore.leaveTeam(teamId.value)
    await router.push('/dashboard')
  } catch (err: any) {
    alert(err?.data?.message ?? 'Failed to leave team')
  }
}

// ── Delete ─────────────────────────────────────────────────────────────
const handleDelete = async () => {
  if (!confirm('This will permanently delete the team and all its data. Are you absolutely sure?')) return
  try {
    await teamStore.deleteTeam(teamId.value)
    await router.push('/dashboard')
  } catch (err: any) {
    alert(err?.data?.message ?? 'Failed to delete team')
  }
}
</script>
