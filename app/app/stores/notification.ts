import { defineStore } from 'pinia'

interface Notification {
  id: string
  type: string
  message: string
  referenceId?: string
  referenceType?: string
  isRead: boolean
  createdAt: string
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [
      { id: '1', type: 'TASK_ASSIGNED', message: 'You have been assigned to "Setup auth guard"', isRead: false, createdAt: '2h ago' },
      { id: '2', type: 'ANNOUNCEMENT_CREATED', message: 'New announcement: "Weekly sync moved to 10:00"', isRead: false, createdAt: '3h ago' },
      { id: '3', type: 'MEMBER_JOINED', message: 'Dian joined Platform Team', isRead: true, createdAt: '1d ago' },
    ] as Notification[],
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter((n) => !n.isRead).length,
    unreadNotifications: (state) => state.notifications.filter((n) => !n.isRead),
  },

  actions: {
    markAsRead(id: string) {
      const n = this.notifications.find((n) => n.id === id)
      if (n) n.isRead = true
    },

    markAllAsRead() {
      this.notifications.forEach((n) => (n.isRead = true))
    },
  },
})
