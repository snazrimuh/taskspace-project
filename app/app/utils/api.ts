type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT' | 'HEAD'

/**
 * useApi — composable that wraps $fetch with:
 *   - automatic Bearer token injection from auth store
 *   - 401 → refresh token → retry once
 *   - if refresh fails, clears session and redirects to /login
 */
export function useApi() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  async function request<T>(
    method: HttpMethod,
    url: string,
    body?: unknown,
    options?: Record<string, unknown>,
  ): Promise<T> {
    const authHeader = (): Record<string, string> =>
      authStore.accessToken
        ? { Authorization: `Bearer ${authStore.accessToken}` }
        : {}

    const fetchUrl = `${config.public.apiBase}${url}`

    try {
      return await $fetch<T>(fetchUrl, {
        method,
        body: body ?? undefined,
        ...options,
        headers: { ...authHeader(), ...((options?.headers as Record<string, string>) ?? {}) },
      })
    } catch (err: any) {
      // Jika error 401 (Unauthorized)
      if (err?.status === 401) {
        // Coba refresh token jika ada
        if (authStore.refreshToken) {
          try {
            await authStore.refresh()
            // Jika berhasil refresh, ulangi request aslinya
            return await $fetch<T>(fetchUrl, {
              method,
              body: body ?? undefined,
              ...options,
              headers: {
                Authorization: `Bearer ${authStore.accessToken}`,
                ...((options?.headers as Record<string, string>) ?? {}),
              },
            })
          } catch {
            // Jika refresh gagal (token refresh invalid/expired), force logout
            authStore.clear()
            await navigateTo('/login')
            throw err
          }
        } else {
          // Jika tidak ada refresh token sama sekali, langsung force logout
          authStore.clear()
          await navigateTo('/login')
        }
      }
      throw err
    }
  }

  return {
    get: <T>(url: string, options?: Record<string, unknown>) =>
      request<T>('GET', url, undefined, options),
    post: <T>(url: string, body?: unknown, options?: Record<string, unknown>) =>
      request<T>('POST', url, body, options),
    patch: <T>(url: string, body?: unknown, options?: Record<string, unknown>) =>
      request<T>('PATCH', url, body, options),
    delete: <T>(url: string, options?: Record<string, unknown>) =>
      request<T>('DELETE', url, undefined, options),
  }
}
