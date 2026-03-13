<template>
  <div
    v-bind="forwardedAttrs"
    :class="[
      'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow',
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
