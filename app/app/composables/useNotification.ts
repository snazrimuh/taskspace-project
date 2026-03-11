import { useNotificationStore } from '~/stores/notification'

export const useNotification = () => {
  const notifStore = useNotificationStore()

  const unreadCount = computed(() => notifStore.unreadCount)
  const notifications = computed(() => notifStore.notifications)

  const markAsRead = (id: string) => notifStore.markAsRead(id)
  const markAllAsRead = () => notifStore.markAllAsRead()

  return {
    unreadCount,
    notifications,
    markAsRead,
    markAllAsRead,
  }
}
