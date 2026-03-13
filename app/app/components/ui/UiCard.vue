<template>
  <div
    v-bind="forwardedAttrs"
    :class="[
      'bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/30 rounded-2xl shadow-sm glow-card',
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
