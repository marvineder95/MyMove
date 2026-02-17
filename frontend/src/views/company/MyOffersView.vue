<template>
  <div>
    <h1 class="text-h4 mb-6">Meine Angebote</h1>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" class="mb-4">
      <v-tab value="all">Alle</v-tab>
      <v-tab value="draft">Entwürfe</v-tab>
      <v-tab value="submitted">Eingereicht</v-tab>
      <v-tab value="accepted">Angenommen</v-tab>
      <v-tab value="rejected">Abgelehnt</v-tab>
    </v-tabs>

    <v-card>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="filteredOffers"
          :loading="loading"
          hover
        >
          <template #item.totalPrice="{ item }">
            <span class="text-h6 font-weight-bold">
              € {{ item.totalPrice.toFixed(2) }}
            </span>
          </template>

          <template #item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
            >
              {{ getStatusLabel(item.status) }}
            </v-chip>
          </template>

          <template #item.createdAt="{ item }">
            {{ new Date(item.createdAt).toLocaleDateString('de-AT') }}
          </template>

          <template #item.validity="{ item }">
            {{ item.validityDays }} Tage
          </template>

          <template #item.actions="{ item }">
            <v-btn
              v-if="item.status === 'DRAFT'"
              color="primary"
              size="small"
              @click="submitOffer(item)"
            >
              Einreichen
            </v-btn>
            <v-btn
              v-else
              variant="text"
              size="small"
              :to="`/customer/offers/${item.offerId}`"
            >
              Details
            </v-btn>
          </template>

          <template #no-data>
            <div class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-file-document-outline
              </v-icon>
              <h3 class="text-h6 mb-2">Keine Angebote</h3>
              <p class="text-body-1 text-medium-emphasis mb-4">
                Sie haben noch keine Angebote eingereicht.
              </p>
              <v-btn color="primary" to="/company">
                Zu den Anfragen
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCompanyStore } from '@/stores'
import { FinalOfferStatus, type FinalOfferResponse } from '@/types'

const companyStore = useCompanyStore()

const activeTab = ref('all')
const headers = [
  { title: 'Preis', key: 'totalPrice' },
  { title: 'Status', key: 'status' },
  { title: 'Erstellt', key: 'createdAt' },
  { title: 'Gültigkeit', key: 'validity' },
  { title: '', key: 'actions', sortable: false }
]

const loading = computed(() => companyStore.loading)
const myFinalOffers = computed(() => companyStore.myFinalOffers)

const filteredOffers = computed(() => {
  if (activeTab.value === 'all') {
    return myFinalOffers.value
  }
  return myFinalOffers.value.filter(o => 
    o.status.toLowerCase() === activeTab.value
  )
})

onMounted(async () => {
  try {
    await companyStore.loadMyOffers('mock-company-id')
  } catch (err) {
    console.error('Failed to load offers:', err)
  }
})

function getStatusColor(status: FinalOfferStatus): string {
  const colors: Record<string, string> = {
    [FinalOfferStatus.DRAFT]: 'grey',
    [FinalOfferStatus.SUBMITTED]: 'primary',
    [FinalOfferStatus.ACCEPTED]: 'success',
    [FinalOfferStatus.REJECTED]: 'error',
    [FinalOfferStatus.EXPIRED]: 'warning'
  }
  return colors[status] || 'grey'
}

function getStatusLabel(status: FinalOfferStatus): string {
  const labels: Record<string, string> = {
    [FinalOfferStatus.DRAFT]: 'Entwurf',
    [FinalOfferStatus.SUBMITTED]: 'Eingereicht',
    [FinalOfferStatus.ACCEPTED]: 'Angenommen',
    [FinalOfferStatus.REJECTED]: 'Abgelehnt',
    [FinalOfferStatus.EXPIRED]: 'Abgelaufen'
  }
  return labels[status] || status
}

async function submitOffer(offer: FinalOfferResponse) {
  try {
    await companyStore.submitFinalOffer(offer.id, 'mock-company-id')
  } catch (err) {
    console.error('Failed to submit offer:', err)
  }
}
</script>
