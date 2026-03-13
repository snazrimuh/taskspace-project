<template>
  <div>
    <UiCard>
      <UiCardHeader>
        <div class="flex justify-center mb-3">
          <img src="/logo.png" alt="TaskSpace" class="h-12 w-12" />
        </div>
        <UiCardTitle class="text-xl text-center">Forgot Password</UiCardTitle>
        <p class="text-sm text-slate-500 text-center mt-1">Enter your email to receive a reset link.</p>
      </UiCardHeader>
      <UiCardContent>
        <form v-if="!sent" class="space-y-4" @submit.prevent="handleSend">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <UiInput
              v-model="email"
              type="email"
              placeholder="you@company.com"
            />
          </div>
          <div v-if="error" class="rounded-xl bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20 px-3.5 py-2.5 text-sm text-rose-700 dark:text-rose-400">
            {{ error }}
          </div>
          <UiButton class="w-full" size="lg" :loading="authStore.isLoading">
            Send Reset Link
          </UiButton>
        </form>

        <div v-else class="text-center space-y-4">
          <div class="h-12 w-12 bg-emerald-50/80 dark:bg-emerald-500/[0.12] border border-emerald-200/60 dark:border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg class="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-slate-700 font-medium">Check your email</p>
            <p class="text-sm text-slate-500 mt-1">We sent a reset link to {{ email }}</p>
          </div>
        </div>

        <div class="mt-6 text-center text-sm text-slate-500">
          <NuxtLink to="/login" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">
            Back to Sign in
          </NuxtLink>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()

const email = ref('')
const sent = ref(false)
const error = ref('')

const handleSend = async () => {
  error.value = ''
  try {
    await authStore.forgotPassword(email.value)
    sent.value = true
  } catch (err: any) {
    // The backend always returns success to avoid email enumeration,
    // so errors here indicate a network/server issue.
    error.value = err?.data?.message ?? err?.message ?? 'Something went wrong. Please try again.'
  }
}
</script>
