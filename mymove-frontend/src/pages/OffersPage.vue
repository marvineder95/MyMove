<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">{{ t('offers.title') }}</h1>

    <div v-if="offerStore.isLoading" class="text-center py-8">{{ t('common.loading') }}</div>

    <div v-else-if="offerStore.offers.length === 0" class="card text-center py-8">
      <p class="text-gray-500">{{ t('offers.noOffers') }}</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="offer in offerStore.offers"
        :key="offer.id"
        class="card"
        :class="{
          'border-green-300 bg-green-50': offer.status === 'ACCEPTED',
          'border-red-300 bg-red-50': offer.status === 'REJECTED',
        }"
      >
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-bold">{{ offer.company?.companyName || t('offers.from') }}</h3>
              <span
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                :class="statusClass(offer.status)"
              >
                {{ offer.status }}
              </span>
            </div>
            <p class="text-2xl font-bold text-blue-600">€{{ offer.price.toFixed(2) }}</p>
            <p v-if="offer.message" class="text-sm text-gray-600 mt-1">{{ offer.message }}</p>
          </div>

          <div v-if="offer.status === 'SENT'" class="flex gap-2">
            <button
              @click="handleAccept(offer.id)"
              class="btn-primary"
              :disabled="offerStore.isLoading"
            >
              {{ t('offers.accept') }}
            </button>
            <button
              @click="handleReject(offer.id)"
              class="btn-secondary"
              :disabled="offerStore.isLoading"
            >
              {{ t('offers.reject') }}
            </button>
          </div>
        </div>

        <div v-if="offer.breakdown" class="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>{{ t('estimate.baseFee') }}: €{{ offer.breakdown.baseFee.toFixed(2) }}</div>
            <div>{{ t('estimate.labor') }}: €{{ offer.breakdown.laborCost.toFixed(2) }}</div>
            <div>{{ t('estimate.distanceCost') }}: €{{ offer.breakdown.distanceCost.toFixed(2) }}</div>
            <div>{{ t('estimate.extras') }}: €{{ offer.breakdown.extrasCost.toFixed(2) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useOfferStore } from '@/stores/offer'

const { t } = useI18n()
const route = useRoute()
const offerStore = useOfferStore()
const requestId = Number(route.params.id)

onMounted(() => {
  offerStore.fetchOffers(requestId)
})

async function handleAccept(offerId: number) {
  if (!confirm(t('offers.accept') + '?')) return
  await offerStore.acceptOffer(offerId)
}

async function handleReject(offerId: number) {
  if (!confirm(t('offers.reject') + '?')) return
  await offerStore.rejectOffer(offerId)
}

function statusClass(status: string): string {
  const map: Record<string, string> = {
    SENT: 'bg-blue-100 text-blue-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    DRAFT: 'bg-gray-100 text-gray-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}
</script>
