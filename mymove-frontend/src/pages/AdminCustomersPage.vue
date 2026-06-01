<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { adminApi } from '@/api/admin'
import type { User } from '@/types'
import AdminLayout from '@/components/admin/AdminLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const customers = ref<User[]>([])
const isLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

onMounted(async () => {
  if (authStore.user?.role !== 'ADMIN') {
    router.push('/')
    return
  }
  await loadCustomers()
})

async function loadCustomers() {
  isLoading.value = true
  try {
    const { data } = await adminApi.getCustomers(currentPage.value, 20)
    customers.value = data.data
    totalPages.value = data.meta.totalPages
  } catch {
    // ignore
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AdminLayout>
    <div>
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Kunden</h1>
        <p class="text-gray-500 mt-1">Alle registrierten Kunden auf der Plattform</p>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">ID</th>
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Name</th>
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">E-Mail</th>
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Telefon</th>
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Registriert</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="5" class="px-6 py-8 text-center text-gray-400">Laden...</td>
              </tr>
              <tr v-else-if="customers.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-400">Keine Kunden gefunden</td>
              </tr>
              <tr
                v-for="customer in customers"
                :key="customer.id"
                class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td class="px-6 py-4 text-sm text-gray-500">#{{ customer.id }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400">
                      {{ (customer.firstName?.[0] || '') + (customer.lastName?.[0] || '') }}
                    </div>
                    <p class="text-sm font-medium text-gray-900">
                      {{ customer.firstName || '' }} {{ customer.lastName || '' }}
                    </p>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">{{ customer.email }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ customer.phone || '—' }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('de-DE') : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button
            @click="currentPage--; loadCustomers()"
            :disabled="currentPage <= 1"
            class="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
          >
            ← Zurück
          </button>
          <span class="text-sm text-gray-500">Seite {{ currentPage }} / {{ totalPages }}</span>
          <button
            @click="currentPage++; loadCustomers()"
            :disabled="currentPage >= totalPages"
            class="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
          >
            Weiter →
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
