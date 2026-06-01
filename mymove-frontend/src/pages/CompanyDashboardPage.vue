<script setup lang="ts">
import { computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCompanyStore } from '@/stores/company'
import { useI18n } from 'vue-i18n'
import CompanyLayout from '@/components/company/CompanyLayout.vue'
import CompanyKpiCards from '@/components/company/CompanyKpiCards.vue'
import CompanyRequestList from '@/components/company/CompanyRequestList.vue'

const router = useRouter()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const { t } = useI18n()

const firstName = computed(() => authStore.user?.firstName ?? '')
const companyName = computed(() => companyStore.company?.companyName ?? t('companyDashboard.yourCompany'))

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return t('companyDashboard.greeting.morning')
  if (hour < 18) return t('companyDashboard.greeting.day')
  return t('companyDashboard.greeting.evening')
})

function PlusIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('line', { x1: '12', y1: '5', x2: '12', y2: '19' }),
    h('line', { x1: '5', y1: '12', x2: '19', y2: '12' }),
  ])
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  try {
    await companyStore.fetchCompany()
    await companyStore.fetchDashboard()
    await companyStore.fetchAvailableRequests()
  } catch {
    // errors handled in store
  }
})
</script>

<template>
  <CompanyLayout>
    <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <!-- Welcome section -->
      <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">
            {{ greeting }}, {{ firstName }}!
          </h1>
          <p class="text-gray-500 mt-1">
            {{ t('companyDashboard.subtitle', { companyName }) }}
          </p>
        </div>

        <!-- New Offer CTA Card -->
        <div class="bg-secondary-50 rounded-2xl p-6 w-full lg:w-80 shrink-0">
          <h3 class="text-lg font-semibold text-secondary-700 mb-1">
            {{ t('companyDashboard.newOffer') }}
          </h3>
          <p class="text-sm text-secondary-600 mb-4">
            {{ t('companyDashboard.newOfferDesc') }}
          </p>
          <button
            class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-900 hover:bg-primary-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusIcon />
            {{ t('companyDashboard.newOfferButton') }}
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <CompanyKpiCards />

      <!-- Requests List -->
      <CompanyRequestList />
    </div>
  </CompanyLayout>
</template>
