<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between rounded-3xl border border-primary-200/40 dark:border-primary-500/20 p-5 md:p-6 bg-[radial-gradient(circle_at_20%_20%,rgba(61,137,187,0.20),transparent_45%),linear-gradient(135deg,#f9fcff_0%,#eff6fb_45%,#e8f2f8_100%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(61,137,187,0.16),transparent_42%),linear-gradient(135deg,#0a1422_0%,#0b192a_60%,#10263a_100%)]">
      <div>
        <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">Announcements</h2>
        <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">Satu feed resmi untuk update tim, keputusan penting, dan broadcast prioritas.</p>
      </div>
      <UiButton v-if="isManager" @click="showCreate = true">
        <Plus class="h-4 w-4 mr-2" />
        New
      </UiButton>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <UiCard>
        <UiCardContent class="pt-4">
          <p class="text-xs uppercase tracking-wider text-slate-500">Total Posts</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ announcements.length }}</p>
        </UiCardContent>
      </UiCard>
      <UiCard>
        <UiCardContent class="pt-4">
          <p class="text-xs uppercase tracking-wider text-slate-500">Pinned</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ pinnedAnnouncements.length }}</p>
        </UiCardContent>
      </UiCard>
      <UiCard>
        <UiCardContent class="pt-4">
          <p class="text-xs uppercase tracking-wider text-slate-500">Unread</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ unreadCount }}</p>
        </UiCardContent>
      </UiCard>
      <UiCard>
        <UiCardContent class="pt-4">
          <p class="text-xs uppercase tracking-wider text-slate-500">Avg Read Rate</p>
          <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ averageReadRate }}%</p>
        </UiCardContent>
      </UiCard>
    </div>

    <UiCard v-if="!isLoading && announcements.length === 0">
      <UiCardContent class="pt-8 pb-8 text-center">
        <p class="font-semibold text-slate-700 dark:text-slate-200">No announcements yet</p>
        <p class="text-sm text-slate-500 mt-1">Mulai dengan update penting tim agar semua anggota sinkron.</p>
      </UiCardContent>
    </UiCard>

    <!-- Pinned Announcements -->
    <div v-if="pinnedAnnouncements.length" class="space-y-3">
      <div class="text-xs uppercase tracking-wider text-slate-400 font-medium">Pinned</div>
      <AnnouncementCard
        v-for="a in pinnedAnnouncements"
        :key="a.id"
        :announcement="a"
        @click="openAnnouncement(a)"
      />
    </div>

    <!-- All Announcements -->
    <div class="space-y-3">
      <div v-if="pinnedAnnouncements.length" class="text-xs uppercase tracking-wider text-slate-400 font-medium mt-2">Recent</div>
      <AnnouncementCard
        v-for="a in regularAnnouncements"
        :key="a.id"
        :announcement="a"
        @click="openAnnouncement(a)"
      />
    </div>

    <!-- Create Announcement Modal -->
    <UiModal v-model="showCreate" title="New Announcement">
      <form class="space-y-4" @submit.prevent="handleCreate">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
          <UiInput v-model="newTitle" placeholder="Announcement title" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
          <UiTextarea v-model="newContent" placeholder="Write your announcement..." :rows="5" />
        </div>
        <div class="flex items-center gap-3 mb-2">
          <label class="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input v-model="newPinned" type="checkbox" class="rounded" />
            Pin this announcement
          </label>
        </div>
        <p v-if="createError" class="text-sm text-red-600 dark:text-red-400">{{ createError }}</p>
        <div class="flex justify-end gap-2">
          <UiButton variant="outline" type="button" @click="showCreate = false">Cancel</UiButton>
          <UiButton type="submit" :disabled="isCreating">{{ isCreating ? 'Publishing...' : 'Publish' }}</UiButton>
        </div>
      </form>
    </UiModal>

    <!-- Announcement Detail Modal -->
    <UiModal v-model="showDetail" :title="selectedAnnouncement?.title || ''" size="lg">
      <div v-if="selectedAnnouncement">
        <div class="flex items-center gap-2 mb-4">
          <UiAvatar :name="selectedAnnouncement.author?.name || 'A'" :src="selectedAnnouncement.author?.avatar || ''" size="sm" />
          <div>
            <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ selectedAnnouncement.author?.name }}</span>
            <span class="text-sm text-slate-400 ml-2">{{ formatTime(selectedAnnouncement.createdAt) }}</span>
          </div>
          <UiBadge v-if="selectedAnnouncement.pinned" variant="warning" class="ml-auto">Pinned</UiBadge>
        </div>
        <div class="prose prose-sm prose-slate max-w-none">
          <p class="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{{ selectedAnnouncement.content }}</p>
        </div>
        <div class="mt-6 pt-4 border-t flex items-center justify-between">
          <div class="text-xs text-slate-400">Read by {{ selectedAnnouncement.readCount }} of {{ selectedAnnouncement.totalMembers }} members</div>
          <div v-if="isManager" class="flex gap-2">
            <UiButton variant="outline" size="sm" @click="handleTogglePin(selectedAnnouncement.id)">
              {{ selectedAnnouncement.pinned ? 'Unpin' : 'Pin' }}
            </UiButton>
            <UiButton variant="danger" size="sm" @click="handleDeleteAnnouncement(selectedAnnouncement.id)">Delete</UiButton>
          </div>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

