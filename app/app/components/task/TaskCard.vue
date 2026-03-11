<template>
  <div
    draggable="true"
    class="rounded-xl border border-slate-200 dark:border-slate-700/30 p-3 bg-white dark:bg-slate-800/40 hover:shadow-sm dark:hover:border-slate-600/50 transition-all cursor-grab active:cursor-grabbing group"
    :class="{ 'opacity-40 scale-95': isDragging }"
    @click="$emit('click')"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div class="flex items-start justify-between gap-2">
      <h4 class="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100">{{ task.title }}</h4>
      <UiBadge :variant="priorityVariant" size="sm">{{ task.priority }}</UiBadge>
    </div>

    <div class="flex items-center justify-between mt-2.5">
      <div v-if="task.dueDate" class="flex items-center gap-1 text-xs text-slate-400">
        <CalendarDays class="h-3 w-3" />
        <span>{{ formatDate(task.dueDate) }}</span>
      </div>
      <div v-else />
      <UiAvatar v-if="task.assignee" :name="task.assignee" size="sm" class="!h-6 !w-6 !text-[10px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDays } from 'lucide-vue-next'

interface Props {
  task: {
    id: string
    title: string
    priority: string
    assignee?: string
    dueDate?: string
  }
}

const props = defineProps<Props>()
defineEmits<{ click: [] }>()

const isDragging = ref(false)

const onDragStart = (e: DragEvent) => {
  isDragging.value = true
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('text/plain', props.task.id)
}

const onDragEnd = () => {
  isDragging.value = false
}

const priorityVariant = computed(() => {
  const map: Record<string, any> = { LOW: 'secondary', MEDIUM: 'info', HIGH: 'warning', URGENT: 'danger' }
  return map[props.task.priority] || 'secondary'
})

const formatDate = (date: string) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
