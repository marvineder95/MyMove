<script setup lang="ts">
import { computed, h } from 'vue'
import { useCompanyStore } from '@/stores/company'
import { useI18n } from 'vue-i18n'

const companyStore = useCompanyStore()
const { t } = useI18n()

const requests = computed(() => {
  return companyStore.availableRequests
})

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  NEW: {
    label: t('companyDashboard.requests.status.new'),
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: MailIcon,
  },
  PENDING: {
    label: t('companyDashboard.requests.status.pending'),
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    icon: ClockIcon,
  },
  SENT: {
    label: t('companyDashboard.requests.status.sent'),
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: CheckCircleIcon,
  },
  NEGOTIATION: {
    label: t('companyDashboard.requests.status.negotiation'),
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    icon: MessageCircleIcon,
  },
}

function getStatusConfig(status: string) {
  return statusConfig[status] || statusConfig.NEW
}

function formatTimeLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${t('companyDashboard.requests.today')}, ${hours}:${minutes}`
  }
  if (diffDays === 1) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${t('companyDashboard.requests.yesterday')}, ${hours}:${minutes}`
  }
  return date.toLocaleDateString('de-DE')
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function extractCity(address: string): string {
  const parts = address.split(',').map(p => p.trim())
  if (parts.length >= 2) return `${parts[0]}, ${parts[1]}`
  return address
}

// ─── Icons ───
function MailIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
    h('polyline', { points: '22,6 12,13 2,6' }),
  ])
}

function ClockIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('polyline', { points: '12 6 12 12 16 14' }),
  ])
}

function CheckCircleIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
    h('polyline', { points: '22 4 12 14.01 9 11.01' }),
  ])
}

function MessageCircleIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' }),
  ])
}

function HomeIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
    h('polyline', { points: '9 22 9 12 15 12 15 22' }),
  ])
}

function CalendarIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2' }),
    h('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
    h('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
    h('line', { x1: '3', y1: '10', x2: '21', y2: '10' }),
  ])
}

function MapPinIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }),
    h('circle', { cx: '12', cy: '10', r: '3' }),
  ])
}

function ArrowRightIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('line', { x1: '5', y1: '12', x2: '19', y2: '12' }),
    h('polyline', { points: '12 5 19 12 12 19' }),
  ])
}

function InboxIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '48', height: '48', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('polyline', { points: '22 12 16 12 14 15 10 15 8 12 2 12' }),
    h('path', { d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' }),
  ])
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">
        {{ t('companyDashboard.requests.title') }}
      </h2>
    </div>

    <!-- Skeleton loading -->
    <div v-if="companyStore.isLoading && requests.length === 0" class="divide-y divide-gray-100">
      <div
        v-for="n in 3"
        :key="n"
        class="px-6 py-5 flex items-center gap-4 animate-pulse"
      >
        <div class="shrink-0 h-7 w-24 bg-gray-200 rounded-full"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div class="shrink-0 h-9 w-28 bg-gray-200 rounded-lg"></div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="requests.length === 0" class="px-6 py-12 text-center">
      <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <InboxIcon class="text-gray-300" />
      </div>
      <p class="text-sm font-medium text-gray-900 mb-1">
        {{ t('companyDashboard.requests.emptyTitle') }}
      </p>
      <p class="text-sm text-gray-500">
        {{ t('companyDashboard.requests.empty') }}
      </p>
    </div>

    <!-- List -->
    <div v-else class="divide-y divide-gray-100">
      <div
        v-for="request in requests"
        :key="request.id"
        class="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:bg-gray-50/60 transition-colors"
      >
        <!-- Status badge -->
        <div class="shrink-0">
          <div
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
              getStatusConfig(request.status).bg,
              getStatusConfig(request.status).text,
            ]"
          >
            <component :is="getStatusConfig(request.status).icon" />
            {{ getStatusConfig(request.status).label }}
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900 truncate">
            {{ extractCity(request.originAddress) }}
            <span class="text-gray-400 mx-1">→</span>
            {{ extractCity(request.destinationAddress) }}
          </p>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
            <span class="flex items-center gap-1">
              <HomeIcon />
              {{ request.itemsSummary.totalItems }} {{ t('companyDashboard.requests.rooms') }}
            </span>
            <span class="flex items-center gap-1">
              <CalendarIcon />
              {{ formatDate(request.moveDate) }}
            </span>
            <span class="flex items-center gap-1">
              <MapPinIcon />
              — km
            </span>
          </div>
        </div>

        <!-- Time -->
        <div class="shrink-0 text-xs text-gray-400 hidden md:block">
          {{ formatTimeLabel(request.createdAt) }}
        </div>

        <!-- Action button -->
        <div class="shrink-0">
          <button
            class="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
          >
            {{ t('companyDashboard.requests.action.createOffer') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-6 py-3 border-t border-gray-100">
      <button class="text-sm font-medium text-secondary-600 hover:text-secondary-700 flex items-center gap-1 transition-colors">
        {{ t('companyDashboard.requests.showAll') }}
        <ArrowRightIcon />
      </button>
    </div>
  </div>
</template>
