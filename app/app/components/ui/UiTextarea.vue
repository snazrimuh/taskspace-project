<template>
  <textarea
    :class="[
      'w-full rounded-xl border border-slate-200 dark:border-slate-700/40 bg-slate-50 dark:bg-slate-800/30 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600',
      'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400/50 dark:focus:border-primary-500/40',
      'disabled:opacity-60 disabled:cursor-not-allowed resize-none',
    ]"
    :rows="rows"
    :placeholder="placeholder"
    :value="modelValue"
    :disabled="disabled"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  rows: 3,
  disabled: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
