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
    default:   'bg-[#333446] text-[#EAEFEF] border border-[#7F8CAA]/30 shadow-sm', 
    secondary: 'bg-[#EAEFEF] text-[#333446] border border-[#B8CFCE]/50',
    success:   'bg-[#B8CFCE] text-[#333446] border border-[#7F8CAA]/20 font-semibold',
    warning:   'bg-[#EAEFEF] text-[#7F8CAA] border border-[#7F8CAA]/40',
    danger:    'bg-[#333446] text-[#B8CFCE] border border-[#B8CFCE]/30 font-semibold',
    info:      'bg-[#7F8CAA]/20 text-[#333446] border border-[#7F8CAA]/30',
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
