<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Profile</h1>
      <p class="text-sm text-slate-500 mt-1">Manage your account settings.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Card -->
      <UiCard class="lg:col-span-1">
        <UiCardContent class="pt-6 text-center">
          <UiAvatar :name="profile?.name || authStore.user?.name || 'U'" size="lg" class="mx-auto" />
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-3">{{ profile?.name || authStore.user?.name }}</h3>
          <p class="text-sm text-slate-500">{{ profile?.email || authStore.user?.email }}</p>
          <p class="text-sm text-slate-500 mt-2">{{ profile?.bio }}</p>
          <div class="mt-4 pt-4 border-t text-sm text-slate-400">
            Joined {{ joinedAt }}
          </div>
        </UiCardContent>
      </UiCard>

      <!-- Edit Form -->
      <UiCard class="lg:col-span-2">
        <UiCardHeader>
          <UiCardTitle>Edit Profile</UiCardTitle>
        </UiCardHeader>
        <UiCardContent>
          <form class="space-y-4" @submit.prevent="handleUpdate">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <UiInput v-model="form.name" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
              <UiTextarea v-model="form.bio" placeholder="Tell us about yourself" :rows="3" />
            </div>
            <p v-if="saveError" class="text-sm text-red-600 dark:text-red-400">{{ saveError }}</p>
            <p v-if="saveSuccess" class="text-sm text-emerald-600 dark:text-emerald-400">Profile updated successfully!</p>
            <div class="flex justify-end">
              <UiButton :disabled="isSaving">{{ isSaving ? 'Saving...' : 'Save Changes' }}</UiButton>
            </div>
          </form>
        </UiCardContent>
      </UiCard>

      <!-- Change Password -->
      <UiCard class="lg:col-span-3">
        <UiCardHeader>
          <UiCardTitle>Change Password</UiCardTitle>
        </UiCardHeader>
        <UiCardContent>
          <form class="space-y-4 max-w-md" @submit.prevent="handlePasswordChange">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
              <UiInput v-model="pwForm.currentPassword" type="password" placeholder="Enter current password" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <UiInput v-model="pwForm.newPassword" type="password" placeholder="Min. 8 characters" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <UiInput v-model="pwForm.confirmPassword" type="password" placeholder="Confirm your new password" />
            </div>
            <p v-if="pwError" class="text-sm text-red-600 dark:text-red-400">{{ pwError }}</p>
            <p v-if="pwSuccess" class="text-sm text-emerald-600 dark:text-emerald-400">Password updated successfully!</p>
            <div class="flex justify-end">
              <UiButton :disabled="isSavingPw">{{ isSavingPw ? 'Updating...' : 'Update Password' }}</UiButton>
            </div>
          </form>
        </UiCardContent>
      </UiCard>

      <!-- Logout Section -->
      <UiCard class="lg:col-span-3 border-red-200/60 dark:border-red-500/15">
        <UiCardHeader>
          <UiCardTitle class="text-red-600 dark:text-red-400">Logout</UiCardTitle>
        </UiCardHeader>
        <UiCardContent>
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Sign out of your account. You'll need to log in again to access TaskSpace.</p>
          <UiButton variant="danger" :disabled="isLoggingOut" @click="handleLogout">
            {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
          </UiButton>
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const api = useApi()

// ── Profile state ──────────────────────────────────────────────────────
const profile = ref<any>(null)
const isLoadingProfile = ref(false)

const form = reactive({ name: '', bio: '' })
const isSaving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

// ── Password state ─────────────────────────────────────────────────────
const pwForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const isSavingPw = ref(false)
const pwSuccess = ref(false)
const pwError = ref('')

// ── Fetch ──────────────────────────────────────────────────────────────
const fetchProfile = async () => {
  isLoadingProfile.value = true
  try {
    const res = await api.get<{ success: boolean; data: any }>('/users/me')
    profile.value = res.data
    form.name = res.data.name ?? ''
    form.bio = res.data.bio ?? ''
  } finally {
    isLoadingProfile.value = false
  }
}

onMounted(fetchProfile)

const joinedAt = computed(() => {
  if (!profile.value?.createdAt) return ''
  return new Date(profile.value.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

// ── Update profile ─────────────────────────────────────────────────────
const handleUpdate = async () => {
  saveError.value = ''
  saveSuccess.value = false
  isSaving.value = true
  try {
    const res = await api.patch<{ success: boolean; data: any }>('/users/me', {
      name: form.name.trim(),
      bio: form.bio.trim() || undefined,
    })
    profile.value = { ...profile.value, ...res.data }
    // Sync auth store
    if (authStore.user) {
      authStore.user.name = res.data.name
    }
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (err: any) {
    saveError.value = err?.data?.message ?? 'Failed to save changes'
  } finally {
    isSaving.value = false
  }
}

// ── Change password ────────────────────────────────────────────────────
const handlePasswordChange = async () => {
  pwError.value = ''
  pwSuccess.value = false
  if (pwForm.newPassword !== pwForm.confirmPassword) {
    pwError.value = 'New passwords do not match'
    return
  }
  if (pwForm.newPassword.length < 8) {
    pwError.value = 'New password must be at least 8 characters'
    return
  }
  isSavingPw.value = true
  try {
    await api.patch('/users/me/password', {
      currentPassword: pwForm.currentPassword,
      newPassword: pwForm.newPassword,
    })
    Object.assign(pwForm, { currentPassword: '', newPassword: '', confirmPassword: '' })
    pwSuccess.value = true
    setTimeout(() => { pwSuccess.value = false }, 3000)
  } catch (err: any) {
    pwError.value = err?.data?.message ?? 'Failed to update password'
  } finally {
    isSavingPw.value = false
  }
}

// ── Logout ────────────────────────────────────────────────────────────
const isLoggingOut = ref(false)

const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    await api.post('/auth/logout')
  } catch (err) {
    // Continue logout even if API fails
  } finally {
    // Clear auth state
    authStore.logout()
    await navigateTo('/login')
  }
}
</script>
