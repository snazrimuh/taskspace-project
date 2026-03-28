import { useAuthStore } from '~/stores/auth'

export const useAuth = () => {
  const authStore = useAuthStore()

  const isLoggedIn = computed(() => authStore.isLoggedIn)
  const currentUser = computed(() => authStore.currentUser)
  const isLoading = computed(() => authStore.isLoading)

  const login = async (email: string, password: string) => {
    await authStore.login()
  }

  const register = async (name: string, email: string, password: string) => {
    await authStore.register()
  }

  const logout = async () => {
    await authStore.logout()
  }

  const forgotPassword = async (email: string) => {
    await authStore.forgotPassword()
  }

  const resetPassword = async (token: string, newPassword: string) => {
    await authStore.resetPassword()
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
