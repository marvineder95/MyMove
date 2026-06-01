<template>
  <header class="bg-white border-b border-gray-100 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink to="/dashboard" class="flex items-center">
          <img
            src="/assets/img/MyMoveLogoSchrift.png"
            alt="MyMove"
            class="h-14 w-auto object-contain"
          />
        </RouterLink>

        <!-- Right side -->
        <div class="flex items-center gap-4">
          <!-- Notification bell -->
          <div class="relative">
            <button
              @click="notificationOpen = !notificationOpen; langOpen = false; userMenuOpen = false"
              class="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
              <span
                v-if="messageStore.unreadCount > 0"
                class="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1"
              >
                {{ messageStore.unreadCount > 99 ? '99+' : messageStore.unreadCount }}
              </span>
            </button>
            <!-- Notification Dropdown -->
            <div
              v-if="notificationOpen"
              class="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
            >
              <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-sm font-semibold text-gray-900">{{ t('notifications.title') }}</p>
              </div>
              <!-- Empty state -->
              <div v-if="messageStore.unreadCount === 0" class="px-4 py-6 text-center">
                <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                </svg>
                <p class="text-sm text-gray-500">{{ t('notifications.empty') }}</p>
              </div>
              <!-- Has notifications -->
              <div v-else class="px-4 py-3 text-center">
                <p class="text-sm text-gray-700 mb-3">
                  {{ t('notifications.newMessages', { count: messageStore.unreadCount }) }}
                </p>
                <button
                  @click="goToMessages"
                  class="w-full py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  {{ t('notifications.viewAll') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Language switcher -->
          <div class="relative">
            <button
              @click="langOpen = !langOpen; notificationOpen = false; userMenuOpen = false"
              class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors"
            >
              {{ currentLocale === 'de' ? 'DE' : 'EN' }}
              <svg class="w-3 h-3" :class="langOpen ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div v-if="langOpen" class="absolute right-0 mt-1 w-20 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
              <button @click="setLocale('de'); langOpen = false" class="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">DE</button>
              <button @click="setLocale('en'); langOpen = false" class="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">EN</button>
            </div>
          </div>

          <!-- User avatar + name -->
          <div class="relative">
            <button
              @click="userMenuOpen = !userMenuOpen; notificationOpen = false; langOpen = false"
              class="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 transition-colors"
            >
              <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
                {{ userInitials }}
              </div>
              <span class="text-sm font-medium text-gray-700 hidden sm:block">{{ userName }}</span>
              <svg class="w-3 h-3 text-gray-400 hidden sm:block" :class="userMenuOpen ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div v-if="userMenuOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
              <RouterLink to="/dashboard" @click="userMenuOpen = false" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                {{ t('customerDashboard.sidebar.overview') }}
              </RouterLink>
              <RouterLink to="/moves/new" @click="userMenuOpen = false" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                {{ t('customerDashboard.sidebar.myMoves') }}
              </RouterLink>
              <div class="border-t border-gray-100 my-1"></div>
              <button @click="handleLogout" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                {{ t('auth.logout') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useMessageStore } from '@/stores/message'

const auth = useAuthStore()
const messageStore = useMessageStore()
const router = useRouter()
const { t, locale: i18nLocale } = useI18n()

const langOpen = ref(false)
const userMenuOpen = ref(false)
const notificationOpen = ref(false)
const notificationInterval = ref<ReturnType<typeof setInterval> | null>(null)

const userName = computed(() => {
  if (auth.user?.firstName && auth.user?.lastName) {
    return `${auth.user.firstName} ${auth.user.lastName}`
  }
  return auth.user?.email || 'User'
})

const userInitials = computed(() => {
  const first = auth.user?.firstName?.[0] || ''
  const last = auth.user?.lastName?.[0] || ''
  return (first + last).toUpperCase() || 'U'
})

const currentLocale = computed(() => i18nLocale.value)

function setLocale(val: string) {
  i18nLocale.value = val
}

function handleLogout() {
  userMenuOpen.value = false
  auth.logout()
  router.push('/')
}

function goToMessages() {
  notificationOpen.value = false
  router.push('/messages')
}

onMounted(() => {
  if (auth.isAuthenticated) {
    messageStore.fetchUnreadCount()
    notificationInterval.value = setInterval(() => {
      messageStore.fetchUnreadCount()
    }, 30000)
  }
})

onUnmounted(() => {
  if (notificationInterval.value) {
    clearInterval(notificationInterval.value)
  }
})
</script>
