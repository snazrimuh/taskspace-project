<template>
  <div class="min-h-screen bg-[#f0f2f5] dark:bg-[#0d1117] flex flex-col transition-colors duration-200">
    <!-- Top bar -->
    <div class="flex items-center justify-between px-6 py-3 border-b border-slate-200/60 dark:border-slate-700/60">
      <div class="flex items-center gap-2.5">
        <img src="/logo.png" alt="TaskSpace" class="h-9 w-9 rounded-xl" />
        <span class="font-semibold text-slate-700 dark:text-slate-200 text-sm">TaskSpace</span>
      </div>
      <button
        class="p-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        @click="toggleTheme"
      >
        <Sun v-if="isDark" class="h-4 w-4" />
        <Moon v-else class="h-4 w-4" />
      </button>
    </div>

    <!-- Card -->
    <div class="flex-1 flex items-center justify-center px-4 py-8">
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
