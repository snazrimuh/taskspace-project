<template>
  <div>
    <UiCard>
      <UiCardHeader>
        <div class="flex justify-center mb-3">
          <img src="/logo.png" alt="TaskSpace" class="h-12 w-12" />
        </div>
        <UiCardTitle class="text-xl text-center">Reset Password</UiCardTitle>
        <p class="text-sm text-slate-500 text-center mt-1">Enter your new password below.</p>
      </UiCardHeader>
      <UiCardContent>
        <!-- Invalid / missing token state -->
        <div v-if="!token" class="text-center space-y-4">
          <p class="text-sm text-red-600">Invalid or missing reset token.</p>
          <NuxtLink to="/forgot-password" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Request a new link
          </NuxtLink>
        </div>

        <!-- Success state -->
        <div v-else-if="success" class="text-center space-y-4">
          <div class="h-12 w-12 bg-emerald-50/80 dark:bg-emerald-500/[0.12] border border-emerald-200/60 dark:border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg class="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-sm text-slate-700 font-medium">Password reset successfully!</p>
          <NuxtLink to="/login" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Sign in with your new password
          </NuxtLink>
        </div>

        <!-- Reset form -->
        <form v-else class="space-y-4" @submit.prevent="handleReset">
          <div v-if="error" class="rounded-xl bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20 px-3.5 py-2.5 text-sm text-rose-700 dark:text-rose-400">
            {{ error }}
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <UiInput
              v-model="newPassword"
              type="password"
              placeholder="Min. 8 characters"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <UiInput
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              required
            />
          </div>
          <UiButton class="w-full" size="lg" :loading="isLoading">
            Reset Password
          </UiButton>
        </form>

        <div v-if="!success" class="mt-6 text-center text-sm text-slate-500">
          <NuxtLink to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
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
const route = useRoute()

const token = computed(() => route.query.token as string | undefined)
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const success = ref(false)
const error = ref('')

const handleReset = async () => {
  error.value = ''
  if (!token.value) return
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  if (newPassword.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }
  isLoading.value = true
  try {
    await authStore.resetPassword(token.value, newPassword.value)
    success.value = true
  } catch (err: any) {
    error.value = err?.data?.message ?? err?.message ?? 'Invalid or expired reset token.'
  } finally {
    isLoading.value = false
  }
}
</script>
