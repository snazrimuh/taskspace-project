/**
 * Protects all routes that require authentication.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const runtime = useRuntimeConfig()
  const host = import.meta.client ? window.location.host : useRequestHeaders(['host']).host

  const retiredRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  if (retiredRoutes.includes(to.path)) {
    return navigateTo(`${runtime.public.hubUrl}${to.path}`, { external: true })
  }

  if (!authStore.isSessionChecked) {
    await Promise.race([
      authStore.validateSession(),
      new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(false), 5000)
      }),
    ])
  }

  if (!authStore.isLoggedIn) {
    const currentUrl = import.meta.client
      ? window.location.href
      : `https://${host}${to.fullPath}`
    const redirect = encodeURIComponent(currentUrl)
    return navigateTo(`${runtime.public.hubUrl}/login?redirect=${redirect}`, { external: true })
  }
})