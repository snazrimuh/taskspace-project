<template>
  <button
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-900/30 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none',
      sizeClasses,
      variantClasses,
    ]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <svg v-if="loading" class="animate-spin -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
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
    primary:   'bg-primary-950 backdrop-blur-sm text-white border border-primary-900/45 hover:bg-primary-900 shadow-[0_2px_10px_rgba(10,20,38,0.35)] hover:shadow-[0_4px_14px_rgba(10,20,38,0.45)] rounded-xl font-semibold',
    secondary: 'bg-white/50 dark:bg-white/[0.07] backdrop-blur-sm border border-white/60 dark:border-white/[0.10] text-slate-700 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-white/[0.11] rounded-xl',
    outline:   'bg-transparent border border-slate-300/80 dark:border-white/[0.12] text-slate-700 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/[0.06] rounded-xl',
    ghost:     'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-slate-100 rounded-xl',
    danger:    'bg-rose-500/85 backdrop-blur-sm text-white border border-rose-400/30 hover:bg-rose-600/90 shadow-[0_2px_8px_rgba(244,63,94,0.25)] rounded-xl font-semibold',
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
