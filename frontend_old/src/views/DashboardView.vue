<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { 
  BuildingOfficeIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  StarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Mock data for offers - in real app would come from API
const pendingOffers = ref([
  {
    id: '1',
    customerName: 'Max Mustermann',
    fromAddress: '10115 Berlin',
    toAddress: '20095 Hamburg',
    moveDate: '2024-02-15',
    status: 'pending',
    estimatedValue: '1.200 - 1.800 €'
  },
  {
    id: '2',
    customerName: 'Anna Schmidt',
    fromAddress: '80331 München',
    toAddress: '70173 Stuttgart',
    moveDate: '2024-02-20',
    status: 'pending',
    estimatedValue: '800 - 1.200 €'
  },
  {
    id: '3',
    customerName: 'Peter Müller',
    fromAddress: '40213 Düsseldorf',
    toAddress: '50667 Köln',
    moveDate: '2024-02-25',
    status: 'responded',
    estimatedValue: '500 - 800 €'
  }
])

const respondedOffers = ref([
  {
    id: '4',
    customerName: 'Lisa Weber',
    fromAddress: '04109 Leipzig',
    toAddress: '01067 Dresden',
    moveDate: '2024-01-28',
    status: 'accepted',
    finalPrice: '1.450 €'
  }
])

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

const navigateToSettings = () => {
  router.push('/dashboard/settings')
}

const navigateToOffers = () => {
  router.push('/dashboard/offers')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Dashboard Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <BuildingOfficeIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ t('dashboard.title') }}
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('dashboard.welcome', { name: user?.companyName || 'Firma' }) }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="navigateToSettings"
              class="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              :title="t('dashboard.settings.title')"
            >
              <Cog6ToothIcon class="w-6 h-6" />
            </button>
            <button
              @click="handleLogout"
              class="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <ArrowLeftOnRectangleIcon class="w-5 h-5" />
              <span class="hidden sm:inline">{{ t('common.logout') }}</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('dashboard.stats.pending') }}</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">2</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ClockIcon class="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('dashboard.stats.responded') }}</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">1</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CheckCircleIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('dashboard.stats.accepted') }}</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">1</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <StarIcon class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('dashboard.stats.revenue') }}</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">1.450 €</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <CurrencyEuroIcon class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Company Profile -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-6">
              <div class="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                <BuildingOfficeIcon class="w-10 h-10 text-white" />
              </div>
              <h2 class="text-xl font-bold text-white text-center mt-4">
                {{ user?.companyName || 'Ihre Firma' }}
              </h2>
              <div class="flex items-center justify-center mt-2">
                <span class="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm">
                  {{ t('dashboard.profile.verified') }}
                </span>
              </div>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex items-center space-x-3">
                <EnvelopeIcon class="w-5 h-5 text-gray-400" />
                <span class="text-gray-700 dark:text-gray-300">{{ user?.email || 'firma@beispiel.de' }}</span>
              </div>
              <div class="flex items-center space-x-3">
                <PhoneIcon class="w-5 h-5 text-gray-400" />
                <span class="text-gray-700 dark:text-gray-300">{{ user?.phone || '+49 123 456789' }}</span>
              </div>
              <div class="flex items-center space-x-3">
                <MapPinIcon class="w-5 h-5 text-gray-400" />
                <span class="text-gray-700 dark:text-gray-300">{{ user?.city || 'Berlin' }}</span>
              </div>
              <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-500 dark:text-gray-400">{{ t('dashboard.profile.rating') }}</span>
                  <div class="flex items-center space-x-1">
                    <StarIcon class="w-4 h-4 text-yellow-400 fill-current" />
                    <span class="font-semibold text-gray-900 dark:text-white">4.8</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">(12)</span>
                  </div>
                </div>
              </div>
              <button
                @click="navigateToSettings"
                class="w-full mt-4 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {{ t('dashboard.profile.edit') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column: Offers -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Pending Offers -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <ClipboardDocumentListIcon class="w-5 h-5 text-gray-400" />
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {{ t('dashboard.offers.pending.title') }}
                </h3>
              </div>
              <button
                @click="navigateToOffers"
                class="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <span>{{ t('common.viewAll') }}</span>
                <ArrowRightIcon class="w-4 h-4" />
              </button>
            </div>
            <div class="divide-y divide-gray-200 dark:divide-gray-700">
              <div
                v-for="offer in pendingOffers.filter(o => o.status === 'pending')"
                :key="offer.id"
                class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div class="flex items-start justify-between">
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <span class="font-semibold text-gray-900 dark:text-white">{{ offer.customerName }}</span>
                      <span class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs">
                        {{ t('dashboard.offers.status.pending') }}
                      </span>
                    </div>
                    <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span class="flex items-center space-x-1">
                        <MapPinIcon class="w-4 h-4" />
                        <span>{{ offer.fromAddress }} → {{ offer.toAddress }}</span>
                      </span>
                    </div>
                    <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span class="flex items-center space-x-1">
                        <CalendarIcon class="w-4 h-4" />
                        <span>{{ offer.moveDate }}</span>
                      </span>
                      <span class="flex items-center space-x-1">
                        <CurrencyEuroIcon class="w-4 h-4" />
                        <span>{{ offer.estimatedValue }}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    {{ t('dashboard.offers.respond') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="font-semibold text-gray-900 dark:text-white">
                {{ t('dashboard.activity.title') }}
              </h3>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div class="flex items-start space-x-3">
                  <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon class="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p class="text-sm text-gray-900 dark:text-white">
                      {{ t('dashboard.activity.accepted', { customer: 'Lisa Weber' }) }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('dashboard.activity.time', { time: '2 Stunden' }) }}</p>
                  </div>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <ClipboardDocumentListIcon class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p class="text-sm text-gray-900 dark:text-white">
                      {{ t('dashboard.activity.newOffer', { customer: 'Peter Müller' }) }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('dashboard.activity.time', { time: '5 Stunden' }) }}</p>
                  </div>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <StarIcon class="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p class="text-sm text-gray-900 dark:text-white">
                      {{ t('dashboard.activity.review', { rating: '5' }) }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('dashboard.activity.time', { time: '1 Tag' }) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
