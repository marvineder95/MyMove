<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  label?: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'url'
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputClasses = computed(() => {
  return [
    'w-full px-4 py-3 rounded-lg border-2 transition-all duration-200',
    'bg-white dark:bg-slate-800',
    'text-gray-900 dark:text-gray-100',
    'placeholder-gray-400 dark:placeholder-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    props.error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600',
    props.disabled && 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-900'
  ].join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
    >
      {{ $t(label) }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder ? $t(placeholder) : undefined"
      :required="required"
      :disabled="disabled"
      :class="inputClasses"
      @input="handleInput"
    />
    <p
      v-if="error"
      class="mt-1.5 text-sm text-red-500 dark:text-red-400 animate-pulse"
    >
      {{ error }}
    </p>
  </div>
</template>
