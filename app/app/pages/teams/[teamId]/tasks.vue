<script setup lang="ts">
const route = useRoute()

onMounted(() => {
  navigateTo(`/teams/${route.params.teamId}/projects`)
})
</script>

<template>
  <div class="text-sm text-slate-500">Redirecting to projects...</div>
</template>
