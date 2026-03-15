import { defineStore } from 'pinia'

export interface AuthUser {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  isSystemAdmin: boolean
  createdAt?: string
}

interface AuthResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
    user: AuthUser
  }
}

interface TokenRefreshResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
  }
}

const STORAGE_KEY = 'taskspace_auth'

let _refreshPromise: Promise<void> | null = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    accessToken: null as string | null,
    refreshToken: null as string | null,
    isLoading: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken && !!state.user,
    currentUser: (state) => state.user,
  },

  actions: {
    async login(email: string, password: string) {
      this.isLoading = true
      try {
        const config = useRuntimeConfig()
        const res = await $fetch<AuthResponse>(
          `${config.public.apiBase}/auth/login`,
          { method: 'POST', body: { email, password } },
        )
        this._setSession(res.data.accessToken, res.data.refreshToken, res.data.user)
      } finally {
        this.isLoading = false
      }
    },

    async register(name: string, email: string, password: string) {
      this.isLoading = true
      try {
        const config = useRuntimeConfig()
        const res = await $fetch<AuthResponse>(
          `${config.public.apiBase}/auth/register`,
          { method: 'POST', body: { name, email, password } },
        )
        this._setSession(res.data.accessToken, res.data.refreshToken, res.data.user)
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        if (this.accessToken) {
          const config = useRuntimeConfig()
          await $fetch(`${config.public.apiBase}/auth/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.accessToken}` },
          })
        }
      } catch { /* ignore errors during logout */ }
      this.clear()
    },

    async refresh() {
      if (!this.refreshToken) throw new Error('No refresh token available')
      if (_refreshPromise) return _refreshPromise
      
      _refreshPromise = (async () => {
        try {
          const config = useRuntimeConfig()
          const res = await $fetch<TokenRefreshResponse>(
            `${config.public.apiBase}/auth/refresh`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${this.refreshToken}` },
            },
          )
          this._setSession(res.data.accessToken, res.data.refreshToken, this.user!)
        } finally {
          _refreshPromise = null
        }
      })()
      
      return _refreshPromise
    },

    async forgotPassword(email: string) {
      const config = useRuntimeConfig()
      return $fetch(`${config.public.apiBase}/auth/forgot-password`, {
        method: 'POST',
        body: { email },
      })
    },

    async resetPassword(token: string, newPassword: string) {
      const config = useRuntimeConfig()
      return $fetch(`${config.public.apiBase}/auth/reset-password`, {
        method: 'POST',
        body: { token, newPassword },
      })
    },

    updateProfile(updates: Partial<AuthUser>) {
      if (this.user) {
        this.user = { ...this.user, ...updates }
        this._persist()
      }
    },

    hydrate() {
      if (!import.meta.client) return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const { user, accessToken, refreshToken } = JSON.parse(raw)
        this.user = user ?? null
        this.accessToken = accessToken ?? null
        this.refreshToken = refreshToken ?? null
      } catch { /* ignore parse errors */ }
    },

    clear() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      if (import.meta.client) {
        localStorage.removeItem(STORAGE_KEY)
      }
    },

    _setSession(accessToken: string, refreshToken: string, user: AuthUser) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      this.user = user
      this._persist()
    },

    _persist() {
      if (!import.meta.client) return
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: this.user,
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
        }),
      )
    },
  },
})