const route = useRoute()
const teamStore = useTeamStore()
const api = useApi()

const teamId = computed(() => route.params.teamId as string)
const isManager = computed(() => teamStore.isCurrentTeamManager)

// ── State ──────────────────────────────────────────────────────────────
const showCreate = ref(false)
const showDetail = ref(false)
const newTitle = ref('')
const newContent = ref('')
const newPinned = ref(false)
const selectedAnnouncement = ref<any>(null)
const announcements = ref<any[]>([])
const isLoading = ref(false)
const isCreating = ref(false)
const createError = ref('')

// ── Computed ───────────────────────────────────────────────────────────
const pinnedAnnouncements = computed(() => announcements.value.filter((a) => a.pinned))
const regularAnnouncements = computed(() => announcements.value.filter((a) => !a.pinned))
const unreadCount = computed(() => announcements.value.filter((a) => !a.isRead).length)
const averageReadRate = computed(() => {
  if (!announcements.value.length) return 0
  const rates = announcements.value.map((a) => {
    const total = Number(a.totalMembers ?? 0)
    const read = Number(a.readCount ?? 0)
    if (total <= 0) return 0
    return (read / total) * 100
  })
  const avg = rates.reduce((sum, value) => sum + value, 0) / rates.length
  return Math.round(avg)
})

// ── Fetch ──────────────────────────────────────────────────────────────
const fetchAnnouncements = async () => {
  isLoading.value = true
  try {
    const res = await api.get<{ success: boolean; data: any[] }>(`/teams/${teamId.value}/announcements`)
    announcements.value = res.data ?? []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchAnnouncements(),
    teamStore.fetchMembers(teamId.value),
  ])
})
watch(teamId, async () => {
  await Promise.all([
    fetchAnnouncements(),
    teamStore.fetchMembers(teamId.value),
  ])
})

// ── Open detail + mark read ────────────────────────────────────────────
const openAnnouncement = async (a: any) => {
  selectedAnnouncement.value = a
  showDetail.value = true
  if (!a.isRead) {
    try {
      await api.post(`/teams/${teamId.value}/announcements/${a.id}/read`, {})
      const idx = announcements.value.findIndex((x) => x.id === a.id)
      if (idx !== -1) announcements.value[idx].isRead = true
    } catch { /* ignore */ }
  }
}

// ── Create ─────────────────────────────────────────────────────────────
const handleCreate = async () => {
  if (!newTitle.value.trim()) return
  createError.value = ''
  isCreating.value = true
  try {
    const res = await api.post<{ success: boolean; data: any }>(`/teams/${teamId.value}/announcements`, {
      title: newTitle.value.trim(),
      content: newContent.value.trim(),
      pinned: newPinned.value,
    })
    announcements.value.unshift(res.data)
    newTitle.value = ''
    newContent.value = ''
    newPinned.value = false
    showCreate.value = false
  } catch (err: any) {
    createError.value = err?.data?.message ?? 'Failed to publish announcement'
  } finally {
    isCreating.value = false
  }
}

// ── Toggle pin ─────────────────────────────────────────────────────────
const handleTogglePin = async (id: string) => {
  try {
    await api.patch(`/teams/${teamId.value}/announcements/${id}/pin`, {})
    const idx = announcements.value.findIndex((a) => a.id === id)
    if (idx !== -1) {
      announcements.value[idx].pinned = !announcements.value[idx].pinned
      if (selectedAnnouncement.value?.id === id)
        selectedAnnouncement.value.pinned = announcements.value[idx].pinned
    }
  } catch { /* ignore */ }
}

// ── Delete ─────────────────────────────────────────────────────────────
const handleDeleteAnnouncement = async (id: string) => {
  try {
    await api.delete(`/teams/${teamId.value}/announcements/${id}`)
    announcements.value = announcements.value.filter((a) => a.id !== id)
    showDetail.value = false
  } catch { /* ignore */ }
}

// ── Format time ────────────────────────────────────────────────────────
const formatTime = (date: string) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
</script>
