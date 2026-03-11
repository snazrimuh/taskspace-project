import { defineStore } from 'pinia'

export interface Team {
  id: string
  name: string
  description?: string
  avatar?: string
  role?: 'MANAGER' | 'MEMBER'
  _count?: { members: number; tasks: number; announcements: number }
  members?: TeamMember[]
}

export interface TeamMember {
  id: string
  userId: string
  teamId: string
  role: 'MANAGER' | 'MEMBER'
  joinedAt: string
  user: { id: string; name: string; email: string; avatar?: string; bio?: string }
}

export const useTeamStore = defineStore('team', {
  state: () => ({
    teams: [] as Team[],
    currentTeam: null as Team | null,
    currentTeamMembers: [] as TeamMember[],
    isLoading: false,
  }),

  getters: {
    isCurrentTeamManager: (state) => state.currentTeam?.role === 'MANAGER',
    currentUserRoleInTeam: (state) => state.currentTeam?.role ?? 'MEMBER',
  },

  actions: {
    async fetchTeams() {
      this.isLoading = true
      try {
        const api = useApi()
        const res = await api.get<{ success: boolean; data: Team[] }>('/teams')
        this.teams = res.data
      } finally {
        this.isLoading = false
      }
    },

    async fetchTeam(teamId: string) {
      const api = useApi()
      const res = await api.get<{ success: boolean; data: Team }>(`/teams/${teamId}`)
      // Preserve the current user's role from the teams list (GET /teams includes role)
      const existing = this.teams.find((t) => t.id === teamId)
      this.currentTeam = { ...res.data, role: existing?.role ?? this.currentTeam?.role }
      return this.currentTeam
    },

    async fetchMembers(teamId: string) {
      const api = useApi()
      const res = await api.get<{ success: boolean; data: TeamMember[] }>(`/teams/${teamId}/members`)
      this.currentTeamMembers = res.data

      // Derive current user's role from their membership record
      const authStore = useAuthStore()
      if (authStore.user) {
        const me = res.data.find((m) => m.userId === authStore.user!.id)
        if (me) {
          if (this.currentTeam?.id === teamId) {
            this.currentTeam = { ...this.currentTeam, role: me.role }
          } else {
            // currentTeam not set yet — build it from the teams list
            const fromList = this.teams.find((t) => t.id === teamId)
            if (fromList) this.currentTeam = { ...fromList, role: me.role }
          }
        }
      }
      return res.data
    },

    async createTeam(name: string, description?: string) {
      const api = useApi()
      const res = await api.post<{ success: boolean; data: Team }>('/teams', { name, description })
      this.teams.unshift(res.data)
      return res.data
    },

    async updateTeam(teamId: string, data: { name?: string; description?: string }) {
      const api = useApi()
      const res = await api.patch<{ success: boolean; data: Team }>(`/teams/${teamId}`, data)
      const idx = this.teams.findIndex((t) => t.id === teamId)
      if (idx !== -1) this.teams[idx] = { ...this.teams[idx], ...res.data }
      if (this.currentTeam?.id === teamId) this.currentTeam = { ...this.currentTeam, ...res.data }
      return res.data
    },

    async deleteTeam(teamId: string) {
      const api = useApi()
      await api.delete(`/teams/${teamId}`)
      this.teams = this.teams.filter((t) => t.id !== teamId)
    },

    async leaveTeam(teamId: string) {
      const api = useApi()
      await api.post(`/teams/${teamId}/leave`)
      this.teams = this.teams.filter((t) => t.id !== teamId)
    },

    async updateMemberRole(teamId: string, userId: string, role: 'MANAGER' | 'MEMBER') {
      const api = useApi()
      await api.patch(`/teams/${teamId}/members/${userId}`, { role })
      const m = this.currentTeamMembers.find((m) => m.userId === userId)
      if (m) m.role = role
    },

    async removeMember(teamId: string, userId: string) {
      const api = useApi()
      await api.delete(`/teams/${teamId}/members/${userId}`)
      this.currentTeamMembers = this.currentTeamMembers.filter((m) => m.userId !== userId)
    },

    async sendInvite(teamId: string, email: string, role: 'MANAGER' | 'MEMBER') {
      const api = useApi()
      return api.post(`/teams/${teamId}/invites`, { email, role })
    },

    setCurrentTeamFromList(teamId: string) {
      this.currentTeam = this.teams.find((t) => t.id === teamId) ?? null
    },
  },
})

