<template>
  <input
    :class="[
      'w-full rounded-xl border bg-white/40 dark:bg-white/[0.05] backdrop-blur-sm',
      'border-white/70 dark:border-white/[0.09]',
      'px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200',
      'placeholder:text-slate-400 dark:placeholder:text-slate-500',
      'focus:outline-none focus:ring-2 focus:ring-primary-500/25 focus:border-primary-400/50 dark:focus:border-primary-500/40',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      $attrs.class,
    ]"
    :type="type"
    :placeholder="placeholder"
    :value="modelValue"
    :disabled="disabled"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  type?: string
  placeholder?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  disabled: false,
})

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
