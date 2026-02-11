import { ref, watch, type Ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'mymove-theme'

export const useThemeStore = defineStore('theme', () => {
  // State
  const isDark: Ref<boolean> = ref(false)

  // Check if user has a saved preference, otherwise use system preference
  const getInitialTheme = (): boolean => {
    if (typeof window === 'undefined') return false

    // Check localStorage first
    const savedTheme = localStorage.getItem(STORAGE_KEY)
    if (savedTheme !== null) {
      return savedTheme === 'dark'
    }

    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // Apply theme to document
  const applyTheme = (dark: boolean): void => {
    if (typeof document === 'undefined') return

    const html = document.documentElement
    if (dark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  // Toggle theme
  const toggle = (): void => {
    isDark.value = !isDark.value
  }

  // Initialize theme on app start
  const init = (): void => {
    isDark.value = getInitialTheme()
    applyTheme(isDark.value)
  }

  // Watch for changes and persist to localStorage
  watch(
    isDark,
    (newValue) => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newValue ? 'dark' : 'light')
      }
      applyTheme(newValue)
    },
    { immediate: false }
  )

  // Listen for system preference changes
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      // Only update if user hasn't set a manual preference
      if (localStorage.getItem(STORAGE_KEY) === null) {
        isDark.value = e.matches
      }
    })
  }

  return {
    isDark,
    toggle,
    init,
  }
})

export default useThemeStore
