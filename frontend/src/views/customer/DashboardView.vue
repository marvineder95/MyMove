<template>
  <div>
    <h1 class="text-h4 mb-6">Meine Umzüge</h1>

    <!-- Welcome Card -->
    <v-card class="mb-6" color="primary" variant="tonal">
      <v-card-text class="pa-6">
        <div class="d-flex align-center">
          <v-icon size="48" class="mr-4">mdi-hand-wave</v-icon>
          <div>
            <h2 class="text-h5 mb-1">Willkommen zurück!</h2>
            <p class="mb-0">
              Verwalten Sie Ihre Umzugsanfragen oder starten Sie einen neuen Umzug.
            </p>
          </div>
          <v-spacer />
          <v-btn
            color="primary"
            to="/customer/wizard"
            prepend-icon="mdi-plus"
          >
            Neuer Umzug
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- No Requests State -->
    <v-card v-if="!loading && !offers.length" class="text-center pa-8">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">
        mdi-package-variant-closed
      </v-icon>
      <h3 class="text-h6 mb-2">Noch keine Umzüge</h3>
      <p class="text-body-1 text-medium-emphasis mb-4">
        Starten Sie Ihren ersten Umzug und erhalten Sie Angebote von geprüften Firmen.
      </p>
      <v-btn
        color="primary"
        to="/customer/wizard"
        prepend-icon="mdi-arrow-right"
      >
        Umzug starten
      </v-btn>
    </v-card>

    <!-- Offers List -->
    <div v-else>
      <h2 class="text-h6 mb-4">Aktuelle Anfragen</h2>
      
      <v-row>
        <v-col
          v-for="offer in offers"
          :key="offer.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            :to="`/customer/offers/${offer.id}`"
            hover
          >
            <v-card-item>
              <template #prepend>
                <v-icon
                  size="32"
                  :color="getStatusColor(offer.status)"
                >
                  {{ getStatusIcon(offer.status) }}
                </v-icon>
              </template>
              <v-card-title>Umzugsanfrage #{{ offer.id.slice(0, 8) }}</v-card-title>
              <v-card-subtitle>
                Erstellt am {{ formatDate(offer.createdAt) }}
              </v-card-subtitle>
            </v-card-item>

            <v-card-text>
              <v-chip
                :color="getStatusColor(offer.status)"
                size="small"
                class="mb-2"
              >
                {{ getStatusLabel(offer.status) }}
              </v-chip>

              <p class="text-body-2 text-medium-emphasis mb-0">
                <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                {{ getOfferDescription(offer) }}
              </p>
            </v-card-text>

            <v-card-actions>
              <v-btn
                variant="text"
                color="primary"
                :to="`/customer/offers/${offer.id}`"
              >
                Details
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Loading State -->
    <v-card v-if="loading" class="pa-8 text-center">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        class="mb-4"
      />
      <p>Lade Umzüge...</p>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { OfferStatus, type OfferResponse } from '@/types'

const loading = ref(false)
const offers = ref<OfferResponse[]>([])

// Mock data for now - in production this would come from an API
onMounted(async () => {
  loading.value = true
  // TODO: Load actual offers from backend
  // For now, we show an empty state
  offers.value = []
  loading.value = false
})

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-AT')
}

function getStatusColor(status: OfferStatus): string {
  const colors: Record<string, string> = {
    [OfferStatus.DRAFT]: 'grey',
    [OfferStatus.INVENTORY_PENDING]: 'warning',
    [OfferStatus.INVENTORY_CONFIRMED]: 'info',
    [OfferStatus.ESTIMATES_READY]: 'success',
    [OfferStatus.FINAL_OFFER_SUBMITTED]: 'primary',
    [OfferStatus.ACCEPTED]: 'success',
    [OfferStatus.REJECTED]: 'error'
  }
  return colors[status] || 'grey'
}

function getStatusIcon(status: OfferStatus): string {
  const icons: Record<string, string> = {
    [OfferStatus.DRAFT]: 'mdi-pencil',
    [OfferStatus.INVENTORY_PENDING]: 'mdi-clock',
    [OfferStatus.INVENTORY_CONFIRMED]: 'mdi-check-circle',
    [OfferStatus.ESTIMATES_READY]: 'mdi-calculator',
    [OfferStatus.FINAL_OFFER_SUBMITTED]: 'mdi-send',
    [OfferStatus.ACCEPTED]: 'mdi-check-decagram',
    [OfferStatus.REJECTED]: 'mdi-close-circle'
  }
  return icons[status] || 'mdi-help'
}

function getStatusLabel(status: OfferStatus): string {
  const labels: Record<string, string> = {
    [OfferStatus.DRAFT]: 'Entwurf',
    [OfferStatus.INVENTORY_PENDING]: 'Inventar wird erstellt',
    [OfferStatus.INVENTORY_CONFIRMED]: 'Inventar bestätigt',
    [OfferStatus.ESTIMATES_READY]: 'Schätzungen verfügbar',
    [OfferStatus.FINAL_OFFER_SUBMITTED]: 'Angebot eingegangen',
    [OfferStatus.ACCEPTED]: 'Angenommen',
    [OfferStatus.REJECTED]: 'Abgelehnt'
  }
  return labels[status] || status
}

function getOfferDescription(offer: OfferResponse): string {
  // This would show from/to cities if available
  return 'Details ansehen →'
}
</script>
