<template>
  <div
    class="glass-subtle flex flex-col rounded-2xl p-3 transition-all duration-200"
    :class="{ 'ring-2 ring-primary-400/40 dark:ring-primary-500/30': isDragOver }"
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
      <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-white/[0.07] border border-white/70 dark:border-white/[0.10] rounded-full px-2 py-0.5 min-w-[22px] text-center backdrop-blur-sm">
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
        class="flex items-center justify-center py-7 text-xs text-slate-400 dark:text-slate-500 rounded-xl border-2 border-dashed border-white/50 dark:border-white/[0.08] transition-colors"
        :class="{ '!border-primary-400/40 !text-primary-500 dark:!text-primary-400 bg-primary-50/30 dark:bg-primary-900/10': isDragOver }"
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
  if (!props.tasks.some(t => t.id === taskId)) emit('statusChange', taskId, props.status)
}
</script>
