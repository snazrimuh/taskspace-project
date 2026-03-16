<template>
  <div>
    <NuxtLayout>
      <NuxtPage :keepalive="{ max: 5, exclude: ['teams-teamId-chat'] }" />
    </NuxtLayout>

    <Transition name="startup-loader-fade">
      <div
        v-if="showStartupLoader"
        class="fixed inset-0 z-[120] flex items-center justify-center app-bg"
      >
        <div class="startup-loader-panel">
          <img src="/logo.png" alt="TaskSpace" class="h-14 w-14" />
          <p class="startup-loader-title">TaskSpace</p>
          <div class="startup-loader-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { initTheme } = useTheme()
const showStartupLoader = ref(true)

onMounted(() => {
  initTheme()

  window.setTimeout(() => {
    showStartupLoader.value = false
  }, 1000)
})
</script>

<style scoped>
.startup-loader-fade-enter-active,
.startup-loader-fade-leave-active {
  transition: opacity 320ms ease;
}

.startup-loader-fade-enter-from,
.startup-loader-fade-leave-to {
  opacity: 0;
}

.startup-loader-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 22px 26px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: 0 20px 45px rgba(13, 27, 42, 0.16);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.dark .startup-loader-panel {
  background: rgba(12, 18, 31, 0.74);
  border: 1px solid rgba(255, 255, 255, 0.13);
  box-shadow: 0 24px 52px rgba(0, 0, 0, 0.45);
}

.startup-loader-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #1b263b;
}

.dark .startup-loader-title {
  color: #e0e1dd;
}

.startup-loader-dots {
  display: flex;
  align-items: center;
  gap: 8px;
}

.startup-loader-dots span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #415a77;
  animation: startup-bounce 900ms infinite ease-in-out;
}

.startup-loader-dots span:nth-child(2) {
  animation-delay: 140ms;
}

.startup-loader-dots span:nth-child(3) {
  animation-delay: 280ms;
}

.dark .startup-loader-dots span {
  background: #778da9;
}

@keyframes startup-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-6px);
    opacity: 1;
  }
}
</style>
