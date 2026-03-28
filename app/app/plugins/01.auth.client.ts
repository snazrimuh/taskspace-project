export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()

  if (import.meta.client) {
    try {
      await Promise.race([
        authStore.validateSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Auth Timeout')), 5000)),
      ])
    } catch (e) {
      console.warn('Task-Space: Auth validation timed out or failed:', e)
    }
  }
})
