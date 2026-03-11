<template>
  <div></div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const authStore = useAuthStore()
// Hydrate is handled by the 01.auth.client plugin before this runs
navigateTo(authStore.isLoggedIn ? '/dashboard' : '/login', { replace: true })
</script>
