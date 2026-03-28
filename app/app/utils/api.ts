type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT' | 'HEAD'

/**
 * useApi — composable that wraps $fetch with cookie credentials:
 *   - always sends credentials to backend
 *   - retries once after /auth/refresh on 401
 *   - redirects to Hub login when refresh fails
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
    const fetchUrl = `${config.public.apiBase}${url}`

    try {
      return await $fetch<T>(fetchUrl, {
        method,
        body: body ?? undefined,
        credentials: 'include',
        ...options,
      })
    } catch (err: any) {
      if (err?.status === 401) {
        try {
          await $fetch(`${config.public.apiBase}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          })

          return await $fetch<T>(fetchUrl, {
            method,
            body: body ?? undefined,
            credentials: 'include',
            ...options,
          })
        } catch {
          authStore.clear()
          const currentUrl = import.meta.client ? window.location.href : '/'
          const redirect = encodeURIComponent(currentUrl)
          await navigateTo(`${config.public.hubUrl}/login?redirect=${redirect}`, { external: true })
          throw err
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
    put: <T>(url: string, body?: unknown, options?: Record<string, unknown>) =>
      request<T>('PUT', url, body, options),
    patch: <T>(url: string, body?: unknown, options?: Record<string, unknown>) =>
      request<T>('PATCH', url, body, options),
    delete: <T>(url: string, options?: Record<string, unknown>) =>
      request<T>('DELETE', url, undefined, options),
  }
}
