<script setup lang="ts">
import { computed } from 'vue'

interface Option {
  value: string | number
  label: string
}

interface Props {
  modelValue: string | number
  label?: string
  options: Option[]
  required?: boolean
  error?: string
  disabled?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const selectClasses = computed(() => {
  return [
    'w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 appearance-none',
    'bg-white dark:bg-slate-800',
    'text-gray-900 dark:text-gray-100',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    'cursor-pointer',
    props.error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600',
    props.disabled && 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-900'
  ].join(' ')
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const selectedOption = props.options.find(opt => String(opt.value) === target.value)
  emit('update:modelValue', selectedOption?.value ?? target.value)
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
    <div class="relative">
      <select
        :value="modelValue"
        :required="required"
        :disabled="disabled"
        :class="selectClasses"
        @change="handleChange"
      >
        <option v-if="placeholder" value="" disabled>
          {{ $t(placeholder) }}
        </option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ $t(option.label) }}
        </option>
      </select>
      <!-- Custom Arrow Icon -->
      <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
        <svg
          class="w-5 h-5 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
    <p
      v-if="error"
      class="mt-1.5 text-sm text-red-500 dark:text-red-400 animate-pulse"
    >
      {{ error }}
    </p>
  </div>
</template>
