<template>
  <div class="h-[calc(100vh-120px)] flex flex-col gap-2">
    <!-- Compact Header -->
    <div class="relative overflow-hidden bg-[linear-gradient(135deg,rgba(219,236,255,0.75)_0%,rgba(186,215,248,0.55)_40%,rgba(162,200,238,0.45)_100%)] dark:bg-[linear-gradient(135deg,#1B263B_0%,#111827_100%)] rounded-3xl px-5 py-3.5 flex items-center justify-between shrink-0 text-[#1C3C62] dark:text-white shadow-[0_8px_32px_rgba(42,74,116,0.12)] dark:shadow-xl border border-white/70 dark:border-white/5 backdrop-blur-xl ring-1 ring-[#7EB8E5]/15 dark:ring-0 mb-1">
      <!-- Glass shimmer overlays (light mode only) -->
      <div class="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent dark:opacity-0 rounded-3xl pointer-events-none"></div>
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:opacity-0 rounded-t-3xl pointer-events-none"></div>
      <div class="relative flex items-center gap-3">
        <div class="p-2 bg-[#2A4A74]/15 dark:bg-white/10 rounded-xl border border-[#2A4A74]/20 dark:border-white/10">
           <MessageSquare class="w-4 h-4 text-[#1C3C62] dark:text-white" />
        </div>
        <div class="flex items-baseline gap-2">
           <span class="text-sm font-bold tracking-tight text-[#1C3C62] dark:text-white">Team Chat</span>
           <span class="text-xs text-[#2A4A74]/60 dark:text-slate-400">· {{ teamStore.currentTeamMembers.length }} members</span>
        </div>
      </div>
      <span class="text-[11px] text-[#2A4A74]/60 dark:text-slate-400">{{ chatStore.messages.length }} messages</span>
    </div>

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

        <template v-for="item in chatItems" :key="item.key">
          <div
            v-if="item.type === 'separator'"
            class="sticky top-2 z-10 flex justify-center py-1"
          >
            <span class="rounded-full border border-white/70 dark:border-white/[0.08] bg-white/90 dark:bg-[#111827]/90 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-sm backdrop-blur-sm">
              {{ item.label }}
            </span>
          </div>

          <div
            v-else
            :class="['flex', isMe(item.message) ? 'justify-end' : 'justify-start']"
          >
            <div :class="['max-w-[70%] flex gap-2', isMe(item.message) ? 'flex-row-reverse' : '']">
              <UiAvatar
                v-if="!isMe(item.message)"
                :name="item.message.sender.name"
                :src="item.message.sender.avatar || ''"
                size="sm"
                class="shrink-0 mt-1"
              />
              <div>
                <div v-if="!isMe(item.message)" class="text-xs text-slate-500 dark:text-slate-500 mb-1 ml-1">
                  {{ item.message.sender.name }}
                </div>
                <div
                  :class="[
                    'rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
                    isMe(item.message)
                      ? 'bg-[#1F3F68] text-white rounded-br-sm border border-[#2A4A74] shadow-[0_5px_14px_rgba(10,22,36,0.42)]'
                      : 'bg-[rgba(224,225,221,0.7)] dark:bg-[#202C33] text-[#0D1B2A] dark:text-[#E9EDEF] rounded-bl-sm border border-white/70 dark:border-transparent',
                  ]"
                >
                  {{ item.message.message }}
                </div>
                <div :class="['text-[10px] text-slate-400 dark:text-slate-600 mt-0.5', isMe(item.message) ? 'text-right mr-1' : 'ml-1']">
                  {{ formatTime(item.message.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Typing indicator -->
        <div v-if="typingUsers.length" class="flex justify-start">
          <div class="flex gap-2">
            <UiAvatar :name="typingUsers[0].name" :src="typingUsers[0].avatar" size="sm" class="shrink-0 mt-1" />
            <div>
              <div class="text-xs text-slate-500 dark:text-slate-500 mb-1 ml-1">
                {{ typingUsers.map((u) => u.name).join(', ') }}
              </div>
              <div class="bg-white/60 dark:bg-[#202C33] rounded-2xl rounded-bl-sm px-4 py-2 border border-white/70 dark:border-transparent">
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
      <div class="p-3 border-t border-white/60 dark:border-white/[0.07] flex items-center gap-2">
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
import { Send, MessageSquare } from 'lucide-vue-next'

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
let activeChannelName: string | null = null

const isMe = (msg: { senderId: string }) => msg.senderId === authStore.user?.id

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const isSameDay = (a: Date, b: Date) => {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const dateKeyFrom = (dateStr: string) => {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const formatDateLabel = (dateStr: string) => {
  const currentDate = new Date(dateStr)
  const today = new Date()

  if (isSameDay(currentDate, today)) {
    return 'Today'
  }

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (isSameDay(currentDate, yesterday)) {
    return 'Yesterday'
  }

  return currentDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

type ChatRenderItem =
  | { type: 'separator'; key: string; label: string }
  | { type: 'message'; key: string; message: (typeof chatStore.messages)[number] }

const chatItems = computed<ChatRenderItem[]>(() => {
  const items: ChatRenderItem[] = []
  let lastDateKey = ''

  for (const msg of chatStore.messages) {
    const currentDateKey = dateKeyFrom(msg.createdAt)
    if (currentDateKey !== lastDateKey) {
      items.push({
        type: 'separator',
        key: `sep-${currentDateKey}`,
        label: formatDateLabel(msg.createdAt),
      })
      lastDateKey = currentDateKey
    }

    items.push({
      type: 'message',
      key: msg.id,
      message: msg,
    })
  }

  return items
})

/** Resolve typing user IDs to names */
const typingUsers = computed(() => {
  return chatStore.typingUsers
    .filter((id) => id !== authStore.user?.id)
    .map((id) => {
      const member = teamStore.currentTeamMembers.find((m) => m.userId === id)
      return {
        name: member?.user.name ?? 'Someone',
        avatar: member?.user.avatar ?? '',
      }
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

const initTeamChat = async (nextTeamId: string) => {
  const nextChannel = `team:${nextTeamId}:chat`

  if (activeChannelName && activeChannelName !== nextChannel) {
    unsubscribe(activeChannelName)
  }

  chatStore.clearMessages()
  await chatStore.fetchMessages(nextTeamId)
  scrollToBottom()

  if (!teamStore.currentTeamMembers.length || teamStore.currentTeam?.id !== nextTeamId) {
    await teamStore.fetchMembers(nextTeamId)
  }

  try {
    await subscribe(nextChannel, 'message', (msg) => {
      if (msg.data?.teamId !== nextTeamId) {
        return
      }
      chatStore.addMessage(msg.data)
      scrollToBottom()
    })

    await subscribe(nextChannel, 'typing', (msg) => {
      if (msg.data?.userId && chatStore.currentTeamId === nextTeamId && msg.data.userId !== authStore.user?.id) {
        chatStore.setTypingUser(msg.data.userId)
      }
    })

    activeChannelName = nextChannel
  } catch (err) {
    console.error('[Chat] Failed to subscribe to Ably:', err)
  }
}

// Auto-scroll when new messages arrive
watch(() => chatStore.messages.length, () => {
  scrollToBottom()
})

onMounted(async () => {
  await initTeamChat(teamId.value)
})

watch(teamId, async (nextTeamId, prevTeamId) => {
  if (!nextTeamId || nextTeamId === prevTeamId) {
    return
  }
  await initTeamChat(nextTeamId)
})

onUnmounted(() => {
  if (activeChannelName) {
    unsubscribe(activeChannelName)
  }
  chatStore.clearMessages()
})
</script>
