<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { 
  ShieldCheckIcon, 
  ArrowLeftOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

type CompanyStatus = 'pending' | 'approved' | 'rejected'
type CompanyTab = 'pending' | 'approved' | 'rejected'

interface Company {
  id: string
  companyName: string
  email: string
  phone: string
  city: string
  status: CompanyStatus
  registeredAt: string
  vatNumber?: string
}

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<CompanyTab>('pending')
const searchQuery = ref('')
const isProcessing = ref<string | null>(null)

// Mock data - in real app would come from API
const companies = ref<Company[]>([
  {
    id: '1',
    companyName: 'Müller Umzüge GmbH',
    email: 'info@mueller-umzuege.de',
    phone: '+49 30 12345678',
    city: 'Berlin',
    status: 'pending',
    registeredAt: '2024-01-15T10:30:00Z',
    vatNumber: 'DE123456789'
  },
  {
    id: '2',
    companyName: 'Schmidt Transporte',
    email: 'kontakt@schmidt-transporte.de',
    phone: '+49 40 87654321',
    city: 'Hamburg',
    status: 'pending',
    registeredAt: '2024-01-14T14:22:00Z',
    vatNumber: 'DE987654321'
  },
  {
    id: '3',
    companyName: 'Express Movers Berlin',
    email: 'hello@expressmovers.de',
    phone: '+49 30 55555555',
    city: 'Berlin',
    status: 'approved',
    registeredAt: '2024-01-10T09:00:00Z',
    vatNumber: 'DE111222333'
  },
  {
    id: '4',
    companyName: 'Quick Move München',
    email: 'info@quickmove.de',
    phone: '+49 89 12345678',
    city: 'München',
    status: 'approved',
    registeredAt: '2024-01-08T16:45:00Z',
    vatNumber: 'DE444555666'
  },
  {
    id: '5',
    companyName: 'Test Firma Abgelehnt',
    email: 'test@test.de',
    phone: '+49 123 456789',
    city: 'Köln',
    status: 'rejected',
    registeredAt: '2024-01-05T11:20:00Z',
    vatNumber: 'DE000000000'
  }
])

const filteredCompanies = computed(() => {
  let result = companies.value.filter(c => c.status === activeTab.value)
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(c => 
      c.companyName.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.city.toLowerCase().includes(query)
    )
  }
  
  return result.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
})

const counts = computed(() => ({
  pending: companies.value.filter(c => c.status === 'pending').length,
  approved: companies.value.filter(c => c.status === 'approved').length,
  rejected: companies.value.filter(c => c.status === 'rejected').length
}))

const setTab = (tab: CompanyTab) => {
  activeTab.value = tab
}

const approveCompany = async (companyId: string) => {
  isProcessing.value = companyId
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const company = companies.value.find(c => c.id === companyId)
  if (company) {
    company.status = 'approved'
  }
  isProcessing.value = null
}

const rejectCompany = async (companyId: string) => {
  isProcessing.value = companyId
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const company = companies.value.find(c => c.id === companyId)
  if (company) {
    company.status = 'rejected'
  }
  isProcessing.value = null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Admin Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <ShieldCheckIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ t('admin.title') }}
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('admin.subtitle') }}
              </p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <ArrowLeftOnRectangleIcon class="w-5 h-5" />
            <span class="hidden sm:inline">{{ t('common.logout') }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div 
          @click="setTab('pending')"
          class="cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all"
          :class="activeTab === 'pending' 
            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' 
            : 'border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700'"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('admin.stats.pending') }}</p>
              <p class="text-3xl font-bold text-amber-600 dark:text-amber-400">{{ counts.pending }}</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ClockIcon class="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div 
          @click="setTab('approved')"
          class="cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all"
          :class="activeTab === 'approved' 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
            : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('admin.stats.approved') }}</p>
              <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ counts.approved }}</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircleIcon class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div 
          @click="setTab('rejected')"
          class="cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all"
          :class="activeTab === 'rejected' 
            ? 'border-red-500 bg-red-50 dark:bg-red-900/10' 
            : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700'"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('admin.stats.rejected') }}</p>
              <p class="text-3xl font-bold text-red-600 dark:text-red-400">{{ counts.rejected }}</p>
            </div>
            <div class="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircleIcon class="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1 relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('admin.search.placeholder')"
              class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button class="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <FunnelIcon class="w-5 h-5" />
            <span>{{ t('admin.filter.title') }}</span>
          </button>
        </div>
      </div>

      <!-- Companies Table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="font-semibold text-gray-900 dark:text-white">
            {{ t(`admin.tabs.${activeTab}`) }}
          </h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.table.company') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.table.contact') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.table.location') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.table.registered') }}
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ t('admin.table.actions') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="filteredCompanies.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  <BuildingOfficeIcon class="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p>{{ t('admin.table.empty') }}</p>
                </td>
              </tr>
              <tr 
                v-for="company in filteredCompanies" 
                :key="company.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                      <BuildingOfficeIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div class="font-medium text-gray-900 dark:text-white">{{ company.companyName }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ company.vatNumber }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="space-y-1">
                    <div class="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <EnvelopeIcon class="w-4 h-4 mr-2 text-gray-400" />
                      {{ company.email }}
                    </div>
                    <div class="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                      {{ company.phone }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {{ company.city }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <CalendarIcon class="w-4 h-4 mr-2 text-gray-400" />
                    {{ formatDate(company.registeredAt) }}
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div v-if="activeTab === 'pending'" class="flex items-center justify-end space-x-2">
                    <button
                      @click="approveCompany(company.id)"
                      :disabled="isProcessing === company.id"
                      class="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircleIcon v-if="isProcessing !== company.id" class="w-4 h-4 mr-1" />
                      <svg v-else class="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      {{ t('admin.actions.approve') }}
                    </button>
                    <button
                      @click="rejectCompany(company.id)"
                      :disabled="isProcessing === company.id"
                      class="inline-flex items-center px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircleIcon v-if="isProcessing !== company.id" class="w-4 h-4 mr-1" />
                      <svg v-else class="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      {{ t('admin.actions.reject') }}
                    </button>
                  </div>
                  <span v-else-if="activeTab === 'approved'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                    <CheckCircleIcon class="w-3 h-3 mr-1" />
                    {{ t('admin.status.approved') }}
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                    <XCircleIcon class="w-3 h-3 mr-1" />
                    {{ t('admin.status.rejected') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('admin.pagination.showing', { count: filteredCompanies.length }) }}
          </div>
          <div class="flex items-center space-x-2">
            <button 
              disabled
              class="p-2 rounded-lg text-gray-400 cursor-not-allowed"
            >
              <ChevronLeftIcon class="w-5 h-5" />
            </button>
            <button 
              disabled
              class="p-2 rounded-lg text-gray-400 cursor-not-allowed"
            >
              <ChevronRightIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
