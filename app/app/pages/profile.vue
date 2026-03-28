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
          <UiAvatar
            :name="profile?.name || authStore.user?.name || 'U'"
            :src="profile?.avatar || authStore.user?.avatar || ''"
            size="lg"
            class="mx-auto"
          />
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-3">{{ profile?.name || authStore.user?.name }}</h3>
          <p class="text-sm text-slate-500">{{ profile?.email || authStore.user?.email }}</p>
          <p class="text-sm text-slate-500 mt-2">{{ profile?.bio }}</p>
          <div class="mt-4 pt-4 border-t border-white/60 dark:border-white/[0.07] text-sm text-slate-400">
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
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Avatar Style</label>
              <div class="mb-3">
                <div class="grid grid-cols-4 gap-2">
                  <button
                    v-for="style in avatarStyles"
                    :key="style"
                    type="button"
                    class="flex flex-col items-center gap-1 p-2 rounded-lg border transition-all hover:shadow-sm"
                    :class="form.avatarStyle === style ? 'border-primary-400 bg-primary-50/70 dark:bg-primary-500/[0.10] dark:border-primary-400/60' : 'border-white/70 dark:border-white/[0.09] hover:border-primary-300/60 dark:hover:border-primary-500/30'"
                    @click="form.avatarStyle = style; updateAvatarPreview()"
                  >
                    <img :src="getAvatarUrl(profile?.name || 'User', style)" :alt="style" class="h-8 w-8 rounded-full" />
                    <span class="text-xs text-slate-600 dark:text-slate-400 capitalize">{{ style }}</span>
                  </button>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <UiInput v-model="form.avatarUrl" placeholder="Or paste custom avatar URL" type="url" />
                <UiButton type="button" variant="outline" @click="form.avatarUrl = ''">Clear</UiButton>
              </div>
              <p class="text-xs text-slate-500 mt-1">Choose a style or paste a custom image URL. Avatar is auto-generated from your name.</p>
            </div>
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

      <!-- Back to Portal Section -->
      <UiCard class="lg:col-span-3 border-sky-200/60 dark:border-sky-500/15">
        <UiCardHeader>
          <UiCardTitle class="text-sky-600 dark:text-sky-400">Kembali ke Portal</UiCardTitle>
        </UiCardHeader>
        <UiCardContent>
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Kembali ke Portal Hub untuk berpindah aplikasi tanpa logout.</p>
          <UiButton :disabled="isRedirecting" @click="handleBackToPortal">
            {{ isRedirecting ? 'Membuka portal...' : 'Buka Portal Hub' }}
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

const form = reactive({ name: '', bio: '', avatar: '', avatarStyle: 'avataaars', avatarUrl: '' })
const isSaving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')
const avatarStyles = [
  'avataaars', 'bottts', 'personas', 'lorelei', 'pixel-art', 'thumbs',
  'adventurer', 'bigears', 'croodles', 'fun-emoji', 'identicon', 'jdenticon',
  'micah', 'miniavs', 'notionists', 'pixelartxy', 'rings', 'shapes'
]

const getAvatarUrl = (name: string, style: string) => {
  const seed = name.replace(/\s+/g, '').toLowerCase()
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&scale=80`
}

const updateAvatarPreview = () => {
  if (!form.avatarUrl) {
    form.avatar = getAvatarUrl(profile.value?.name || 'User', form.avatarStyle)
  }
}

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
    form.avatar = res.data.avatar ?? ''
    // Parse avatar URL to detect style if DiceBear URL
    if (form.avatar?.includes('api.dicebear.com')) {
      const match = form.avatar.match(/\/(avataaars|bottts|personas|lorelei|pixel-art|thumbs|adventurer|bigears|croodles|fun-emoji|identicon|jdenticon|micah|miniavs|notionists|pixelartxy|rings|shapes)\//)
      if (match?.[1]) form.avatarStyle = match[1]
    } else if (form.avatar && !form.avatar.startsWith('http')) {
      form.avatarUrl = form.avatar
      form.avatar = ''
    }
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
    const finalAvatar = form.avatarUrl?.trim() || getAvatarUrl(form.name.trim(), form.avatarStyle)
    const res = await api.patch<{ success: boolean; data: any }>('/users/me', {
      name: form.name.trim(),
      bio: form.bio.trim() || undefined,
      avatar: finalAvatar || undefined,
    })
    profile.value = { ...profile.value, ...res.data }
    authStore.updateProfile({
      name: res.data.name,
      bio: res.data.bio,
      avatar: res.data.avatar,
    })
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

// ── Back to portal ─────────────────────────────────────────────────────
const isRedirecting = ref(false)
const runtime = useRuntimeConfig()

const handleBackToPortal = async () => {
  isRedirecting.value = true
  await navigateTo(runtime.public.hubUrl, { external: true })
}
</script>
