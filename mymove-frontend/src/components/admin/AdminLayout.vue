<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function logout() {
  authStore.logout()
  router.push('/login')
}

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
  { label: 'Unternehmen', path: '/admin/companies', icon: 'Building2' },
  { label: 'Kunden', path: '/admin/customers', icon: 'Users' },
]

function isActive(path: string) {
  return router.currentRoute.value.path === path
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-20">
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-primary-900 flex items-center justify-center">
            <span class="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 class="text-sm font-bold text-gray-900">Admin Panel</h1>
            <p class="text-xs text-gray-400">MyMove</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
            isActive(item.path)
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          ]"
        >
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="p-4 border-t border-gray-100">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
            {{ (authStore.user?.firstName?.[0] || 'A') + (authStore.user?.lastName?.[0] || '') }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ authStore.user?.firstName || '' }} {{ authStore.user?.lastName || '' }}
            </p>
            <p class="text-xs text-gray-400 truncate">Administrator</p>
          </div>
        </div>
        <button
          @click="logout"
          class="w-full px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
        >
          Abmelden
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 ml-64">
      <div class="p-8 max-w-7xl mx-auto">
        <slot />
      </div>
    </main>
  </div>
</template>
