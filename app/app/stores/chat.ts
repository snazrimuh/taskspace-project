import { defineStore } from 'pinia'

interface ChatSender {
  id: string
  name: string
  avatar: string | null
}

interface ChatMessage {
  id: string
  message: string
  senderId: string
  teamId: string
  createdAt: string
  sender: ChatSender
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [] as ChatMessage[],
    nextCursor: null as string | null,
    loading: false,
    loadingMore: false,
    currentTeamId: null as string | null,
    typingUsers: [] as string[],
  }),

  actions: {
    async fetchMessages(teamId: string, cursor?: string) {
      const { get } = useApi()

      if (cursor) {
        this.loadingMore = true
      } else {
        this.loading = true
        this.messages = []
      }

      try {
        const params = new URLSearchParams()
        if (cursor) params.set('cursor', cursor)
        params.set('limit', '30')

        const res = await get<{ data: { messages: ChatMessage[]; nextCursor: string | null } }>(
          `/teams/${teamId}/messages?${params.toString()}`,
        )

        if (cursor) {
          this.messages = [...res.data.messages, ...this.messages]
        } else {
          this.messages = res.data.messages
        }
        this.nextCursor = res.data.nextCursor
        this.currentTeamId = teamId
      } finally {
        this.loading = false
        this.loadingMore = false
      }
    },

    async sendMessage(teamId: string, message: string) {
      const { post } = useApi()
      const res = await post<{ data: ChatMessage }>(`/teams/${teamId}/messages`, { message })
      // Add immediately so sender sees it
      this.addMessage(res.data)
    },

    addMessage(msg: ChatMessage) {
      if (this.currentTeamId && msg.teamId !== this.currentTeamId) {
        return
      }
      // Avoid duplicates
      if (!this.messages.find((m) => m.id === msg.id)) {
        this.messages.push(msg)
      }
    },

    setTypingUser(userId: string) {
      if (!this.typingUsers.includes(userId)) {
        this.typingUsers.push(userId)
      }
      // Remove after 3 seconds
      setTimeout(() => {
        this.typingUsers = this.typingUsers.filter((id) => id !== userId)
      }, 3000)
    },

    clearMessages() {
      this.messages = []
      this.nextCursor = null
      this.currentTeamId = null
      this.typingUsers = []
    },
  },
})
