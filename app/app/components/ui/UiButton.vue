<template>
  <button
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#2A4A74]/50 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none',
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
    primary:   'bg-[#1F3F68] backdrop-blur-sm text-white border border-[#2A4A74]/85 hover:bg-[#173453] active:bg-[#10253A] shadow-[0_5px_14px_rgba(10,22,36,0.42)] hover:shadow-[0_8px_24px_rgba(10,22,36,0.52)] rounded-xl font-semibold',
    secondary: 'bg-white/38 dark:bg-white/[0.06] backdrop-blur-sm border border-[#415A77]/55 text-[#415A77] dark:text-[#E0E1DD] hover:bg-[rgba(65,90,119,0.10)] rounded-xl',
    outline:   'bg-transparent border border-[#415A77] text-[#415A77] dark:text-[#E0E1DD] hover:bg-[rgba(65,90,119,0.10)] rounded-xl',
    ghost:     'bg-transparent text-[#415A77] dark:text-[#E0E1DD] hover:bg-[rgba(65,90,119,0.15)] rounded-xl',
    danger:    'bg-[#B85C5C] backdrop-blur-sm text-white border border-[#934848]/85 hover:bg-[#934848] shadow-[0_3px_10px_rgba(106,47,47,0.30)] rounded-xl font-semibold',
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
