<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
    >
      <span class="text-lg">{{ currentFlag }}</span>
      <span class="font-medium text-slate-700 dark:text-slate-200">{{ currentLocale.toUpperCase() }}</span>
      <svg
        class="w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
        role="listbox"
      >
        <button
          v-for="locale in availableLocales"
          :key="locale.code"
          @click="changeLocale(locale.code)"
          class="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-700"
          :class="{ 'bg-primary-50 dark:bg-primary-900/30': currentLocale === locale.code }"
          role="option"
          :aria-selected="currentLocale === locale.code"
        >
          <span class="text-lg">{{ locale.flag }}</span>
          <span
            class="font-medium"
            :class="currentLocale === locale.code 
              ? 'text-primary-600 dark:text-primary-400' 
              : 'text-slate-700 dark:text-slate-200'"
          >
            {{ locale.name }}
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const isOpen = ref(false)

const availableLocales = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
]

const currentLocale = computed(() => locale.value)

const currentFlag = computed(() => {
  const loc = availableLocales.find(l => l.code === currentLocale.value)
  return loc?.flag || '🇩🇪'
})

const changeLocale = (code: string) => {
  locale.value = code
  localStorage.setItem('locale', code)
  isOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
