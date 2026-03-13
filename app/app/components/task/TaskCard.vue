<template>
  <div
    draggable="true"
    class="rounded-xl p-3.5 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-200/70 dark:border-slate-700/40 transition-all duration-150 cursor-grab active:cursor-grabbing"
    :class="{ 'opacity-40 scale-95': isDragging }"
    @click="$emit('click')"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <!-- Priority label -->
    <div class="flex items-center gap-1.5 mb-2.5">
      <div :class="['h-1.5 w-1.5 rounded-full shrink-0', priorityDot]" />
      <span :class="['text-[10px] font-bold uppercase tracking-wider', priorityText]">{{ task.priority }}</span>
    </div>

    <!-- Title -->
    <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">{{ task.title }}</h4>

    <!-- Description snippet -->
    <p v-if="task.description" class="text-xs text-slate-400 dark:text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
      {{ task.description }}
    </p>

    <!-- Footer -->
    <div class="flex items-center justify-between mt-3">
      <div v-if="task.dueDate" class="flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
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
    description?: string
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

const priorityDot = computed(() => {
  const map: Record<string, string> = {
    LOW: 'bg-slate-400',
    MEDIUM: 'bg-sky-500',
    HIGH: 'bg-amber-500',
    URGENT: 'bg-rose-500',
  }
  return map[props.task.priority] ?? 'bg-slate-400'
})

const priorityText = computed(() => {
  const map: Record<string, string> = {
    LOW: 'text-slate-400',
    MEDIUM: 'text-sky-600 dark:text-sky-400',
    HIGH: 'text-amber-600 dark:text-amber-400',
    URGENT: 'text-rose-600 dark:text-rose-400',
  }
  return map[props.task.priority] ?? 'text-slate-400'
})

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
</script>
