<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div class="relative overflow-hidden bg-[linear-gradient(135deg,rgba(219,236,255,0.75)_0%,rgba(186,215,248,0.55)_40%,rgba(162,200,238,0.45)_100%)] dark:bg-[linear-gradient(135deg,#1B263B_0%,#111827_100%)] rounded-3xl p-6 md:p-8 text-[#1C3C62] dark:text-white mb-8 shadow-[0_8px_32px_rgba(42,74,116,0.12)] dark:shadow-xl border border-white/70 dark:border-white/5 backdrop-blur-xl ring-1 ring-[#7EB8E5]/20 dark:ring-0">
      <!-- Glass shimmer overlays (light mode only) -->
      <div class="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent dark:opacity-0 rounded-3xl pointer-events-none"></div>
      <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:opacity-0 rounded-t-3xl pointer-events-none"></div>
      <div class="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          <div class="p-3.5 bg-[#2A4A74]/15 dark:bg-white/10 rounded-2xl border border-[#2A4A74]/20 dark:border-white/10">
             <UserCog class="w-8 h-8 text-[#1C3C62] dark:text-white" />
          </div>
          <div>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p class="text-[#2A4A74]/70 dark:text-slate-300 mt-1 flex items-center gap-2">
              <span class="text-sm opacity-80">Manage your account settings and preferences.</span>
            </p>
          </div>
        </div>
      </div>
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
          <form class="space-y-5" @submit.prevent="handleUpdate">
            <!-- Avatar Picker -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Choose Avatar (Page {{ currentPage }} of {{ totalPages }})</label>
                <div class="flex items-center gap-2">
                   <UiButton 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    :disabled="currentPage === 1"
                    @click="currentPage--"
                    class="h-8 w-8 p-0"
                   >
                     <ChevronLeft class="w-4 h-4" />
                   </UiButton>
                   <UiButton 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    :disabled="currentPage === totalPages"
                    @click="currentPage++"
                    class="h-8 w-8 p-0"
                   >
                     <ChevronRight class="w-4 h-4" />
                   </UiButton>
                </div>
              </div>
              
              <!-- 5x2 Grid (Compact, No labels) -->
              <div class="grid grid-cols-5 gap-4 p-1">
                <button
                  v-for="avatar in paginatedAvatars"
                  :key="avatar.id"
                  type="button"
                  class="flex flex-col items-center justify-center p-1.5 rounded-2xl border transition-all duration-300 group aspect-square"
                  :class="selectedAvatarId === avatar.id
                    ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-500/[0.10] shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-2 ring-primary-400/20'
                    : 'border-white/60 dark:border-white/[0.05] hover:border-primary-300/60 dark:hover:border-primary-500/30 hover:bg-white/50 dark:hover:bg-white/[0.02] shadow-sm'"
                  @click="selectAvatar(avatar)"
                >
                  <div class="relative w-full h-full flex items-center justify-center">
                    <img :src="avatar.url" class="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 transition-transform group-hover:scale-110 shadow-sm" loading="lazy" />
                    <div v-if="selectedAvatarId === avatar.id" class="absolute -right-0.5 -bottom-0.5 bg-primary-500 text-white rounded-full p-1 border-2 border-white dark:border-slate-900 shadow-sm z-10">
                      <Check class="w-2.5 h-2.5" />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div class="pt-2">
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

    </div>
  </div>
</template>

<script setup lang="ts">
import { UserCog, ChevronLeft, ChevronRight, Check } from 'lucide-vue-next'
const authStore = useAuthStore()
const api = useApi()

// ── Profile state ──────────────────────────────────────────────────────
const profile = ref<any>(null)
const isLoadingProfile = ref(false)

const form = reactive({ name: '', bio: '', avatar: '', avatarStyle: 'avataaars' })
const isSaving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

// Avatar URL builder
const B = 'https://api.dicebear.com/9.x/avataaars/svg'
const a = (p: string, bg = 'b6e3f4') => `${B}?${p}&style=circle&backgroundColor=${bg}`

// Constants for generation
const tops = ['shortFlat', 'shortWaved', 'theCaesarAndSidePart', 'shortCurly', 'shortRound', 'sides', 'theCaesar', 'longButNotTooLong', 'straight01', 'bob', 'curvy', 'straight02', 'straightAndStrand', 'bun', 'hijab']
const clothings = ['blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'shirtCrewNeck', 'shirtVNeck']
const clothesColors = ['262e33', '3c4f5c', '25557c', '929598', 'ffffff', 'e6e6e6', 'ff5c5c', '5199e4', 'a55728', 'd6b370']
const skins = ['ffdbb4', 'edb98a', 'd08b5b', 'ae5d29', '614335']
const bgs = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']

// Generate 100 curated variations
const avatarOptions = Array.from({ length: 100 }, (_, i) => {
  const top = tops[i % tops.length]
  const clothing = clothings[Math.floor(i / 2) % clothings.length]
  const color = clothesColors[Math.floor(i / 3) % clothesColors.length]
  const skin = skins[Math.floor(i / 5) % skins.length]
  const bg = bgs[Math.floor(i / 7) % bgs.length]
  
  // Professional params: normal expressions, varied professional colors
  const params = `top=${top}&clothing=${clothing}&clothesColor=${color}&skinColor=${skin}&eyes=default&eyebrows=defaultNatural&mouth=smile&facialHairProbability=0&accessoriesProbability=${i % 4 === 0 ? 100 : 0}&accessories=prescription01`
  
  return {
    id: `av-${i}`,
    url: a(params, bg)
  }
})

// ── Pagination ────────────────────────────────────────────────────────
const currentPage = ref(1)
const pageSize = 10
const totalPages = Math.ceil(avatarOptions.length / pageSize)

const paginatedAvatars = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return avatarOptions.slice(start, start + pageSize)
})

const selectedAvatarId = ref('av-0')

const selectAvatar = (avatar: typeof avatarOptions[0]) => {
  selectedAvatarId.value = avatar.id
  form.avatar = avatar.url
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
    
    if (form.avatar) {
      const match = avatarOptions.find(a => form.avatar === a.url)
      if (match) {
        selectedAvatarId.value = match.id
        const index = avatarOptions.indexOf(match)
        currentPage.value = Math.floor(index / pageSize) + 1
      }
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

const handleUpdate = async () => {
  saveError.value = ''
  saveSuccess.value = false
  isSaving.value = true
  try {
    const selectedAvatar = avatarOptions.find(a => a.id === selectedAvatarId.value)
    const finalAvatar = form.avatar || selectedAvatar?.url || ''
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
</script>
