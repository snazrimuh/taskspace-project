<template>
  <div class="min-h-screen bg-slate-50 dark:bg-surface-950 text-slate-900 dark:text-slate-200 flex">
    <!-- Sidebar (desktop) -->
    <div class="hidden md:block">
      <LayoutTheSidebar />
    </div>

    <!-- Mobile sidebar overlay -->
    <Transition name="slide">
      <div
        v-if="showMobileSidebar"
        class="fixed inset-0 z-40 md:hidden"
      >
        <div class="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm" @click="showMobileSidebar = false" />
        <div class="relative z-50">
          <LayoutTheSidebar />
        </div>
      </div>
    </Transition>

    <!-- Main Content -->
    <div class="flex-1 md:ml-64 flex flex-col min-h-screen">
      <LayoutTheNavbar
        :team-name="currentTeamName"
        :team-id="currentTeamId"
        :page-title="pageTitle"
        :is-manager="isManager"
        @toggle-sidebar="showMobileSidebar = !showMobileSidebar"
      />
      <main class="flex-1 p-4 md:p-6">
        <div class="max-w-6xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const teamStore = useTeamStore()
const showMobileSidebar = ref(false)

onMounted(() => {
  teamStore.fetchTeams()
})

const currentTeamId = computed(() => {
  const id = route.params.teamId
  return typeof id === 'string' ? id : ''
})

const currentTeamName = computed(() => {
  if (!currentTeamId.value) return ''
  const found = teamStore.teams.find((t) => t.id === currentTeamId.value)
  return found?.name ?? ''
})

const isManager = computed(() => teamStore.isCurrentTeamManager)

const pageTitle = computed(() => {
  const path = route.path
  if (path.includes('/announcements')) return 'Announcements'
  if (path.includes('/projects')) return 'Projects'
  if (path.includes('/tasks')) return 'Tasks'
  if (path.includes('/calendar')) return 'Calendar'
  if (path.includes('/chat')) return 'Team Chat'
  if (path.includes('/members')) return 'Members'
  if (path.includes('/settings')) return 'Settings'
  if (path.includes('/teams/')) return 'Overview'
  return 'Dashboard'
})

// Close sidebar on route change (mobile)
watch(() => route.path, () => {
  showMobileSidebar.value = false
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}
</style>
