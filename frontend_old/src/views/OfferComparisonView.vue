<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          {{ $t('offers.comparison.title') }}
        </h1>
        <p class="mt-2 text-gray-600">
          {{ $t('offers.comparison.subtitle') }}
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-700">{{ error }}</p>
        <Button @click="loadOffers" variant="secondary" class="mt-2">
          {{ $t('common.retry') }}
        </Button>
      </div>

      <!-- Best Offer Banner -->
      <div v-else-if="bestOffer" class="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 mb-8 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-100 text-sm font-medium uppercase tracking-wide">
              {{ $t('offers.comparison.bestOffer') }}
            </p>
            <p class="text-3xl font-bold mt-1">
              {{ formatPrice(bestOffer.totalPrice) }}
            </p>
            <p class="text-green-100 mt-1">
              {{ bestOffer.validityDays }} Tage gültig
            </p>
          </div>
          <Button 
            @click="acceptOffer(bestOffer.id)" 
            variant="white"
            size="lg"
            :loading="acceptingId === bestOffer.id"
          >
            {{ $t('offers.comparison.accept') }}
          </Button>
        </div>
      </div>

      <!-- Offers Grid -->
      <div v-if="submittedOffers.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="offer in submittedOffers"
          :key="offer.id"
          :class="{ 'ring-2 ring-green-500': offer.id === bestOffer?.id }"
          class="relative"
        >
          <!-- Best Badge -->
          <div v-if="offer.id === bestOffer?.id" class="absolute -top-3 left-4">
            <span class="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              BESTER PREIS
            </span>
          </div>

          <div class="p-6">
            <!-- Company Info -->
            <div class="flex items-center mb-4">
              <div class="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-gray-500">Firma #{{ offer.companyId.substring(0, 8) }}</p>
              </div>
            </div>

            <!-- Price -->
            <div class="mb-4">
              <p class="text-3xl font-bold text-gray-900">
                {{ formatPrice(offer.totalPrice) }}
              </p>
              <p v-if="offer.breakdown" class="text-sm text-gray-500 mt-1">
                Inkl. {{ Object.keys(offer.breakdown.details).length }} Positionen
              </p>
            </div>

            <!-- Breakdown -->
            <div v-if="offer.breakdown" class="border-t border-gray-200 pt-4 mb-4">
              <p class="text-sm font-medium text-gray-900 mb-2">Preisaufschlüsselung:</p>
              <ul class="text-sm text-gray-600 space-y-1">
                <li class="flex justify-between">
                  <span>Anfahrt:</span>
                  <span>{{ formatPrice(offer.breakdown.travelFee) }}</span>
                </li>
                <li class="flex justify-between">
                  <span>Arbeitszeit:</span>
                  <span>{{ formatPrice(offer.breakdown.laborCost) }}</span>
                </li>
                <li class="flex justify-between">
                  <span>Volumen:</span>
                  <span>{{ formatPrice(offer.breakdown.volumeCost) }}</span>
                </li>
                <li v-if="offer.breakdown.floorSurcharge > 0" class="flex justify-between">
                  <span>Stockwerk:</span>
                  <span>{{ formatPrice(offer.breakdown.floorSurcharge) }}</span>
                </li>
              </ul>
            </div>

            <!-- Validity & Notes -->
            <div class="border-t border-gray-200 pt-4 mb-4">
              <p class="text-sm text-gray-600">
                <span class="font-medium">Gültig für:</span> {{ offer.validityDays }} Tage
              </p>
              <p v-if="offer.notes" class="text-sm text-gray-600 mt-2">
                <span class="font-medium">Hinweise:</span> {{ offer.notes }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex space-x-2">
              <Button
                @click="acceptOffer(offer.id)"
                variant="primary"
                class="flex-1"
                :loading="acceptingId === offer.id"
              >
                {{ $t('offers.comparison.accept') }}
              </Button>
              <Button
                @click="rejectOffer(offer.id)"
                variant="secondary"
                :loading="rejectingId === offer.id"
              >
                {{ $t('offers.comparison.reject') }}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading && !error" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Noch keine Angebote</h3>
        <p class="mt-1 text-sm text-gray-500">
          Die Firmen arbeiten noch an Ihren Angeboten. Bitte haben Sie etwas Geduld.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePricingStore } from '../stores/pricing'
import { storeToRefs } from 'pinia'
import Card from '../components/UI/Card.vue'
import Button from '../components/UI/Button.vue'
import LoadingSpinner from '../components/UI/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const pricingStore = usePricingStore()

const { submittedOffers, bestOffer, loading, error } = storeToRefs(pricingStore)

const acceptingId = ref<string | null>(null)
const rejectingId = ref<string | null>(null)

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

const loadOffers = async () => {
  const offerId = route.params.offerId as string
  if (offerId) {
    await pricingStore.fetchFinalOffersForOffer(offerId)
  }
}

const acceptOffer = async (finalOfferId: string) => {
  acceptingId.value = finalOfferId
  try {
    await pricingStore.acceptFinalOffer(finalOfferId)
    alert('Angebot angenommen! Sie werden zur Bestätigung weitergeleitet.')
    router.push('/dashboard')
  } finally {
    acceptingId.value = null
  }
}

const rejectOffer = async (finalOfferId: string) => {
  const reason = prompt('Möchten Sie dem Anbieter mitteilen, warum Sie das Angebot ablehnen? (Optional)')
  
  rejectingId.value = finalOfferId
  try {
    await pricingStore.rejectFinalOffer(finalOfferId, reason || undefined)
    alert('Angebot abgelehnt.')
  } finally {
    rejectingId.value = null
  }
}

onMounted(() => {
  loadOffers()
})
</script>
