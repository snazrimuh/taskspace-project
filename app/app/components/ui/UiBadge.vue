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
    default: 'bg-slate-900 dark:bg-primary-500/15 text-white dark:text-primary-400 dark:border dark:border-primary-500/20',
    secondary: 'bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-400 dark:border dark:border-slate-600/30',
    success: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 dark:border dark:border-emerald-500/20',
    warning: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 dark:border dark:border-amber-500/20',
    danger: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 dark:border dark:border-red-500/20',
    info: 'bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 dark:border dark:border-primary-500/20',
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
