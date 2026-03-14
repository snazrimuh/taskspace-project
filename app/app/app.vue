<template>
  <NuxtLayout>
    <NuxtPage :keepalive="{ max: 5, exclude: ['teams-teamId-chat'] }" />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { initTheme } = useTheme()
onMounted(() => {
  initTheme()
})
</script>
