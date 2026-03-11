/**
 * Protects system-admin-only pages.
 * Named middleware — applied per-page via definePageMeta({ middleware: 'admin' })
 */
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const authStore = useAuthStore()
  if (!authStore.isLoggedIn || !authStore.user?.isSystemAdmin) {
    return navigateTo('/dashboard')
  }
})
