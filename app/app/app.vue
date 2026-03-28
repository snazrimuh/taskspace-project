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
        <div class="startup-loader-content">
          <div class="logo-wrapper">
            <img src="/logo.png" alt="Task-Space" class="h-20 w-20" />
            <div class="logo-pulse"></div>
          </div>
          <h1 class="startup-loader-name">Task-<span class="text-primary-600">Space</span></h1>
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

.startup-loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  z-index: 10;
}

.logo-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-wrapper img {
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 10px 25px rgba(0,0,0,0.1));
}

.logo-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: #3b82f6;
  border-radius: 50%;
  opacity: 0.2;
  filter: blur(20px);
  animation: enterprise-pulse 2s infinite ease-in-out;
  z-index: 1;
}

.startup-loader-name {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #0f172a;
  margin: 0;
  opacity: 0;
  animation: fade-up 0.8s forwards 0.2s;
}

.dark .startup-loader-name {
  color: #f8fafc;
}

@keyframes enterprise-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.15; }
  50% { transform: translate(-50%, -50%) scale(1.4); opacity: 0.3; }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
