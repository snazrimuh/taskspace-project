<template>
  <div
    :class="[
      'relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 ring-2 ring-white dark:ring-surface-900',
      sizeClasses,
    ]"
  >
    <img
      v-if="showImage"
      :src="normalizedSrc"
      :alt="alt"
      class="h-full w-full object-cover"
    />
    <span
      v-else-if="characterAvatar"
      :class="['font-medium text-slate-700 dark:text-slate-100 leading-none', textSizeClasses]"
    >
      {{ characterAvatar }}
    </span>
    <span
      v-else
      :class="['font-semibold text-slate-600 dark:text-slate-200 uppercase leading-none', textSizeClasses]"
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

const normalizedSrc = computed(() => (props.src || '').trim())

// Allow any non-empty string as src, assuming data integrity from backend
const isImageSrc = computed(() => normalizedSrc.value.length > 0)

const showImage = computed(() => isImageSrc.value)

const characterAvatar = computed(() => {
  // Only show first char if it's explicitly NOT an image source (fallback logic removed for simplicity, trust src)
  // Actually, if we want to support 'A' as src for character avatar, we need a way to distinguish.
  // But standard usage seems to be separate props: name vs src.
  // If src is provided, treat as image.
  return ''
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
    sm: characterAvatar.value ? 'text-sm' : 'text-xs',
    md: characterAvatar.value ? 'text-base' : 'text-sm',
    lg: characterAvatar.value ? 'text-xl' : 'text-base',
  }
  return sizes[props.size]
})
</script>
