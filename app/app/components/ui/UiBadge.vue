<template>
  <span
    :class="[
      'inline-flex items-center font-medium rounded-xl backdrop-blur-sm',
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
    default:   'bg-slate-800/80 dark:bg-white/[0.09] text-white dark:text-slate-100 border border-white/10 dark:border-white/[0.12]',
    secondary: 'bg-white/50 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-white/60 dark:border-white/[0.09]',
    success:   'bg-emerald-50/80 dark:bg-emerald-500/[0.15] text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/[0.25]',
    warning:   'bg-amber-50/80 dark:bg-amber-500/[0.15] text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/[0.25]',
    danger:    'bg-rose-50/80 dark:bg-rose-500/[0.15] text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/[0.25]',
    info:      'bg-primary-50/80 dark:bg-primary-500/[0.15] text-primary-700 dark:text-primary-400 border border-primary-200/60 dark:border-primary-500/[0.25]',
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
