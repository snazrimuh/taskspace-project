<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-2xl px-10 py-12 border border-slate-200 dark:border-slate-700">
    <!-- Logo & brand -->
    <div class="flex flex-col items-center mb-8">
      <img src="/logo.png" alt="TaskSpace" class="h-16 w-16 rounded-full border-2 border-slate-100 dark:border-slate-700 shadow-sm mb-4" />
      <p class="text-xs font-semibold tracking-[0.2em] text-slate-700 dark:text-slate-300 uppercase mb-1">TaskSpace</p>
      <h1 class="text-xl font-bold text-slate-900 dark:text-white">Team Collaboration Platform</h1>
      <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Sign in to access your workspace</p>
    </div>

    <form class="space-y-4" @submit.prevent="handleLogin">
      <div v-if="error" class="rounded-lg bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 px-4 py-3 text-sm text-red-700 dark:text-red-300">
        {{ error }}
      </div>

      <!-- Email -->
      <div class="relative">
        <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          v-model="email"
          type="email"
          placeholder="Enter your email"
          required
          class="w-full pl-9 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition"
        />
      </div>

      <!-- Password -->
      <div class="relative">
        <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Enter your password"
          required
          class="w-full pl-9 pr-10 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition"
        />
        <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" @click="showPassword = !showPassword">
          <EyeOff v-if="showPassword" class="h-4 w-4" />
          <Eye v-else class="h-4 w-4" />
        </button>
      </div>

      <!-- Forgot password -->
      <div class="flex justify-end">
        <NuxtLink to="/forgot-password" class="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-700 font-medium">
          Forgot Password?
        </NuxtLink>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="authStore.isLoading"
        class="w-full py-3 rounded-lg text-white font-semibold text-sm bg-slate-900 hover:bg-slate-800 active:bg-slate-950 transition disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600"
      >
        {{ authStore.isLoading ? 'Signing in...' : 'Login' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
      Don't have an account?
      <NuxtLink to="/register" class="text-slate-600 dark:text-slate-400 hover:text-slate-700 font-medium">Sign up</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  error.value = ''
  try {
    await authStore.login(email.value, password.value)
    await navigateTo('/dashboard')
  } catch (err: any) {
    error.value = err?.data?.message ?? err?.message ?? 'Invalid email or password'
  }
}
</script>
