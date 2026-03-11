/**
 * Hydrates the auth store from localStorage on every client-side app init.
 * Prefix "01" ensures this runs before other plugins and route middleware.
 */
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  authStore.hydrate()
})
