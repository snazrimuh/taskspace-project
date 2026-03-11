/**
 * Protects all routes that require authentication.
 * Named middleware — applied per-page via definePageMeta({ middleware: 'auth' })
 */
export default defineNuxtRouteMiddleware(() => {
  // localStorage is only available on the client
  if (import.meta.server) return

  const authStore = useAuthStore()
  if (!authStore.isLoggedIn) {
    return navigateTo('/login')
  }
})
