<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="variantClasses"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  disabled?: boolean
  loading?: boolean
}>(), {
  type: 'button',
  variant: 'primary',
  disabled: false,
  loading: false,
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-blue-600 text-white hover:bg-blue-700';
    case 'secondary':
      return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700';
    case 'ghost':
      return 'bg-transparent text-gray-600 hover:bg-gray-100';
    default:
      return 'bg-blue-600 text-white hover:bg-blue-700';
  }
});
</script>
