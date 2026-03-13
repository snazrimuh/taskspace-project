<template>
  <div
    class="flex flex-col rounded-2xl p-3 transition-all duration-200 bg-slate-100 dark:bg-slate-800/40"
    :class="{ 'ring-2 ring-primary-400/60': isDragOver }"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <!-- Column Header -->
    <div class="flex items-center justify-between px-1 mb-3">
      <div class="flex items-center gap-2">
        <div :class="['h-2 w-2 rounded-full', color]" />
        <span class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{{ title }}</span>
      </div>
      <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full px-2 py-0.5 min-w-[22px] text-center">
        {{ tasks.length }}
      </span>
    </div>

    <!-- Task Cards -->
    <div class="space-y-2 min-h-[120px]">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @click="$emit('taskClick', task)"
      />
      <div
        v-if="tasks.length === 0"
        class="flex items-center justify-center py-7 text-xs text-slate-400 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 transition-colors"
        :class="{ '!border-primary-400/50 !text-primary-400 bg-primary-50 dark:bg-primary-900/10': isDragOver }"
      >
        {{ isDragOver ? 'Drop here' : 'No tasks' }}
      </div>
    </div>
  </div>
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
  const alreadyHere = props.tasks.some(t => t.id === taskId)
  if (!alreadyHere) {
    emit('statusChange', taskId, props.status)
  }
}
</script>
