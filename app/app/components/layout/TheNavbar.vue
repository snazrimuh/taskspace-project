<template>
  <header class="h-14 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-6 sticky top-0 z-20">
    <!-- Left: Mobile menu + breadcrumb -->
    <div class="flex items-center gap-3">
      <button
        class="md:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        @click="$emit('toggleSidebar')"
      >
        <Menu class="h-5 w-5" />
      </button>
      <div class="text-sm">
        <span v-if="teamName" class="font-semibold text-slate-700 dark:text-slate-300">{{ teamName }}</span>
        <span v-if="teamName && pageTitle" class="text-slate-400 dark:text-slate-600 mx-1.5">·</span>
        <span class="text-slate-500 dark:text-slate-400">{{ pageTitle }}</span>
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-1">
      <!-- Dark Mode Toggle -->
      <button
        class="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleTheme"
      >
        <Moon v-if="!isDark" class="h-4.5 w-4.5" />
        <Sun v-else class="h-4.5 w-4.5" />
      </button>

      <!-- Notifications -->
      <button class="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
        <Bell class="h-4.5 w-4.5" />
        <span
          v-if="unreadCount > 0"
          class="absolute top-1 right-1 h-4 min-w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </button>

      <!-- Settings (Manager only) -->
      <NuxtLink
        v-if="isManager && teamId"
        :to="`/teams/${teamId}/settings`"
        class="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
      >
        <Settings class="h-4.5 w-4.5" />
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Bell, Menu, Settings, Moon, Sun } from 'lucide-vue-next'

interface Props {
  teamName?: string
  teamId?: string
  pageTitle?: string
  isManager?: boolean
}

withDefaults(defineProps<Props>(), {
  teamName: '',
  teamId: '',
  pageTitle: '',
  isManager: true,
})

defineEmits<{
  toggleSidebar: []
}>()

const { isDark, toggleTheme } = useTheme()
const unreadCount = ref(3)
</script>
