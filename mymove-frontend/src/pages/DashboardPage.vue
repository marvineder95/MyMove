<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRequestStore } from '@/stores/request'
import { useI18n } from 'vue-i18n'
import CustomerLayout from '@/components/customer/CustomerLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const requestStore = useRequestStore()
const { t } = useI18n()

const firstName = computed(() => authStore.user?.firstName ?? '')

const openFaq = ref<number | null>(null)

const howItWorksSteps = [
  { num: '1', title: t('landing.howItWorks.steps.1.title'), desc: t('landing.howItWorks.steps.1.description'), icon: 'clipboard' },
  { num: '2', title: t('landing.howItWorks.steps.2.title'), desc: t('landing.howItWorks.steps.2.description'), icon: 'video' },
  { num: '3', title: t('landing.howItWorks.steps.3.title'), desc: t('landing.howItWorks.steps.3.description'), icon: 'mail' },
  { num: '4', title: t('landing.howItWorks.steps.4.title'), desc: t('landing.howItWorks.steps.4.description'), icon: 'check' },
  { num: '5', title: t('landing.howItWorks.steps.5.title'), desc: t('landing.howItWorks.steps.5.description'), icon: 'smile' },
]

const benefits = [
  { icon: 'free', title: t('customerDashboard.benefits.free.title'), desc: t('customerDashboard.benefits.free.desc') },
  { icon: 'verified', title: t('customerDashboard.benefits.verified.title'), desc: t('customerDashboard.benefits.verified.desc') },
  { icon: 'transparent', title: t('customerDashboard.benefits.transparent.title'), desc: t('customerDashboard.benefits.transparent.desc') },
  { icon: 'support', title: t('customerDashboard.benefits.support.title'), desc: t('customerDashboard.benefits.support.desc') },
]

const faqItems = [
  { q: t('customerDashboard.faq.1.q'), a: t('customerDashboard.faq.1.a') },
  { q: t('customerDashboard.faq.2.q'), a: t('customerDashboard.faq.2.a') },
  { q: t('customerDashboard.faq.3.q'), a: t('customerDashboard.faq.3.a') },
  { q: t('customerDashboard.faq.4.q'), a: t('customerDashboard.faq.4.a') },
]

function toggleFaq(idx: number) {
  openFaq.value = openFaq.value === idx ? null : idx
}

function goToNewMove() {
  router.push('/moves/new')
}

onMounted(() => {
  requestStore.fetchMyRequests()
})
</script>

