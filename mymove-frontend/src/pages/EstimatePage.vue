<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">{{ t('estimate.title') }}</h1>

    <div class="card mb-6">
      <form @submit.prevent="calculate" class="flex gap-4 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('estimate.distance') }}</label>
          <input v-model.number="distanceKm" type="number" min="1" step="0.1" required class="w-full" />
        </div>
        <button type="submit" class="btn-primary" :disabled="requestStore.isLoading">
          {{ requestStore.isLoading ? t('common.loading') : t('estimate.calculate') }}
        </button>
      </form>
    </div>

    <div v-if="requestStore.estimate" class="space-y-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div class="card text-center">
          <p class="text-lg font-bold text-blue-600">{{ requestStore.estimate.inventorySummary.totalItems }}</p>
          <p class="text-xs text-gray-500">Items</p>
        </div>
        <div class="card text-center">
          <p class="text-lg font-bold text-blue-600">{{ requestStore.estimate.inventorySummary.totalVolume }} m³</p>
          <p class="text-xs text-gray-500">Volume</p>
        </div>
        <div class="card text-center">
          <p class="text-lg font-bold text-blue-600">{{ requestStore.estimate.inventorySummary.totalWeight }} kg</p>
          <p class="text-xs text-gray-500">Weight</p>
        </div>
        <div class="card text-center">
          <p class="text-lg font-bold text-blue-600">{{ requestStore.estimate.distanceKm }} km</p>
          <p class="text-xs text-gray-500">Distance</p>
        </div>
      </div>

      <div v-if="requestStore.estimate.estimates.length === 0" class="card text-center py-8">
        <p class="text-gray-500">{{ t('estimate.noCompanies') }}</p>
      </div>

      <div
        v-for="est in requestStore.estimate.estimates"
        :key="est.companyId"
        class="card"
      >
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 class="font-bold text-lg">{{ est.companyName }}</h3>
            <p class="text-3xl font-bold text-blue-600">€{{ est.estimatedPrice.toFixed(2) }}</p>
          </div>

          <div class="text-sm text-gray-600 space-y-1">
            <div class="flex justify-between gap-8">
              <span>{{ t('estimate.baseFee') }}:</span>
              <span>€{{ est.breakdown.baseFee.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between gap-8">
              <span>{{ t('estimate.labor') }}:</span>
              <span>€{{ est.breakdown.laborCost.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between gap-8">
              <span>{{ t('estimate.distanceCost') }}:</span>
              <span>€{{ est.breakdown.distanceCost.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between gap-8">
              <span>{{ t('estimate.extras') }}:</span>
              <span>€{{ est.breakdown.extrasCost.toFixed(2) }}</span>
            </div>
          </div>

          <div class="text-sm text-gray-500">
            <p>{{ est.calculationDetails.estimatedHours }} {{ t('estimate.hours') }}</p>
            <p>{{ t('estimate.teamSize') }}: {{ est.calculationDetails.teamSize }}</p>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <RouterLink :to="`/moves/${requestId}/offers`" class="btn-primary">
          {{ t('dashboard.offers') }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRequestStore } from '@/stores/request'

const { t } = useI18n()
const route = useRoute()
const requestStore = useRequestStore()
const requestId = Number(route.params.id)

const distanceKm = ref(10)

onMounted(() => {
  requestStore.clearEstimate()
})

async function calculate() {
  await requestStore.fetchEstimate(requestId, distanceKm.value)
}
</script>
