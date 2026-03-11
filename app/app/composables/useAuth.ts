import { useAuthStore } from '~/stores/auth'

export const useAuth = () => {
  const authStore = useAuthStore()

  const isLoggedIn = computed(() => authStore.isLoggedIn)
  const currentUser = computed(() => authStore.currentUser)
  const isLoading = computed(() => authStore.isLoading)

  const login = async (email: string, password: string) => {
    await authStore.login(email, password)
  }

  const register = async (name: string, email: string, password: string) => {
    await authStore.register(name, email, password)
  }

  const logout = async () => {
    await authStore.logout()
    await navigateTo('/login')
  }

  const forgotPassword = async (email: string) => {
    await authStore.forgotPassword(email)
  }

  const resetPassword = async (token: string, newPassword: string) => {
    await authStore.resetPassword(token, newPassword)
  }

  return {
    isLoggedIn,
    currentUser,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  }
}
