<template>
  <div>
    <UiCard>
      <UiCardHeader>
        <div class="flex justify-center mb-3">
          <img src="/logo.png" alt="TaskSpace" class="h-12 w-12" />
        </div>
        <UiCardTitle class="text-xl text-center">{{ t('reset.title') }}</UiCardTitle>
        <p class="text-sm text-slate-500 text-center mt-1">{{ t('reset.subtitle') }}</p>
      </UiCardHeader>
      <UiCardContent>
        <!-- Invalid / missing token state -->
        <div v-if="!token" class="text-center space-y-4">
          <p class="text-sm text-red-600">{{ t('reset.error.invalid') }}</p>
          <NuxtLink to="/forgot-password" class="text-sm text-[#415A77] dark:text-[#E0E1DD] hover:text-[#1B263B] dark:hover:text-white font-medium">
            {{ t('forgot.submit') }}
          </NuxtLink>
        </div>

        <!-- Success state -->
        <div v-else-if="success" class="text-center space-y-4">
          <div class="h-12 w-12 bg-emerald-50/80 dark:bg-emerald-500/[0.12] border border-emerald-200/60 dark:border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg class="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-sm text-slate-700 font-medium">{{ t('reset.success') }}</p>
          <NuxtLink to="/login" class="text-sm text-[#415A77] dark:text-[#E0E1DD] hover:text-[#1B263B] dark:hover:text-white font-medium">
            {{ t('nav.signin') }}
          </NuxtLink>
        </div>

        <!-- Reset form -->
        <form v-else class="space-y-4" @submit.prevent="handleReset">
          <div v-if="error" class="rounded-xl bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20 px-3.5 py-2.5 text-sm text-rose-700 dark:text-rose-400">
            {{ error }}
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('reset.password') }}</label>
            <UiInput
              v-model="newPassword"
              type="password"
              :placeholder="t('reset.password')"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('reset.confirm') }}</label>
            <UiInput
              v-model="confirmPassword"
              type="password"
              :placeholder="t('reset.confirm')"
              required
            />
          </div>
          <UiButton class="w-full !bg-[#1F3F68] !border-[#2A4A74]/85 hover:!bg-[#173453] active:!bg-[#10253A]" size="lg" :loading="isLoading">
            {{ t('reset.submit') }}
          </UiButton>
        </form>

        <div v-if="!success" class="mt-6 text-center text-sm text-slate-500">
          <NuxtLink to="/login" class="text-[#415A77] dark:text-[#E0E1DD] hover:text-[#1B263B] dark:hover:text-white font-medium">
            {{ t('reset.signin') }}
          </NuxtLink>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
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
