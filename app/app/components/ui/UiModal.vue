<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          class="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md transition-opacity"
          @click="close"
        />
        <div
          :class="[
            'relative z-10 bg-white/80 dark:bg-surface-900/80 backdrop-blur-2xl border border-white/70 dark:border-white/[0.10] rounded-2xl shadow-2xl w-full mx-4 max-h-[90vh] overflow-y-auto',
            sizeClasses,
          ]"
        >
          <div v-if="title" class="flex items-center justify-between px-6 py-4 border-b border-white/60 dark:border-white/[0.07]">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h2>
            <button
              class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-white/50 dark:hover:bg-white/[0.08]"
              @click="close"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const close = () => emit('update:modelValue', false)

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }
  return sizes[props.size]
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
