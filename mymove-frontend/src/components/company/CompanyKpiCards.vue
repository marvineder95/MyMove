<script setup lang="ts">
import { computed, h } from 'vue'
import { useCompanyStore } from '@/stores/company'
import { useI18n } from 'vue-i18n'

const companyStore = useCompanyStore()
const { t } = useI18n()

const kpis = computed(() => {
  const d = companyStore.dashboard
  if (!d) return []

  return [
    {
      key: 'openRequests',
      label: t('companyDashboard.kpi.openRequests'),
      value: d.kpis.openRequests,
      trend: d.trends.openRequests,
      icon: MailIcon,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      key: 'sentOffers',
      label: t('companyDashboard.kpi.sentOffers'),
      value: d.kpis.sentOffers,
      trend: d.trends.sentOffers,
      icon: SendIcon,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      key: 'confirmedOrders',
      label: t('companyDashboard.kpi.confirmedOrders'),
      value: d.kpis.confirmedOrders,
      trend: d.trends.confirmedOrders,
      icon: CheckCircleIcon,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      key: 'averageRating',
      label: t('companyDashboard.kpi.averageRating'),
      value: Number(d.kpis.averageRating).toFixed(1),
      trend: d.trends.rating,
      icon: StarIcon,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      isRating: true,
      rating: d.kpis.averageRating,
    },
  ]
})

function MailIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
    h('polyline', { points: '22,6 12,13 2,6' }),
  ])
}

function SendIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('line', { x1: '22', y1: '2', x2: '11', y2: '13' }),
    h('polygon', { points: '22 2 15 22 11 13 2 9 22 2' }),
  ])
}

function CheckCircleIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
    h('polyline', { points: '22 4 12 14.01 9 11.01' }),
  ])
}

function StarIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '20', height: '20', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' }),
  ])
}

function TrendUpIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('polyline', { points: '23 6 13.5 15.5 8.5 10.5 1 18' }),
    h('polyline', { points: '17 6 23 6 23 12' }),
  ])
}

function TrendDownIcon() {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
    h('polyline', { points: '23 18 13.5 8.5 8.5 13.5 1 6' }),
    h('polyline', { points: '17 18 23 18 23 12' }),
  ])
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <!-- Loading skeletons -->
    <template v-if="companyStore.isLoading && !companyStore.dashboard">
      <div
        v-for="n in 4"
        :key="n"
        class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="h-4 bg-gray-200 rounded w-28"></div>
          <div class="h-10 w-10 bg-gray-200 rounded-xl"></div>
        </div>
        <div class="h-8 bg-gray-200 rounded w-16 mb-3"></div>
        <div class="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    </template>

    <div
      v-for="kpi in kpis"
      :key="kpi.key"
      class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-shadow hover:shadow-md"
    >
      <div class="flex items-start justify-between mb-4">
        <span class="text-sm text-gray-500 font-medium">{{ kpi.label }}</span>
        <div :class="['p-2.5 rounded-xl', kpi.iconBg, kpi.iconColor]">
          <component :is="kpi.icon" />
        </div>
      </div>

      <div class="flex items-end gap-2 mb-2">
        <span class="text-3xl font-bold text-gray-900">{{ kpi.value }}</span>
        <div
          v-if="!kpi.isRating && kpi.trend !== 0"
          :class="[
            'flex items-center gap-0.5 text-xs font-medium mb-1 px-1.5 py-0.5 rounded-full',
            kpi.trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700',
          ]"
        >
          <component :is="kpi.trend >= 0 ? TrendUpIcon : TrendDownIcon" />
          <span>{{ Math.abs(kpi.trend) }}%</span>
        </div>
      </div>

      <!-- Star rating for averageRating card -->
      <div v-if="kpi.isRating" class="flex items-center gap-1 mb-2">
        <svg
          v-for="n in 5"
          :key="n"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          :fill="n <= Math.round(kpi.rating || 0) ? '#F59E0B' : '#E5E7EB'"
          stroke="none"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>

      <p class="text-xs text-gray-400">{{ t('companyDashboard.kpi.vsLastWeek') }}</p>
    </div>
  </div>
</template>
