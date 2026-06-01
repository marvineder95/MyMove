<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { adminApi } from '@/api/admin'
import AdminLayout from '@/components/admin/AdminLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const stats = ref({
  totalCompanies: 0,
  totalCustomers: 0,
  pendingApprovals: 0,
  pendingDocuments: 0,
})
const isLoading = ref(false)

onMounted(async () => {
  if (authStore.user?.role !== 'ADMIN') {
    router.push('/')
    return
  }
  isLoading.value = true
  try {
    const { data: companyStats } = await adminApi.getDashboardStats()
    const { data: customerData } = await adminApi.getCustomers(1, 1)
    stats.value = {
      ...companyStats,
      totalCustomers: customerData.meta.total,
    }
  } catch {
    // ignore
  } finally {
    isLoading.value = false
  }
})

const statCards = computed(() => [
  { label: 'Unternehmen', value: stats.value.totalCompanies, color: 'bg-blue-500', icon: '🏢' },
  { label: 'Kunden', value: stats.value.totalCustomers, color: 'bg-green-500', icon: '👤' },
  { label: 'Ausstehende Genehmigungen', value: stats.value.pendingApprovals, color: 'bg-amber-500', icon: '⏳' },
  { label: 'Ausstehende Dokumente', value: stats.value.pendingDocuments, color: 'bg-red-500', icon: '📄' },
])
</script>

<template>
  <AdminLayout>
    <div>
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-500 mt-1">Übersicht über die Plattform</p>
      </div>

      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
          <div class="h-4 bg-gray-100 rounded w-1/2 mb-3"></div>
          <div class="h-8 bg-gray-100 rounded w-1/3"></div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="card in statCards"
          :key="card.label"
          class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <div class="flex items-center justify-between mb-4">
            <span class="text-2xl">{{ card.icon }}</span>
            <div :class="['w-2 h-2 rounded-full', card.color]"></div>
          </div>
          <p class="text-3xl font-bold text-gray-900">{{ card.value }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ card.label }}</p>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Unternehmen verwalten</h2>
          <p class="text-sm text-gray-500 mb-4">
            Genehmige oder lehne Unternehmen ab und prüfe Gewerbescheine.
          </p>
          <button
            @click="router.push('/admin/companies')"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-900 hover:bg-primary-800 rounded-xl transition-colors"
          >
            Zu den Unternehmen →
          </button>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Kunden verwalten</h2>
          <p class="text-sm text-gray-500 mb-4">
            Sieh dir alle registrierten Kunden auf der Plattform an.
          </p>
          <button
            @click="router.push('/admin/customers')"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-900 hover:bg-primary-800 rounded-xl transition-colors"
          >
            Zu den Kunden →
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
