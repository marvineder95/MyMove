<script setup lang="ts">
import { onMounted, onErrorCaptured } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

// Initialize stores
const themeStore = useThemeStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// Initialize theme and auth on mount
onMounted(async () => {
  // Initialize theme (dark/light mode)
  themeStore.init()

  // Initialize authentication state
  try {
    await authStore.initializeAuth()
  } catch (error) {
    console.error('[App] Failed to initialize auth:', error)
    notificationStore.addNotification({
      type: 'error',
      message: 'Authentifizierung konnte nicht initialisiert werden',
      duration: 5000
    })
  }
})

// Global error handling
onErrorCaptured((error, instance, info) => {
  console.error('[App] Error captured:', error)
  console.error('[App] Component:', instance)
  console.error('[App] Info:', info)

  notificationStore.addNotification({
    type: 'error',
    message: 'Ein unerwarteter Fehler ist aufgetreten',
    duration: 5000
  })

  // Prevent error from propagating
  return false
})
</script>

<template>
  <!-- Root container with dark mode class binding -->
  <div
    id="app-root"
    :class="{ 'dark': themeStore.isDark }"
    class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300"
  >
    <!-- Router view with fade transition -->
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <!-- Global notification container -->
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup name="slide">
        <div
          v-for="notification in notificationStore.notifications"
          :key="notification.id"
          :class="[
            'px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm',
            'transform transition-all duration-300',
            notification.type === 'success' && 'bg-green-500/90 text-white',
            notification.type === 'error' && 'bg-red-500/90 text-white',
            notification.type === 'warning' && 'bg-yellow-500/90 text-white',
            notification.type === 'info' && 'bg-blue-500/90 text-white'
          ]"
        >
          <div class="flex items-center gap-2">
            <!-- Success Icon -->
            <svg
              v-if="notification.type === 'success'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <!-- Error Icon -->
            <svg
              v-else-if="notification.type === 'error'"
              class="w-5 h-5"
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
            <!-- Warning Icon -->
            <svg
              v-else-if="notification.type === 'warning'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <!-- Info Icon -->
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="font-medium">{{ notification.message }}</span>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style>
/* Fade transition for route changes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Slide transition for notifications */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Smooth scrolling for the entire app */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ::-webkit-scrollbar-thumb {
  background: #475569;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Focus styles for accessibility */
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Selection styles */
::selection {
  background: #3b82f6;
  color: white;
}

.dark ::selection {
  background: #60a5fa;
  color: #1e293b;
}
</style>
