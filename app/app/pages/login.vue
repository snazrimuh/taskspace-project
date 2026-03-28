<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-8 text-center app-bg">
    <div class="startup-loader-panel">
      <img src="/logo.png" alt="Task-Space" class="h-16 w-16 mb-4" />
      <h1 class="text-2xl font-bold mb-2">Redirecting to Unified Portal...</h1>
      <p class="text-slate-500 max-w-sm">Local authentication is no longer active. You are being redirected to the unified login page.</p>

      <div class="mt-8 startup-loader-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const runtime = useRuntimeConfig()
const host = import.meta.client ? window.location.host : useRequestHeaders(['host']).host

onMounted(() => {
  window.setTimeout(() => {
    const redirect = encodeURIComponent(`https://${host}/`)
    window.location.href = `${runtime.public.hubUrl}/login?redirect=${redirect}`
  }, 800)
})
</script>

<style scoped>
.startup-loader-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 40px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 25px 55px rgba(13, 27, 42, 0.12);
  backdrop-filter: blur(16px);
}

.dark .startup-loader-panel {
  background: rgba(12, 18, 31, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.startup-loader-dots {
  display: flex;
  gap: 10px;
}

.startup-loader-dots span {
  width: 10px;
  height: 10px;
  border-radius: 99px;
  background: #415a77;
  animation: bounce 800ms infinite ease-in-out;
}

.startup-loader-dots span:nth-child(2) { animation-delay: 150ms; }
.startup-loader-dots span:nth-child(3) { animation-delay: 300ms; }

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-8px); opacity: 1; }
}
</style>
