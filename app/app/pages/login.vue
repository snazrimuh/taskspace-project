<template>
  <div class="glass rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.30)] px-8 py-10">
    <!-- Logo & brand -->
    <div class="flex flex-col items-center mb-7">
      <img src="/logo.png" alt="TaskSpace" class="h-14 w-14 rounded-2xl mb-4" />
      <p class="text-[11px] font-semibold tracking-[0.18em] text-slate-400 dark:text-slate-500 uppercase mb-1">TaskSpace</p>
      <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">Welcome Back</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to your workspace</p>
    </div>

    <form class="space-y-3.5" @submit.prevent="handleLogin">
      <div v-if="error" class="rounded-xl bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20 px-3.5 py-2.5 text-sm text-rose-700 dark:text-rose-400">
        {{ error }}
      </div>

      <!-- Email -->
      <div class="relative">
        <Mail class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
        <input
          v-model="email"
          type="email"
          placeholder="Email address"
          required
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/70 dark:border-white/[0.09] bg-white/40 dark:bg-white/[0.05] backdrop-blur-sm text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-400/50 dark:focus:border-primary-500/40 transition"
        />
      </div>

      <!-- Password -->
      <div class="relative">
        <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Password"
          required
          class="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/70 dark:border-white/[0.09] bg-white/40 dark:bg-white/[0.05] backdrop-blur-sm text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-400/50 dark:focus:border-primary-500/40 transition"
        />
        <button type="button" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" @click="showPassword = !showPassword">
          <EyeOff v-if="showPassword" class="h-4 w-4" />
          <Eye v-else class="h-4 w-4" />
        </button>
      </div>

      <!-- Forgot password -->
      <div class="flex justify-end">
        <NuxtLink to="/forgot-password" class="text-xs text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 font-medium transition-colors">
          Forgot Password?
        </NuxtLink>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="authStore.isLoading"
        class="w-full py-2.5 rounded-xl text-white font-semibold text-sm bg-primary-500/90 hover:bg-primary-600/90 border border-primary-400/40 shadow-[0_2px_8px_rgba(46,104,148,0.28)] hover:shadow-[0_4px_12px_rgba(46,104,148,0.38)] active:bg-primary-700/90 transition disabled:opacity-60 backdrop-blur-sm"
      >
        {{ authStore.isLoading ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
      Don't have an account?
      <NuxtLink to="/register" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">Sign up</NuxtLink>
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
