<template>
  <div>
    <UiCard>
      <UiCardHeader>
        <div class="flex justify-center mb-3">
          <img src="/logo.png" alt="TaskSpace" class="h-12 w-12" />
        </div>
        <UiCardTitle class="text-xl text-center">Welcome to TaskSpace!</UiCardTitle>
        <p class="text-sm text-slate-500 text-center mt-1">Let's get you started. What would you like to do?</p>
      </UiCardHeader>
      <UiCardContent>
        <div class="space-y-3">
          <!-- Create Team -->
          <button
            :class="[
              'w-full text-left rounded-2xl border-2 p-4 transition-colors',
              selected === 'create'
                ? 'border-primary-500 bg-primary-50/70 dark:border-primary-500/60 dark:bg-primary-500/[0.08]'
                : 'border-white/60 dark:border-white/[0.09] hover:border-primary-300/60 dark:hover:border-primary-500/30',
            ]"
            @click="selected = 'create'"
          >
            <div class="flex items-start gap-3">
              <div class="h-10 w-10 rounded-xl bg-primary-500/90 text-white flex items-center justify-center shrink-0">
                <Plus class="h-5 w-5" />
              </div>
              <div>
                <div class="font-semibold text-slate-900">Create a new team</div>
                <p class="text-sm text-slate-500 mt-0.5">Start a workspace and invite your team members.</p>
              </div>
            </div>
          </button>

          <!-- Join Team -->
          <button
            :class="[
              'w-full text-left rounded-2xl border-2 p-4 transition-colors',
              selected === 'join'
                ? 'border-primary-500 bg-primary-50/70 dark:border-primary-500/60 dark:bg-primary-500/[0.08]'
                : 'border-white/60 dark:border-white/[0.09] hover:border-primary-300/60 dark:hover:border-primary-500/30',
            ]"
            @click="selected = 'join'"
          >
            <div class="flex items-start gap-3">
              <div class="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <UserPlus class="h-5 w-5" />
              </div>
              <div>
                <div class="font-semibold text-slate-900">Join an existing team</div>
                <p class="text-sm text-slate-500 mt-0.5">Accept an invitation to join a team workspace.</p>
              </div>
            </div>
          </button>
        </div>

        <!-- Create Team Form -->
        <Transition name="fade">
          <form
            v-if="selected === 'create'"
            class="mt-4 space-y-3 border-t border-white/50 dark:border-white/[0.07] pt-4"
            @submit.prevent="handleCreateTeam"
          >
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
              <UiInput v-model="teamName" placeholder="e.g. Engineering Team" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
              <UiTextarea v-model="teamDescription" placeholder="What does this team do?" :rows="2" />
            </div>
            <UiButton class="w-full" size="lg" :loading="isLoading">
              Create Team
            </UiButton>
          </form>
        </Transition>

        <!-- Join Team Info -->
        <Transition name="fade">
          <div v-if="selected === 'join'" class="mt-4 border-t border-white/50 dark:border-white/[0.07] pt-4">
            <div class="text-center space-y-3">
              <div class="text-sm text-slate-600">
                Check your notifications or email for a team invitation.
              </div>
              <UiButton variant="secondary" class="w-full" @click="navigateTo('/dashboard')">
                Go to Dashboard
              </UiButton>
            </div>
          </div>
        </Transition>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { Plus, UserPlus } from 'lucide-vue-next'

definePageMeta({ layout: 'auth' })

const selected = ref<'create' | 'join' | null>(null)
const teamName = ref('')
const teamDescription = ref('')
const isLoading = ref(false)

const handleCreateTeam = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    navigateTo('/teams/t1')
  }, 1000)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
