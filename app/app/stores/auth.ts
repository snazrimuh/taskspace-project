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

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(false)
  const isSessionChecked = ref(false)
  const runtime = useRuntimeConfig()

  const accessToken = useCookie('access_token')
  const refreshToken = useCookie('refresh_token')

  const isLoggedIn = computed(() => !!user.value)
  const currentUser = computed(() => user.value)

  const validateSession = async (): Promise<boolean> => {
    if (!accessToken.value && import.meta.server) {
      user.value = null
      isSessionChecked.value = true
      return false
    }

    try {
      const requestHeaders = import.meta.server ? useRequestHeaders(['cookie']) : undefined
      const fetchOptions: {
        credentials: 'include'
        headers?: Record<string, string>
      } = {
        credentials: 'include',
      }

      if (import.meta.server && requestHeaders?.cookie) {
        fetchOptions.headers = { cookie: requestHeaders.cookie }
      }

      const res = await $fetch<AuthUser | { success?: boolean; data?: AuthUser }>(
        `${runtime.public.apiBase}/auth/me`,
        fetchOptions,
      )

      const userData = (res as any)?.data ?? res
      if (userData && (userData as AuthUser).id) {
        user.value = userData as AuthUser
        return true
      }

      user.value = null
      return false
    } catch (error) {
      console.error('Task-Space: Session validation failed:', error)
      user.value = null
      return false
    } finally {
      isSessionChecked.value = true
    }
  }

  const logout = async () => {
    try {
      await $fetch(`${runtime.public.apiBase}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (e) {
      console.error('Logout error:', e)
    } finally {
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      window.location.href = `${runtime.public.hubUrl}`
    }
  }

  const login = () => {
    window.location.href = `${runtime.public.hubUrl}/login`
  }

  const register = () => {
    window.location.href = `${runtime.public.hubUrl}/login?mode=register`
  }

  const forgotPassword = () => {
    window.location.href = `${runtime.public.hubUrl}/login`
  }

  const resetPassword = () => {
    window.location.href = `${runtime.public.hubUrl}/login`
  }

  const updateProfile = (updates: Partial<AuthUser>) => {
    if (user.value) {
      user.value = { ...user.value, ...updates }
    }
  }

  const clear = () => {
    user.value = null
    isSessionChecked.value = true
  }

  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    isSessionChecked,
    isLoggedIn,
    currentUser,
    validateSession,
    logout,
    login,
    register,
    forgotPassword,
    resetPassword,
    updateProfile,
    clear,
  }
})
