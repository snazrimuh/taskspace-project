<template>
  <UiCard class="cursor-pointer hover:shadow-md dark:hover:border-slate-600/50 transition-all" @click="$emit('click')">
    <UiCardContent class="pt-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="font-medium text-slate-900 dark:text-slate-200 truncate">{{ announcement.title }}</h3>
            <span
              v-if="!announcement.isRead"
              class="h-2 w-2 bg-primary-500 rounded-full shrink-0"
            />
          </div>
          <p class="text-sm text-slate-500 mt-1 line-clamp-2">{{ announcement.content }}</p>
          <div class="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span class="flex items-center gap-1">
              <UiAvatar :name="authorName" :src="authorAvatar" size="sm" class="!h-4 !w-4 !text-[8px]" />
              {{ authorName }}
            </span>
            <span>{{ timeStr }}</span>
            <span>{{ announcement._count?.readBy ?? 0 }} read</span>
          </div>
        </div>
        <UiBadge v-if="announcement.pinned" variant="warning">Pinned</UiBadge>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
interface AnnouncementAuthor { id: string; name: string; avatar?: string }
interface Props {
  announcement: {
    id: string
    title: string
    content: string
    author: AnnouncementAuthor | string
    createdAt?: string
    pinned: boolean
    isRead?: boolean
    _count?: { readBy: number }
  }
}

const props = defineProps<Props>()
defineEmits<{ click: [] }>()

const authorName = computed(() =>
  typeof props.announcement.author === 'string'
    ? props.announcement.author
    : props.announcement.author?.name ?? 'Unknown'
)

const authorAvatar = computed(() =>
  typeof props.announcement.author === 'string'
    ? ''
    : props.announcement.author?.avatar ?? ''
)

const timeStr = computed(() => {
  if (!props.announcement.createdAt) return ''
  const diff = Date.now() - new Date(props.announcement.createdAt).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
})
</script>
