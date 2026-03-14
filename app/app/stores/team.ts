import { defineStore } from 'pinia'

export interface Team {
  id: string
  name: string
  description?: string
  avatar?: string
  role?: 'ADMIN' | 'MEMBER'
  _count?: { members: number; tasks: number; announcements: number; projects: number }
  members?: TeamMember[]
}

export interface TeamMember {
  id: string
  userId: string
  teamId: string
  role: 'ADMIN' | 'MEMBER'
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
    isCurrentTeamManager: (state) => state.currentTeam?.role === 'ADMIN',
    currentUserRoleInTeam: (state) => state.currentTeam?.role ?? 'MEMBER',
  },

  actions: {
    async fetchTeams() {
      this.isLoading = true
      try {
        const api = useApi()
        const res = await api.get<{ success: boolean; data: any[] }>('/teams')
        this.teams = res.data.map((t) => ({
          ...t,
          role: t.role === 'MANAGER' ? 'ADMIN' : t.role,
        }))
      } finally {
        this.isLoading = false
      }
    },

    async fetchTeam(teamId: string) {
      const api = useApi()
      const res = await api.get<{ success: boolean; data: any }>(`/teams/${teamId}`)
      // Preserve the current user's role from the teams list (GET /teams includes role) - normalize backend MANAGER -> ADMIN
      const existing = this.teams.find((t) => t.id === teamId)
      const role = existing?.role ?? (res.data.role === 'MANAGER' ? 'ADMIN' : res.data.role ?? 'MEMBER')
      
      this.currentTeam = { ...res.data, role }
      return this.currentTeam
    },

    async fetchMembers(teamId: string) {
      const api = useApi()
      const res = await api.get<{ success: boolean; data: any[] }>(`/teams/${teamId}/members`)
      // Normalize roles in the response
      const members = res.data.map((m) => ({ ...m, role: m.role === 'MANAGER' ? 'ADMIN' : m.role })) as TeamMember[]
      this.currentTeamMembers = members

      // Derive current user's role from their membership record
      const authStore = useAuthStore()
      if (authStore.user) {
        const me = members.find((m) => m.userId === authStore.user!.id)
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
      return members
    },

    async createTeam(name: string, description?: string) {
      const api = useApi()
      const res = await api.post<{ success: boolean; data: any }>('/teams', { name, description })
      const newTeam = { ...res.data, role: res.data.role === 'MANAGER' ? 'ADMIN' : res.data.role }
      this.teams.unshift(newTeam)
      return newTeam
    },

    async updateTeam(teamId: string, data: { name?: string; description?: string }) {
      const api = useApi()
      const res = await api.patch<{ success: boolean; data: any }>(`/teams/${teamId}`, data)
      const updatedData = { ...res.data, role: res.data.role === 'MANAGER' ? 'ADMIN' : res.data.role }
      
      const idx = this.teams.findIndex((t) => t.id === teamId)
      if (idx !== -1) this.teams[idx] = { ...this.teams[idx], ...updatedData }
      if (this.currentTeam?.id === teamId) this.currentTeam = { ...this.currentTeam, ...updatedData }
      return updatedData
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

    async updateMemberRole(teamId: string, userId: string, role: 'ADMIN' | 'MEMBER') {
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

    async sendInvite(teamId: string, email: string, role: 'ADMIN' | 'MEMBER') {
      const api = useApi()
      return api.post(`/teams/${teamId}/invites`, { email, role })
    },

    setCurrentTeamFromList(teamId: string) {
      this.currentTeam = this.teams.find((t) => t.id === teamId) ?? null
    },
  },
})

