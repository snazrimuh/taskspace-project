<template>
  <UiCard
    class="rounded-2xl shadow-sm transition-all duration-200"
    :class="{ 'ring-2 ring-primary-400/50 bg-primary-50/30 dark:bg-primary-900/10': isDragOver }"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <UiCardHeader>
      <div class="flex items-center gap-2">
        <div :class="['h-2.5 w-2.5 rounded-full', color]" />
        <UiCardTitle class="text-sm">{{ title }}</UiCardTitle>
        <span class="text-xs text-slate-400 ml-auto">{{ tasks.length }}</span>
      </div>
    </UiCardHeader>
    <UiCardContent class="space-y-2 min-h-[120px]">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @click="$emit('taskClick', task)"
      />
      <div
        v-if="tasks.length === 0"
        class="text-center py-6 text-sm text-slate-400"
        :class="{ '!py-8 border-2 border-dashed border-primary-300/50 rounded-xl': isDragOver }"
      >
        {{ isDragOver ? 'Drop here' : 'No tasks' }}
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
interface Props {
  title: string
  status: string
  tasks: any[]
  color: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  taskClick: [task: any]
  statusChange: [taskId: string, newStatus: string]
}>()

const isDragOver = ref(false)
let dragLeaveTimeout: ReturnType<typeof setTimeout> | null = null

const onDragOver = () => {
  if (dragLeaveTimeout) { clearTimeout(dragLeaveTimeout); dragLeaveTimeout = null }
  isDragOver.value = true
}

const onDragLeave = () => {
  dragLeaveTimeout = setTimeout(() => { isDragOver.value = false }, 50)
}

const onDrop = (e: DragEvent) => {
  isDragOver.value = false
  const taskId = e.dataTransfer?.getData('text/plain')
  if (!taskId) return
  // Only emit if dropping into a different column
  const alreadyHere = props.tasks.some(t => t.id === taskId)
  if (!alreadyHere) {
    emit('statusChange', taskId, props.status)
  }
}
</script>
