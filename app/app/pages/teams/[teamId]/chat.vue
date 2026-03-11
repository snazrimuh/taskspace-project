<template>
  <div class="space-y-3 h-[calc(100vh-120px)] flex flex-col">
    <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Team Chat</h2>

    <UiCard class="flex-1 flex flex-col overflow-hidden">
      <!-- Loading -->
      <div v-if="chatStore.loading" class="flex-1 flex items-center justify-center">
        <div class="text-slate-400 dark:text-slate-500">Loading messages...</div>
      </div>

      <!-- Messages -->
      <div v-else ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3" @scroll="onScroll">
        <!-- Load more -->
        <div v-if="chatStore.nextCursor" class="text-center">
          <button
            class="text-xs text-primary-500 hover:underline disabled:opacity-50"
            :disabled="chatStore.loadingMore"
            @click="loadMore"
          >
            {{ chatStore.loadingMore ? 'Loading...' : 'Load older messages' }}
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="!chatStore.messages?.length" class="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500">
          No messages yet. Start the conversation!
        </div>

        <div
          v-for="msg in chatStore.messages"
          :key="msg.id"
          :class="['flex', isMe(msg) ? 'justify-end' : 'justify-start']"
        >
          <div :class="['max-w-[70%] flex gap-2', isMe(msg) ? 'flex-row-reverse' : '']">
            <UiAvatar
              v-if="!isMe(msg)"
              :name="msg.sender.name"
              size="sm"
              class="shrink-0 mt-1"
            />
            <div>
              <div v-if="!isMe(msg)" class="text-xs text-slate-500 dark:text-slate-500 mb-1 ml-1">
                {{ msg.sender.name }}
              </div>
              <div
                :class="[
                  'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  isMe(msg)
                    ? 'bg-primary-600 dark:bg-primary-600 text-white rounded-br-sm'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-transparent dark:border-slate-700/30',
                ]"
              >
                {{ msg.message }}
              </div>
              <div :class="['text-[10px] text-slate-400 dark:text-slate-600 mt-0.5', isMe(msg) ? 'text-right mr-1' : 'ml-1']">
                {{ formatTime(msg.createdAt) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="typingNames.length" class="flex justify-start">
          <div class="flex gap-2">
            <UiAvatar :name="typingNames[0]" size="sm" class="shrink-0 mt-1" />
            <div>
              <div class="text-xs text-slate-500 dark:text-slate-500 mb-1 ml-1">
                {{ typingNames.join(', ') }}
              </div>
              <div class="bg-slate-100 dark:bg-slate-800/60 rounded-2xl rounded-bl-sm px-4 py-2 border border-transparent dark:border-slate-700/30">
                <div class="flex items-center gap-1">
                  <span class="h-1.5 w-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style="animation-delay: 0ms" />
                  <span class="h-1.5 w-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style="animation-delay: 150ms" />
                  <span class="h-1.5 w-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style="animation-delay: 300ms" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="p-3 border-t border-slate-200 dark:border-slate-700/30 flex items-center gap-2">
        <UiInput
          v-model="newMessage"
          placeholder="Type a message..."
          class="flex-1"
          @keyup.enter="sendMessage"
          @input="emitTyping"
        />
        <UiButton :disabled="!newMessage.trim() || sending" @click="sendMessage">
          <Send class="h-4 w-4" />
        </UiButton>
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { Send } from 'lucide-vue-next'

const route = useRoute()
const teamId = computed(() => route.params.teamId as string)

const authStore = useAuthStore()
const chatStore = useChatStore()
const teamStore = useTeamStore()
const { subscribe, unsubscribe } = useAbly()
const { post } = useApi()

const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const sending = ref(false)
let typingTimeout: ReturnType<typeof setTimeout> | null = null

const isMe = (msg: { senderId: string }) => msg.senderId === authStore.user?.id

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

/** Resolve typing user IDs to names */
const typingNames = computed(() => {
  return chatStore.typingUsers
    .filter((id) => id !== authStore.user?.id)
    .map((id) => {
      const member = teamStore.currentTeamMembers.find((m) => m.userId === id)
      return member?.user.name ?? 'Someone'
    })
})

/** Scroll to bottom of messages */
const scrollToBottom = () => {
  nextTick(() => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  })
}

/** Load older messages */
const loadMore = async () => {
  if (!chatStore.nextCursor) return
  const prevHeight = messagesContainer.value?.scrollHeight ?? 0
  await chatStore.fetchMessages(teamId.value, chatStore.nextCursor)
  // Maintain scroll position after prepending older messages
  nextTick(() => {
    if (messagesContainer.value) {
      const newHeight = messagesContainer.value.scrollHeight
      messagesContainer.value.scrollTop = newHeight - prevHeight
    }
  })
}

/** Auto-load more when scrolled to top */
const onScroll = () => {
  if (!messagesContainer.value || !chatStore.nextCursor || chatStore.loadingMore) return
  if (messagesContainer.value.scrollTop < 50) {
    loadMore()
  }
}

/** Send message */
const sendMessage = async () => {
  const text = newMessage.value.trim()
  if (!text || sending.value) return

  newMessage.value = ''
  sending.value = true
  try {
    await chatStore.sendMessage(teamId.value, text)
    scrollToBottom()
  } finally {
    sending.value = false
  }
}

/** Emit typing indicator (throttled) */
const emitTyping = () => {
  if (typingTimeout) return
  typingTimeout = setTimeout(() => {
    typingTimeout = null
  }, 2000)
  post(`/teams/${teamId.value}/messages/typing`, {}).catch(() => {})
}

/** Setup Ably subscriptions */
const channelName = computed(() => `team:${teamId.value}:chat`)

// Auto-scroll when new messages arrive
watch(() => chatStore.messages.length, () => {
  scrollToBottom()
})

onMounted(async () => {
  // Fetch initial messages
  await chatStore.fetchMessages(teamId.value)
  scrollToBottom()

  // Fetch members for name resolution
  if (!teamStore.currentTeamMembers.length) {
    teamStore.fetchMembers(teamId.value)
  }

  // Subscribe to real-time messages via Ably
  try {
    await subscribe(channelName.value, 'message', (msg) => {
      if (msg.data) {
        chatStore.addMessage(msg.data)
        scrollToBottom()
      }
    })

    await subscribe(channelName.value, 'typing', (msg) => {
      if (msg.data?.userId && msg.data.userId !== authStore.user?.id) {
        chatStore.setTypingUser(msg.data.userId)
      }
    })
  } catch (err) {
    console.error('[Chat] Failed to subscribe to Ably:', err)
  }
})

onUnmounted(() => {
  unsubscribe(channelName.value)
  chatStore.clearMessages()
})
</script>
