<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader v-if="showHeader" />
    <main :class="mainClass">
      <RouterView />
    </main>
    <ToastProvider />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { ToastProvider } from '@/components/ui'

const route = useRoute()
const isLandingPage = computed(() => route.path === '/')
const isCompanyRoute = computed(() => route.path.startsWith('/company'))
const isCustomerRoute = computed(() =>
  route.path === '/dashboard' ||
  route.path.startsWith('/moves/') ||
  route.path === '/my-offers' ||
  route.path === '/messages' ||
  route.path === '/profile' ||
  route.path === '/settings'
)
const showHeader = computed(() => !isLandingPage.value && !isCompanyRoute.value && !isCustomerRoute.value)
const mainClass = computed(() => {
  if (isLandingPage.value) return ''
  if (isCompanyRoute.value) return ''
  if (isCustomerRoute.value) return ''
  return 'max-w-7xl mx-auto px-4 py-8'
})
</script>
