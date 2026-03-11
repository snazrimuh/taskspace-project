import { useTeamStore } from '~/stores/team'

export const useTeam = () => {
  const teamStore = useTeamStore()
  const route = useRoute()

  const currentTeamId = computed(() => {
    const id = route.params.teamId
    return typeof id === 'string' ? id : null
  })

  const currentTeam = computed(() => {
    if (!currentTeamId.value) return null
    return teamStore.teams.find((t) => t.id === currentTeamId.value) || null
  })

  const teams = computed(() => teamStore.teams)
  const isManager = computed(() => teamStore.isCurrentTeamManager)

  watch(currentTeamId, (id) => {
    if (id) teamStore.setCurrentTeamFromList(id)
  }, { immediate: true })

  return {
    currentTeamId,
    currentTeam,
    teams,
    isManager,
  }
}
