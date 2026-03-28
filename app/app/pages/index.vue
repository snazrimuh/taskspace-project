<template>
  <div></div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const authStore = useAuthStore()
const runtime = useRuntimeConfig()
const host = import.meta.client ? window.location.host : useRequestHeaders(['host']).host

if (!authStore.isSessionChecked) {
  await Promise.race([
    authStore.validateSession(),
    new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), 5000)
    }),
  ])
}

if (authStore.isLoggedIn) {
  navigateTo('/dashboard', { replace: true })
} else {
  navigateTo(runtime.public.hubUrl, { external: true })
}
</script>
