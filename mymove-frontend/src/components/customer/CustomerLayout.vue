<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessageStore } from '@/stores/message'
import CustomerSidebar from './CustomerSidebar.vue'

const router = useRouter()
const { t } = useI18n()
const messageStore = useMessageStore()
const notificationOpen = ref(false)

function goToMessages() {
  notificationOpen.value = false
  router.push('/messages')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <CustomerSidebar />
    <main class="lg:ml-60 min-w-0">
      <slot />
    </main>

    <!-- Floating Notification Bell -->
    <div class="fixed bottom-6 right-6 z-40">
      <button
        @click="notificationOpen = !notificationOpen"
        class="w-14 h-14 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:shadow-xl transition-all relative"
        :aria-label="t('notifications.title')"
      >
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
        </svg>
        <span
          v-if="messageStore.unreadCount > 0"
          class="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
        ></span>
      </button>
      <!-- Dropdown -->
      <div
        v-if="notificationOpen"
        class="absolute bottom-16 right-0 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2"
      >
        <div class="px-4 py-2 border-b border-gray-100">
          <p class="text-sm font-semibold text-gray-900">{{ t('notifications.title') }}</p>
        </div>
        <div v-if="messageStore.unreadCount === 0" class="px-4 py-6 text-center">
          <svg class="w-10 h-10 text-gray-300 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          <p class="text-sm text-gray-500">{{ t('notifications.empty') }}</p>
        </div>
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
  </div>
</template>
