<template>
  <span
    :class="[
      'inline-flex items-center font-medium rounded-xl backdrop-blur-sm whitespace-nowrap',
      sizeClasses,
      variantClasses,
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'todo' | 'progress' | 'review' | 'done'
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'sm',
})

const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    default:   'bg-[#1B263B] text-white border border-[#0D1B2A]/70 shadow-sm',
    secondary: 'bg-[#778DA9] text-[#0D1B2A] border border-[#415A77]/60',
    success:   'bg-[#4F8F7B] text-white border border-[#3D7564]/80 font-semibold',
    warning:   'bg-[#C2A75C] text-[#1B263B] border border-[#9D874A]/80 font-semibold',
    danger:    'bg-[#B85C5C] text-white border border-[#934848]/85 font-semibold',
    info:      'bg-[#415A77] text-white border border-[#1B263B]/70',
    todo:      'bg-[#E0E1DD] text-[#1B263B] border border-[#778DA9]/40',
    progress:  'bg-[#778DA9] text-[#0D1B2A] border border-[#415A77]/35',
    review:    'bg-[#415A77] text-white border border-[#1B263B]/35',
    done:      'bg-[#1B263B] text-white border border-[#0D1B2A]/45',
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
