<template>
  <div>
    <h1 class="text-h4 mb-6">Firmen-Dashboard</h1>

    <!-- Status Alert -->
    <v-alert
      v-if="isPending"
      type="warning"
      variant="tonal"
      class="mb-6"
      title="Genehmigung ausstehend"
    >
      Ihre Registrierung wird derzeit von unserem Team geprüft. 
      Sie erhalten eine E-Mail sobald Ihre Firma freigeschaltet wurde.
    </v-alert>

    <v-alert
      v-if="isRejected"
      type="error"
      variant="tonal"
      class="mb-6"
      title="Registrierung abgelehnt"
    >
      <p class="mb-2">
        Ihre Registrierung wurde leider abgelehnt.
      </p>
      <p v-if="rejectionReason" class="mb-0">
        <strong>Grund:</strong> {{ rejectionReason }}
      </p>
    </v-alert>

    <v-alert
      v-if="isApproved"
      type="success"
      variant="tonal"
      class="mb-6"
      title="Firma freigeschaltet"
    >
      Ihre Firma wurde erfolgreich freigeschaltet. 
      Sie können nun auf eingehende Umzugsanfragen reagieren.
    </v-alert>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card color="primary" variant="tonal">
          <v-card-text class="d-flex align-center pa-4">
            <v-icon size="48" class="mr-4">mdi-inbox</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ availableOffers.length }}</div>
              <div class="text-body-2">Verfügbare Anfragen</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card color="success" variant="tonal">
          <v-card-text class="d-flex align-center pa-4">
            <v-icon size="48" class="mr-4">mdi-file-document</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ myFinalOffers.length }}</div>
              <div class="text-body-2">Meine Angebote</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card color="info" variant="tonal">
          <v-card-text class="d-flex align-center pa-4">
            <v-icon size="48" class="mr-4">mdi-check-decagram</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ acceptedOffersCount }}</div>
              <div class="text-body-2">Angenommene Angebote</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Available Offers Section -->
    <v-card v-if="isApproved">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-inbox-arrow-down</v-icon>
        Verfügbare Anfragen
        <v-spacer />
        <v-btn
          variant="text"
          icon="mdi-refresh"
          :loading="loading"
          @click="loadOffers"
        />
      </v-card-title>

      <v-card-text>
        <v-data-table
          :headers="offersHeaders"
          :items="availableOffers"
          :loading="loading"
          hover
        >
          <template #item.moveDate="{ item }">
            {{ item.moveDate ? new Date(item.moveDate).toLocaleDateString('de-AT') : '-' }}
          </template>

          <template #item.route="{ item }">
            {{ item.fromCity }} → {{ item.toCity }}
          </template>

          <template #item.floors="{ item }">
            {{ item.fromFloor }} → {{ item.toFloor }}
          </template>

          <template #item.elevator="{ item }">
            <v-icon
              size="small"
              :color="item.fromHasElevator ? 'success' : 'grey'"
            >
              {{ item.fromHasElevator ? 'mdi-check' : 'mdi-close' }}
            </v-icon>
            /
            <v-icon
              size="small"
              :color="item.toHasElevator ? 'success' : 'grey'"
            >
              {{ item.toHasElevator ? 'mdi-check' : 'mdi-close' }}
            </v-icon>
          </template>

          <template #item.priceEstimate="{ item }">
            <v-chip
              v-if="item.priceEstimate"
              color="success"
              size="small"
            >
              € {{ item.priceEstimate.totalPrice.toFixed(2) }}
            </v-chip>
            <v-chip
              v-else
              color="warning"
              size="small"
            >
              Keine Schätzung
            </v-chip>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              color="primary"
              size="small"
              :to="`/company/offers/${item.offerId}`"
            >
              Details
            </v-btn>
          </template>

          <template #no-data>
            <div class="text-center pa-4">
              <v-icon size="48" color="grey-lighten-1" class="mb-2">
                mdi-inbox-outline
              </v-icon>
              <p class="text-body-1 text-medium-emphasis">
                Keine verfügbaren Anfragen
              </p>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Pending Approval Info -->
    <v-card v-else-if="isPending" class="text-center pa-8">
      <v-icon size="96" color="warning" class="mb-4">
        mdi-clock-outline
      </v-icon>
      <h3 class="text-h5 mb-2">Genehmigung ausstehend</h3>
      <p class="text-body-1 text-medium-emphasis">
        Ihre Registrierung wird derzeit geprüft. 
        Dies kann bis zu 2 Werktage dauern.
      </p>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCompanyStore } from '@/stores'
import { FinalOfferStatus } from '@/types'

const companyStore = useCompanyStore()

const offersHeaders = [
  { title: 'Umzugsdatum', key: 'moveDate' },
  { title: 'Route', key: 'route' },
  { title: 'Stockwerke', key: 'floors' },
  { title: 'Fahrstuhl', key: 'elevator', align: 'center' as const },
  { title: 'Schätzung', key: 'priceEstimate' },
  { title: '', key: 'actions', sortable: false }
]

const loading = computed(() => companyStore.loading)
const isApproved = computed(() => companyStore.isApproved)
const isPending = computed(() => companyStore.isPending)
const isRejected = computed(() => companyStore.isRejected)
const rejectionReason = computed(() => companyStore.rejectionReason)
const availableOffers = computed(() => companyStore.availableOffers)
const myFinalOffers = computed(() => companyStore.myFinalOffers)

const acceptedOffersCount = computed(() => 
  myFinalOffers.value.filter(o => o.status === FinalOfferStatus.ACCEPTED).length
)

onMounted(async () => {
  if (isApproved.value) {
    await loadOffers()
  }
  
  // Load my offers
  await companyStore.loadMyOffers('mock-company-id')
})

async function loadOffers() {
  try {
    await companyStore.loadAvailableOffers()
  } catch (err) {
    console.error('Failed to load offers:', err)
  }
}
</script>
