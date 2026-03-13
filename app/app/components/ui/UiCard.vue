<template>
  <div
    v-bind="forwardedAttrs"
    :class="[
      'glass rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.25)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.09)] dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition-shadow',
      attrs.class,
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
const attrs = useAttrs()

const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>
