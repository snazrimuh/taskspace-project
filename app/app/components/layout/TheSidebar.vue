<template>
  <aside class="glass-panel w-64 h-screen flex flex-col fixed left-0 top-0 z-30">
    <!-- Brand -->
    <div class="px-4 py-4 border-b border-white/50 dark:border-white/[0.06]">
      <NuxtLink to="/dashboard" class="flex items-center gap-2.5 group">
        <img src="/logo.png" alt="TaskSpace" class="h-10 w-10 shrink-0" />
        <div class="flex flex-col leading-tight">
          <div class="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            <span class="font-bold">Task</span><span class="font-semibold">Space</span>
          </div>
          <div class="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">Team Collab</div>
        </div>
      </NuxtLink>
    </div>

    <!-- Team Switcher -->
    <div class="px-3 pt-3 pb-2 relative" data-team-dropdown>
      <button
        v-if="selectedTeam"
        class="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-white/40 dark:hover:bg-white/[0.06] transition-all group relative"
        @click="showTeamDropdown = !showTeamDropdown"
      >
        <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-[11px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
          {{ selectedTeam.name.slice(0, 2).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0 text-left">
          <div class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">{{ selectedTeam.name }}</div>
          <div class="text-[11px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">{{ selectedTeam._count?.members ?? 0 }} members</div>
        </div>
        <ChevronsUpDown class="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
      </button>
      <NuxtLink
        v-else
        to="/dashboard"
        class="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
      >
        <img src="/logo.png" alt="TaskSpace" class="h-8 w-8 shrink-0" />
        <div class="text-sm leading-tight">
          <span class="font-bold text-slate-900 dark:text-slate-100">Task</span><span class="font-semibold text-slate-900 dark:text-slate-100">Space</span>
        </div>
      </NuxtLink>

      <!-- Team Dropdown -->
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showTeamDropdown"
          class="absolute top-full left-3 right-3 mt-1 z-50 origin-top bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border border-white/70 dark:border-white/[0.10] rounded-xl shadow-xl overflow-hidden"
        >
          <div class="p-1.5">
            <button
              v-for="team in teams"
              :key="team.id"
              :class="[
                'w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all',
                currentTeamId === normalizeTeamId(team.id)
                  ? 'bg-white/60 dark:bg-white/[0.10] text-slate-900 dark:text-white font-medium'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/[0.07]',
              ]"
              @click="selectTeam(team.id)"
            >
              <div class="h-6 w-6 rounded-md bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                {{ team.name.slice(0, 2).toUpperCase() }}
              </div>
              <span class="truncate flex-1 text-left">{{ team.name }}</span>
              <Check v-if="currentTeamId === normalizeTeamId(team.id)" class="h-3.5 w-3.5 text-primary-500 shrink-0" />
            </button>
          </div>
          <div class="border-t border-white/60 dark:border-white/[0.07] p-1.5">
            <button
              class="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/[0.06] hover:text-slate-700 dark:hover:text-slate-200 transition-all"
              @click="showTeamDropdown = false; showCreateTeam = true"
            >
              <Plus class="h-4 w-4" />
              <span>New Team</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Workspace Navigation -->
    <div class="flex-1 px-3 pt-1 overflow-y-auto">
      <nav v-if="activeTeamId" class="space-y-0.5">
        <NuxtLink
          v-for="item in navItems"
          :key="item.key"
          :to="`/teams/${activeTeamId}${item.path}`"
          :class="[
            'w-full flex items-center gap-2.5 rounded-xl pl-5 pr-3 py-2 text-[13px] transition-all',
            isActive(item.key)
              ? 'bg-slate-100 dark:bg-slate-800/70 text-slate-900 dark:text-white font-medium'
              : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-slate-200',
          ]"
        >
          <component :is="item.icon" class="h-4 w-4 shrink-0" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
      <div v-else class="px-3 py-6 text-center">
        <p class="text-xs text-slate-400 dark:text-slate-600">Select a team to view workspace</p>
      </div>

      <!-- Teams Section -->
      <div class="mt-4 pt-4 border-t border-white/50 dark:border-white/[0.06]">
        <div class="flex items-center justify-between px-2 mb-2">
          <span class="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-600 font-semibold">Teams</span>
          <button
            class="text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60"
            @click="showCreateTeam = true"
          >
            <Plus class="h-3.5 w-3.5" />
          </button>
        </div>
        <div class="space-y-0.5">
          <button
            v-for="team in teams"
            :key="team.id"
            :class="[
              'w-full text-left rounded-xl px-3 py-2 text-[13px] transition-all flex items-center gap-2.5',
              currentTeamId === normalizeTeamId(team.id)
                ? 'bg-slate-100 dark:bg-slate-800/70 text-slate-900 dark:text-white font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-slate-200',
            ]"
            @click="selectTeam(team.id)"
          >
            <div class="h-6 w-6 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0">
              {{ team.name.slice(0, 2).toUpperCase() }}
            </div>
            <span class="truncate">{{ team.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- User Section -->
    <div class="p-3 border-t border-white/50 dark:border-white/[0.06]">
      <ClientOnly>
        <NuxtLink
          to="/profile"
          class="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-white/40 dark:hover:bg-white/[0.06] transition-all group"
        >
          <UiAvatar :name="currentUser.name" :src="currentUser.avatar" size="sm" />
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{{ currentUser.name }}</div>
            <div class="text-[11px] text-slate-400 dark:text-slate-500 truncate">{{ currentUser.email }}</div>
          </div>
          <Settings class="h-4 w-4 text-slate-400 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </NuxtLink>
      </ClientOnly>
    </div>

    <!-- Create Team Modal -->
    <UiModal v-model="showCreateTeam" title="Create New Team" size="sm">
      <form class="space-y-4" @submit.prevent="handleCreateTeam">
        <div v-if="createError" class="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">{{ createError }}</div>
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
  </aside>
</template>

<script setup lang="ts">
import {
  Megaphone,
  FolderKanban,
  CalendarDays,
  MessageSquare,
  Users,
  LayoutDashboard,
  Settings,
  ChevronsUpDown,
  Check,
  Plus,
} from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()
const teamStore = useTeamStore()

const teams = computed(() => teamStore.teams)
const currentUser = computed(() => authStore.user ?? { name: '', email: '', avatar: '' })
const normalizeTeamId = (value: string) => value.split('/').filter(Boolean).pop() ?? value

const showTeamDropdown = ref(false)
const showCreateTeam = ref(false)
const newTeamName = ref('')
const newTeamDesc = ref('')
const createError = ref('')
const isCreating = ref(false)

onMounted(() => {
  if (!teamStore.teams.length) teamStore.fetchTeams()
})

// Close dropdown when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  if (showTeamDropdown.value) {
    const target = e.target as HTMLElement
    if (!target.closest('[data-team-dropdown]')) {
      showTeamDropdown.value = false
    }
  }
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const currentTeamId = ref('')

const activeTeamId = computed(() => {
  if (currentTeamId.value) return normalizeTeamId(currentTeamId.value)
  const firstTeamId = teams.value[0]?.id
  return firstTeamId ? normalizeTeamId(firstTeamId) : ''
})

const selectedTeam = computed(() => {
  if (!activeTeamId.value) return null
  return teams.value.find((t) => normalizeTeamId(t.id) === activeTeamId.value) ?? null
})

const navItems = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, path: '' },
  { key: 'chat', label: 'Team Chat', icon: MessageSquare, path: '/chat' },
  { key: 'projects', label: 'Projects', icon: FolderKanban, path: '/projects' },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays, path: '/calendar' },
  { key: 'members', label: 'Members', icon: Users, path: '/members' },
  { key: 'announcements', label: 'Announcements', icon: Megaphone, path: '/announcements' },
] as const

const isActive = (key: string) => {
  const path = route.path
  if (key === 'overview') return path.endsWith(activeTeamId.value) || path.endsWith(activeTeamId.value + '/')
  return path.includes(`/${key}`)
}

const selectTeam = (teamId: string) => {
  const normalizedId = normalizeTeamId(teamId)
  currentTeamId.value = normalizedId
  showTeamDropdown.value = false
  navigateTo(`/teams/${normalizedId}`)
}

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

// Sync currentTeamId from route
watch(
  () => route.params.teamId,
  (id) => {
    if (id && typeof id === 'string') {
      currentTeamId.value = normalizeTeamId(id)
    }
  },
  { immediate: true },
)
</script>
