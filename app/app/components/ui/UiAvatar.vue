<template>
  <div
    :class="[
      'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 ring-2 ring-white dark:ring-surface-900',
      sizeClasses,
    ]"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="h-full w-full object-cover"
    />
    <span
      v-else
      :class="['font-semibold text-slate-600 dark:text-slate-200 uppercase', textSizeClasses]"
    >
      {{ initials }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  alt: '',
  name: '',
  size: 'md',
})

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }
  return sizes[props.size]
})

const textSizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }
  return sizes[props.size]
})
</script>
