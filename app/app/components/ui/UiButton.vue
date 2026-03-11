<template>
  <button
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
      sizeClasses,
      variantClasses,
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
})

const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-400 dark:hover:bg-primary-300 rounded-xl shadow-sm font-semibold',
    secondary: 'bg-slate-100 dark:bg-slate-800/70 text-slate-900 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/70 rounded-xl',
    outline: 'border border-slate-300 dark:border-slate-600/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl',
    ghost: 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200 rounded-xl',
    danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500/90 dark:hover:bg-red-400 rounded-xl shadow-sm',
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  }
  return sizes[props.size]
})
</script>
