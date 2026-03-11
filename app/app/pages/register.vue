<template>
  <div class="bg-white dark:bg-[#161b22] rounded-2xl shadow-lg dark:shadow-2xl px-10 py-12 border border-slate-100 dark:border-slate-700/50">
    <!-- Logo & brand -->
    <div class="flex flex-col items-center mb-8">
      <img src="/logo.png" alt="TaskSpace" class="h-16 w-16 rounded-full border-2 border-slate-100 dark:border-slate-700 shadow-sm mb-4" />
      <p class="text-xs font-semibold tracking-[0.2em] text-primary-600 dark:text-primary-400 uppercase mb-1">TaskSpace</p>
      <h1 class="text-xl font-bold text-slate-900 dark:text-white">Create Your Account</h1>
      <p class="text-sm text-slate-400 dark:text-slate-500 mt-1">Join your team on TaskSpace</p>
    </div>

    <form class="space-y-4" @submit.prevent="handleRegister">
      <div v-if="error" class="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
        {{ error }}
      </div>

      <!-- Name -->
      <div class="relative">
        <UserRound class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          v-model="name"
          type="text"
          placeholder="Your full name"
          required
          class="w-full pl-9 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
        />
      </div>

      <!-- Email -->
      <div class="relative">
        <Mail class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          v-model="email"
          type="email"
          placeholder="Enter your email"
          required
          class="w-full pl-9 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
        />
      </div>

      <!-- Password -->
      <div class="relative">
        <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Min. 8 characters"
          required
          class="w-full pl-9 pr-10 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
        />
        <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" @click="showPassword = !showPassword">
          <EyeOff v-if="showPassword" class="h-4 w-4" />
          <Eye v-else class="h-4 w-4" />
        </button>
      </div>

      <!-- Confirm Password -->
      <div class="relative">
        <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          v-model="confirmPassword"
          :type="showConfirm ? 'text' : 'password'"
          placeholder="Confirm your password"
          required
          class="w-full pl-9 pr-10 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
        />
        <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" @click="showConfirm = !showConfirm">
          <EyeOff v-if="showConfirm" class="h-4 w-4" />
          <Eye v-else class="h-4 w-4" />
        </button>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="authStore.isLoading"
        class="w-full py-3 rounded-lg text-white font-semibold text-sm bg-gradient-to-r from-primary-400 to-primary-600 hover:opacity-90 active:opacity-80 transition disabled:opacity-60"
      >
        {{ authStore.isLoading ? 'Creating account...' : 'Create Account' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
      Already have an account?
      <NuxtLink to="/login" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">Sign in</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { UserRound, Mail, Lock, Eye, EyeOff } from 'lucide-vue-next'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)

const handleRegister = async () => {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }
  try {
    await authStore.register(name.value, email.value, password.value)
    await navigateTo('/onboarding')
  } catch (err: any) {
    error.value = err?.data?.message ?? err?.message ?? 'Registration failed. Please try again.'
  }
}
</script>