<template>
  <CustomerLayout>
    <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <!-- Welcome section -->
      <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div>
          <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">
            {{ t('customerDashboard.welcome', { name: firstName }) }} 👋
          </h1>
          <p class="text-gray-500 mt-1">{{ t('customerDashboard.welcomeSub') }}</p>
        </div>

        <!-- New Move Card -->
        <div class="bg-secondary-50 rounded-2xl p-6 w-full lg:w-80 shrink-0">
          <h3 class="text-lg font-semibold text-secondary-700 mb-1">{{ t('customerDashboard.newMoveCard.title') }}</h3>
          <p class="text-sm text-secondary-600 mb-4">{{ t('customerDashboard.newMoveCard.desc') }}</p>
          <button
            @click="goToNewMove"
            class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-900 hover:bg-primary-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {{ t('customerDashboard.newMoveCard.button') }}
          </button>
        </div>
      </div>

      <!-- How it works -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-900 mb-1">{{ t('customerDashboard.howItWorks.title') }}</h2>
        <p class="text-sm text-gray-500 mb-6">{{ t('customerDashboard.howItWorks.subtitle') }}</p>

        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Left: illustration placeholder -->
          <div class="lg:w-1/2">
            <div class="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl aspect-video flex items-center justify-center">
              <div class="text-center">
                <svg class="w-16 h-16 text-secondary-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                  <path d="m9 9 2 2 4-4"/>
                </svg>
                <p class="text-sm text-gray-400">{{ t('customerDashboard.howItWorks.videoPlaceholder') }}</p>
              </div>
            </div>
            <button class="mt-4 text-sm font-medium text-secondary-600 hover:text-secondary-700 flex items-center gap-1">
              {{ t('customerDashboard.howItWorks.learnMore') }}
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>

          <!-- Right: steps -->
          <div class="lg:w-1/2 space-y-4">
            <div
              v-for="(step, idx) in howItWorksSteps"
              :key="step.num"
              class="flex items-start gap-4"
            >
              <!-- Step 1 (Register) is already done since user is logged in -->
              <div
                v-if="idx === 0"
                class="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div
                v-else
                class="w-10 h-10 rounded-full bg-secondary-50 text-secondary-600 flex items-center justify-center shrink-0 text-sm font-semibold"
              >
                {{ step.num }}
              </div>
              <div :class="idx === 0 ? 'opacity-60' : ''">
                <p class="font-medium text-gray-900">{{ step.title }}</p>
                <p class="text-sm text-gray-500">{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Benefits -->
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t('customerDashboard.benefits.title') }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="benefit in benefits"
            :key="benefit.title"
            class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4"
          >
            <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <svg v-if="benefit.icon === 'free'" class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <svg v-else-if="benefit.icon === 'verified'" class="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <svg v-else-if="benefit.icon === 'transparent'" class="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <svg v-else class="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ benefit.title }}</p>
              <p class="text-sm text-gray-500">{{ benefit.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- My Moves + FAQ -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- My Moves -->
        <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">{{ t('customerDashboard.myMoves.title') }}</h2>
            <button v-if="requestStore.requests.length > 0" class="text-sm font-medium text-secondary-600 hover:text-secondary-700 flex items-center gap-1">
              {{ t('customerDashboard.myMoves.showAll') }}
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>

          <!-- Empty state -->
          <div v-if="requestStore.requests.length === 0" class="flex flex-col sm:flex-row items-center gap-6 py-4">
            <div class="w-32 h-32 bg-primary-50 rounded-full flex items-center justify-center shrink-0">
              <svg class="w-14 h-14 text-primary-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div class="text-center sm:text-left">
              <p class="font-medium text-gray-900 mb-1">{{ t('customerDashboard.myMoves.emptyTitle') }}</p>
              <p class="text-sm text-gray-500 mb-4">{{ t('customerDashboard.myMoves.emptyDesc') }}</p>
              <button
                @click="goToNewMove"
                class="inline-flex items-center px-4 py-2 bg-primary-900 hover:bg-primary-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {{ t('customerDashboard.myMoves.emptyButton') }}
              </button>
            </div>
          </div>

          <!-- Moves list -->
          <div v-else class="space-y-3">
            <div
              v-for="move in requestStore.requests.slice(0, 3)"
              :key="move.id"
              class="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ move.originAddress }} → {{ move.destinationAddress }}</p>
                <p class="text-xs text-gray-500">{{ new Date(move.moveDate).toLocaleDateString('de-DE') }}</p>
              </div>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0"
                :class="{
                  'bg-gray-100 text-gray-700': move.status === 'DRAFT',
                  'bg-blue-50 text-blue-700': move.status === 'VIDEO_UPLOADED',
                  'bg-purple-50 text-purple-700': move.status === 'AI_PROCESSED',
                  'bg-yellow-50 text-yellow-700': move.status === 'READY_FOR_REQUEST',
                  'bg-green-50 text-green-700': move.status === 'SENT_TO_COMPANIES',
                }"
              >
                {{ move.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- FAQ -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t('customerDashboard.faq.title') }}</h2>
          <div class="space-y-2">
            <div
              v-for="(item, idx) in faqItems"
              :key="idx"
              class="border border-gray-100 rounded-lg overflow-hidden"
            >
              <button
                @click="toggleFaq(idx)"
                class="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {{ item.q }}
                <svg
                  class="w-4 h-4 text-gray-400 shrink-0 ml-2 transition-transform"
                  :class="openFaq === idx ? 'rotate-180' : ''"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <div
                v-show="openFaq === idx"
                class="px-4 pb-3 text-sm text-gray-500"
              >
                {{ item.a }}
              </div>
            </div>
          </div>
          <button class="mt-4 text-sm font-medium text-secondary-600 hover:text-secondary-700 flex items-center gap-1">
            {{ t('customerDashboard.faq.showAll') }}
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </CustomerLayout>
</template>
