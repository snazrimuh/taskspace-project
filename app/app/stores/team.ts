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

const CACHE_TTL = 60_000 // 1 minute cache

// Request deduplication - kept outside Pinia state to avoid reactivity/serialization issues
let _pendingTeams: Promise<void> | null = null
const _pendingTeam: Record<string, Promise<Team | null | undefined>> = {}
const _pendingMembers: Record<string, Promise<TeamMember[]>> = {}

export const useTeamStore = defineStore('team', {
  state: () => ({
    teams: [] as Team[],
    currentTeam: null as Team | null,
    currentTeamMembers: [] as TeamMember[],
    isLoading: false,
    _teamsLastFetch: 0,
    _teamLastFetch: {} as Record<string, number>,
    _membersLastFetch: {} as Record<string, number>,
  }),

  getters: {
    isCurrentTeamManager: (state) => state.currentTeam?.role === 'ADMIN',
    currentUserRoleInTeam: (state) => state.currentTeam?.role ?? 'MEMBER',
  },

  actions: {
    async fetchTeams(force = false) {
      if (!force && this.teams.length && Date.now() - this._teamsLastFetch < CACHE_TTL) return
      if (_pendingTeams) return _pendingTeams
      this.isLoading = true
      const promise = (async () => {
        try {
          const api = useApi()
          const res = await api.get<{ success: boolean; data: any[] }>('/teams')
          this.teams = res.data.map((t) => ({
            ...t,
            role: t.role === 'MANAGER' ? 'ADMIN' : t.role,
          }))
          this._teamsLastFetch = Date.now()
        } finally {
          this.isLoading = false
          _pendingTeams = null
        }
      })()
      _pendingTeams = promise
      return promise
    },

    async fetchTeam(teamId: string, force = false) {
      if (!force && this.currentTeam?.id === teamId && Date.now() - (this._teamLastFetch[teamId] ?? 0) < CACHE_TTL) {
        return this.currentTeam
      }
      if (_pendingTeam[teamId]) return _pendingTeam[teamId]
      const promise = (async () => {
        try {
          const api = useApi()
          const res = await api.get<{ success: boolean; data: any }>(`/teams/${teamId}`)
          const existing = this.teams.find((t) => t.id === teamId)
          const role = existing?.role ?? (res.data.role === 'MANAGER' ? 'ADMIN' : res.data.role ?? 'MEMBER')
          this.currentTeam = { ...res.data, role }
          this._teamLastFetch[teamId] = Date.now()
          return this.currentTeam
        } finally {
          delete _pendingTeam[teamId]
        }
      })()
      _pendingTeam[teamId] = promise
      return promise
    },

    async fetchMembers(teamId: string, force = false) {
      if (!force && this.currentTeamMembers.length && this.currentTeam?.id === teamId && Date.now() - (this._membersLastFetch[teamId] ?? 0) < CACHE_TTL) {
        return this.currentTeamMembers
      }
      if (_pendingMembers[teamId]) return _pendingMembers[teamId]
      const promise = (async () => {
        try {
          const api = useApi()
          const res = await api.get<{ success: boolean; data: any[] }>(`/teams/${teamId}/members`)
          const members = res.data.map((m) => ({ ...m, role: m.role === 'MANAGER' ? 'ADMIN' : m.role })) as TeamMember[]
          this.currentTeamMembers = members
          this._membersLastFetch[teamId] = Date.now()

          const authStore = useAuthStore()
          if (authStore.user) {
            const me = members.find((m) => m.userId === authStore.user!.id)
            if (me) {
              if (this.currentTeam?.id === teamId) {
                this.currentTeam = { ...this.currentTeam, role: me.role }
              } else {
                const fromList = this.teams.find((t) => t.id === teamId)
                if (fromList) this.currentTeam = { ...fromList, role: me.role }
              }
            }
          }
          return members
        } finally {
          delete _pendingMembers[teamId]
        }
      })()
      _pendingMembers[teamId] = promise
      return promise
    },

    async createTeam(name: string, description?: string) {
      const api = useApi()
      const res = await api.post<{ success: boolean; data: any }>('/teams', { name, description })
      const newTeam = { ...res.data, role: res.data.role === 'MANAGER' ? 'ADMIN' : res.data.role }
      this.teams.unshift(newTeam)
      this._teamsLastFetch = Date.now()
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
      this._teamsLastFetch = Date.now()
    },

    async leaveTeam(teamId: string) {
      const api = useApi()
      await api.post(`/teams/${teamId}/leave`)
      this.teams = this.teams.filter((t) => t.id !== teamId)
      this._teamsLastFetch = Date.now()
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

