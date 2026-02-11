<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="isScrolled ? 'shadow-lg' : ''"
  >
    <nav
      class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <RouterLink
            to="/"
            class="flex items-center gap-2 group"
          >
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary-500/30 transition-shadow duration-300">
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <span class="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              MyMove
            </span>
          </RouterLink>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-1">
            <!-- Public Links -->
            <template v-if="!isAuthenticated">
              <RouterLink
                v-for="link in publicLinks"
                :key="link.to"
                :to="link.to"
                class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                active-class="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
              >
                {{ $t(link.label) }}
              </RouterLink>
            </template>

            <!-- Authenticated Links -->
            <template v-else>
              <RouterLink
                v-for="link in authLinks"
                :key="link.to"
                :to="link.to"
                class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                active-class="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
              >
                {{ $t(link.label) }}
              </RouterLink>
              <button
                @click="handleLogout"
                class="px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
              >
                {{ $t('nav.logout') }}
              </button>
            </template>
          </div>

          <!-- Right Side: Language & Theme -->
          <div class="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <DarkModeToggle />
          </div>

          <!-- Mobile Menu Button -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            :aria-expanded="isMobileMenuOpen"
            aria-label="Toggle menu"
          >
            <svg
              v-if="!isMobileMenuOpen"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              v-else
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform -translate-y-4 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-4 opacity-0"
      >
        <div
          v-if="isMobileMenuOpen"
          class="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700"
        >
          <div class="px-4 py-4 space-y-2">
            <!-- Public Links Mobile -->
            <template v-if="!isAuthenticated">
              <RouterLink
                v-for="link in publicLinks"
                :key="link.to"
                :to="link.to"
                @click="isMobileMenuOpen = false"
                class="block px-4 py-3 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                active-class="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
              >
                {{ $t(link.label) }}
              </RouterLink>
            </template>

            <!-- Authenticated Links Mobile -->
            <template v-else>
              <RouterLink
                v-for="link in authLinks"
                :key="link.to"
                :to="link.to"
                @click="isMobileMenuOpen = false"
                class="block px-4 py-3 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                active-class="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
              >
                {{ $t(link.label) }}
              </RouterLink>
              <button
                @click="handleLogoutMobile"
                class="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
              >
                {{ $t('nav.logout') }}
              </button>
            </template>

            <!-- Mobile: Language & Theme -->
            <div class="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <LanguageSwitcher />
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </Transition>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LanguageSwitcher from './LanguageSwitcher.vue'
import DarkModeToggle from '../Theme/DarkModeToggle.vue'

const router = useRouter()
const authStore = useAuthStore()

const isMobileMenuOpen = ref(false)
const isScrolled = ref(false)

const isAuthenticated = authStore.isAuthenticated

const publicLinks = [
  { to: '/', label: 'nav.home' },
  { to: '/register', label: 'nav.register' },
  { to: '/login', label: 'nav.login' }
]

const authLinks = [
  { to: '/dashboard', label: 'nav.dashboard' },
  { to: '/moves', label: 'nav.myMoves' },
  { to: '/profile', label: 'nav.profile' }
]

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

const handleLogoutMobile = async () => {
  isMobileMenuOpen.value = false
  await authStore.logout()
  router.push('/')
}

// Handle scroll for shadow effect
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
