import type { RealtimeChannel, Message, TokenRequest, ErrorInfo } from 'ably'

type AblyRealtime = import('ably').Realtime

let realtimeInstance: AblyRealtime | null = null

export const useAbly = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const isConnected = ref(false)
  const channelInstances = new Map<string, RealtimeChannel>()

  /** Get or create the singleton Ably Realtime client */
  const getClient = async (): Promise<AblyRealtime> => {
    if (realtimeInstance) return realtimeInstance
    if (!import.meta.client) throw new Error('Ably Realtime is client-only')

    const { Realtime } = await import('ably')
    realtimeInstance = new Realtime({
      authCallback: async (_params, callback) => {
        try {
          const res = await $fetch<{ data: TokenRequest }>(
            `${config.public.apiBase}/ably/auth`,
            {
              headers: {
                Authorization: `Bearer ${authStore.accessToken}`,
              },
            },
          )
          callback(null, res.data)
        } catch (err) {
          console.error('[Ably] Auth callback failed:', err)
          const errorInfo: ErrorInfo = {
            name: 'AuthError',
            message: err instanceof Error ? err.message : 'Ably auth failed',
            code: 40100,
            statusCode: 401,
          }
          callback(errorInfo, null)
        }
      },
    })

    realtimeInstance.connection.on('connected', () => {
      console.log('[Ably] Connected')
      isConnected.value = true
    })
    realtimeInstance.connection.on('disconnected', () => {
      console.warn('[Ably] Disconnected')
      isConnected.value = false
    })
    realtimeInstance.connection.on('failed', (stateChange) => {
      console.error('[Ably] Connection failed:', stateChange.reason)
      isConnected.value = false
    })
    realtimeInstance.connection.on('closed', () => {
      isConnected.value = false
    })

    return realtimeInstance
  }

  /** Subscribe to a channel + event */
  const subscribe = async (
    channelName: string,
    event: string,
    callback: (msg: Message) => void,
  ): Promise<void> => {
    const client = await getClient()
    let channel = channelInstances.get(channelName)
    if (!channel) {
      channel = client.channels.get(channelName)
      channelInstances.set(channelName, channel)
    }
    await channel.subscribe(event, callback)
  }

  /** Unsubscribe and detach from a channel */
  const unsubscribe = (channelName: string) => {
    const channel = channelInstances.get(channelName)
    if (channel) {
      channel.unsubscribe()
      channel.detach()
      channelInstances.delete(channelName)
    }
  }

  /** Close the connection entirely */
  const disconnect = () => {
    if (realtimeInstance) {
      realtimeInstance.close()
      realtimeInstance = null
      channelInstances.clear()
      isConnected.value = false
    }
  }

  return {
    isConnected,
    getClient,
    subscribe,
    unsubscribe,
    disconnect,
  }
}
