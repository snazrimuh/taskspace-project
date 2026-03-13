<template>
  <span
    :class="[
      'inline-flex items-center font-medium rounded-xl',
      sizeClasses,
      variantClasses,
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'sm',
})

const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    default: 'bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100 dark:border dark:border-slate-600',
    secondary: 'bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 dark:border dark:border-slate-500',
    success: 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 dark:border dark:border-slate-600',
    warning: 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 dark:border dark:border-slate-600',
    danger: 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 dark:border dark:border-slate-600',
    info: 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 dark:border dark:border-slate-600',
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }
  return sizes[props.size]
})
</script>
