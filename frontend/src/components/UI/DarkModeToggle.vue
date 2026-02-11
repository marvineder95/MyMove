<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

const isDark = computed(() => themeStore.isDark)

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<template>
  <button
    type="button"
    class="relative p-2 rounded-full transition-all duration-200 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
    :aria-label="isDark ? $t('common.lightMode') : $t('common.darkMode')"
    @click="toggleTheme"
  >
    <!-- Sun Icon (shown in dark mode) -->
    <svg
      v-if="isDark"
      class="w-6 h-6 text-yellow-400 transition-transform duration-200 rotate-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
    
    <!-- Moon Icon (shown in light mode) -->
    <svg
      v-else
      class="w-6 h-6 text-slate-600 transition-transform duration-200"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
    
    <!-- Subtle glow effect -->
    <span
      class="absolute inset-0 rounded-full transition-opacity duration-200"
      :class="isDark ? 'opacity-20 bg-yellow-400' : 'opacity-0'"
    />
  </button>
</template>
