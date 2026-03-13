<template>
  <div class="app-bg min-h-screen flex flex-col">
    <!-- Top bar -->
    <div class="flex items-center justify-between px-6 py-3 glass-bar">
      <div class="flex items-center gap-2.5">
        <img src="/logo.png" alt="TaskSpace" class="h-8 w-8 rounded-xl" />
        <span class="font-semibold text-slate-700 dark:text-slate-200 text-sm tracking-tight">TaskSpace</span>
      </div>
      <button
        class="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-white/[0.06] transition-colors"
        @click="toggleTheme"
      >
        <Sun v-if="isDark" class="h-4 w-4" />
        <Moon v-else class="h-4 w-4" />
      </button>
    </div>

    <!-- Card -->
    <div class="flex-1 flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
const { isDark, toggleTheme } = useTheme()
</script>
