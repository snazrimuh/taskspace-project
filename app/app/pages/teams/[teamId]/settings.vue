<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div class="relative overflow-hidden bg-[linear-gradient(135deg,rgba(219,236,255,0.75)_0%,rgba(186,215,248,0.55)_40%,rgba(162,200,238,0.45)_100%)] dark:bg-[linear-gradient(135deg,#1B263B_0%,#111827_100%)] rounded-3xl p-6 md:p-8 text-[#1C3C62] dark:text-white mb-8 shadow-[0_8px_32px_rgba(42,74,116,0.12)] dark:shadow-xl border border-white/70 dark:border-white/5 backdrop-blur-xl ring-1 ring-[#7EB8E5]/20 dark:ring-0">
      <!-- Glass shimmer overlays (light mode only) -->
      <div class="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent dark:opacity-0 rounded-3xl pointer-events-none"></div>
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:opacity-0 rounded-t-3xl pointer-events-none"></div>
      <div class="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          <div class="p-3.5 bg-[#2A4A74]/15 dark:bg-white/10 rounded-2xl border border-[#2A4A74]/20 dark:border-white/10">
             <Settings2 class="w-8 h-8 text-[#1C3C62] dark:text-white" />
          </div>
          <div>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight">Team Settings</h1>
            <p class="text-[#2A4A74]/70 dark:text-slate-300 mt-1 flex items-center gap-2">
              <span class="text-sm opacity-80">Manage team structure and configurations.</span>
            </p>
          </div>
        </div>
      </div>
      
      <!-- Quick View Stats Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 border-t border-[#2A4A74]/15 dark:border-white/10 pt-6">
        <div class="flex flex-col">
          <p class="text-[10px] uppercase tracking-widest text-[#2A4A74]/50 dark:text-slate-400 font-semibold">Members</p>
          <p class="text-xl font-bold text-[#1C3C62] dark:text-white">{{ memberCount }}</p>
        </div>
        <div class="flex flex-col">
          <p class="text-[10px] uppercase tracking-widest text-[#2A4A74]/50 dark:text-slate-400 font-semibold">Managers</p>
          <p class="text-xl font-bold text-[#1C3C62] dark:text-white">{{ managerCount }}</p>
        </div>
        <div class="flex flex-col">
          <p class="text-[10px] uppercase tracking-widest text-[#2A4A74]/50 dark:text-slate-400 font-semibold">Your Role</p>
          <p class="text-xl font-bold text-[#1C3C62] dark:text-white">{{ isManager ? 'Manager' : 'Member' }}</p>
        </div>
        <div class="flex flex-col">
          <p class="text-[10px] uppercase tracking-widest text-[#2A4A74]/50 dark:text-slate-400 font-semibold">Active Tab</p>
          <p class="text-xl font-bold text-[#1C3C62] dark:text-white">{{ activeTabLabel }}</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-white/60 dark:border-white/[0.07]">
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
      <UiCard class="border-red-200 dark:border-red-500/30">
        <UiCardHeader>
          <UiCardTitle class="text-red-600">Danger Zone</UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="space-y-4">
          <div class="flex items-center justify-between rounded-xl p-3 border border-slate-200/70 dark:border-slate-700/40">
            <div>
              <p class="text-sm font-medium text-slate-900 dark:text-slate-200">Transfer Ownership</p>
              <p class="text-sm text-slate-500">Transfer team ownership to another manager.</p>
            </div>
            <UiButton variant="outline" size="sm">Transfer</UiButton>
          </div>
          <div class="rounded-xl p-3 border border-slate-200/70 dark:border-slate-700/40 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-900 dark:text-slate-200">Leave Team</p>
              <p class="text-sm text-slate-500">You will lose access to this team's workspace.</p>
            </div>
            <UiButton variant="outline" size="sm" @click="handleLeave">Leave</UiButton>
          </div>
          <div class="rounded-xl p-3 border border-red-200 dark:border-red-500/30 flex items-center justify-between bg-red-50/50 dark:bg-red-500/5">
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
        <UiCardContent class="pt-4 divide-y divide-white/60 dark:divide-white/[0.06]">
          <div
            v-for="member in membersList"
            :key="member.id"
            class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-3">
              <UiAvatar :name="member.user.name" :src="member.user.avatar || ''" />
              <div>
                <div class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ member.user.name }}</div>
                <div class="text-xs text-slate-500">{{ member.user.email }}</div>
              </div>
            </div>
            <UiBadge :variant="member.role === 'ADMIN' ? 'default' : 'secondary'">{{ member.role === 'ADMIN' ? 'Manager' : 'Member' }}</UiBadge>
          </div>
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserPlus, Settings2 } from 'lucide-vue-next'

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
const managerCount = computed(() => membersList.value.filter((m) => m.role === 'ADMIN').length)
const activeTabLabel = computed(() => (activeTab.value === 'general' ? 'General' : 'Members'))

// ── Init ───────────────────────────────────────────────────────────────
const initForm = () => {
  const t = teamStore.currentTeam
  teamName.value = t?.name ?? ''
  teamDescription.value = (t as any)?.description ?? ''
}

onMounted(async () => {
  await Promise.all([
    teamStore.fetchTeam(teamId.value),
    teamStore.fetchMembers(teamId.value),
  ])
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
