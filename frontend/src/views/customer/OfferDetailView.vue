<template>
  <div>
    <v-btn
      variant="text"
      to="/customer"
      prepend-icon="mdi-arrow-left"
      class="mb-4"
    >
      Zurück zur Übersicht
    </v-btn>

    <h1 class="text-h4 mb-6">Umzugsanfrage #{{ offerId?.slice(0, 8) }}</h1>

    <!-- Loading State -->
    <v-card v-if="loading" class="pa-8 text-center">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        class="mb-4"
      />
      <p>Lade Details...</p>
    </v-card>

    <template v-else>
      <!-- Status Card -->
      <v-card class="mb-6">
        <v-card-text>
          <div class="d-flex align-center">
            <v-icon
              size="48"
              :color="getStatusColor(offer?.status)"
              class="mr-4"
            >
              {{ getStatusIcon(offer?.status) }}
            </v-icon>
            <div>
              <p class="text-caption text-medium-emphasis mb-0">Status</p>
              <h2 class="text-h6">
                {{ getStatusLabel(offer?.status) }}
              </h2>
            </div>
            <v-spacer />
            <v-chip
              :color="getStatusColor(offer?.status)"
              size="large"
            >
              {{ offer?.status }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>

      <!-- Final Offers Section -->
      <v-card v-if="finalOffers.length > 0" class="mb-6">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="success">mdi-tag-multiple</v-icon>
          Angebote
          <v-spacer />
          <v-chip color="primary">{{ finalOffers.length }} Angebote</v-chip>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col
              v-for="offer in finalOffers"
              :key="offer.id"
              cols="12"
              md="6"
            >
              <v-card
                variant="outlined"
                :color="offer.status === 'ACCEPTED' ? 'success' : undefined"
              >
                <v-card-item>
                  <template #prepend>
                    <v-avatar color="primary" size="48">
                      <span class="text-h6 text-white">
                        {{ getCompanyInitials(offer.companyId) }}
                      </span>
                    </v-avatar>
                  </template>
                  <v-card-title>Firma #{{ offer.companyId.slice(0, 8) }}</v-card-title>
                  <v-card-subtitle>
                    Gültig für {{ offer.validityDays }} Tage
                  </v-card-subtitle>
                </v-card-item>

                <v-card-text>
                  <div class="text-h4 font-weight-bold text-primary mb-2">
                    € {{ offer.totalPrice.toFixed(2) }}
                  </div>

                  <p v-if="offer.notes" class="text-body-2 text-medium-emphasis mb-2">
                    {{ offer.notes }}
                  </p>

                  <v-chip
                    size="small"
                    :color="getFinalOfferStatusColor(offer.status)"
                  >
                    {{ getFinalOfferStatusLabel(offer.status) }}
                  </v-chip>
                </v-card-text>

                <v-card-actions v-if="offer.status === 'SUBMITTED'">
                  <v-btn
                    color="success"
                    variant="elevated"
                    @click="acceptOffer(offer.id)"
                  >
                    <v-icon start>mdi-check</v-icon>
                    Annehmen
                  </v-btn>
                  <v-btn
                    color="error"
                    variant="outlined"
                    @click="rejectOffer(offer.id)"
                  >
                    <v-icon start>mdi-close</v-icon>
                    Ablehnen
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- No Offers Yet -->
      <v-card v-else class="mb-6 text-center pa-8">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">
          mdi-clock-outline
        </v-icon>
        <h3 class="text-h6 mb-2">Noch keine Angebote</h3>
        <p class="text-body-1 text-medium-emphasis">
          Die Firmen arbeiten an Ihren Angeboten. Sie werden benachrichtigt, 
          sobald neue Angebote eingehen.
        </p>
      </v-card>

      <!-- Move Details -->
      <v-card class="mb-6">
        <v-card-title>Umzugsdetails</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <h4 class="text-subtitle-2 mb-2">Von</h4>
              <p class="text-body-1">
                {{ moveDetails.fromAddress?.street }} {{ moveDetails.fromAddress?.houseNumber }}<br>
                {{ moveDetails.fromAddress?.postalCode }} {{ moveDetails.fromAddress?.city }}<br>
                {{ moveDetails.fromAddress?.country }}
              </p>
              <p class="text-body-2 text-medium-emphasis mt-2">
                Stockwerk: {{ moveDetails.fromFloor?.floor }}<br>
                Fahrstuhl: {{ moveDetails.fromFloor?.hasElevator ? 'Ja' : 'Nein' }}
              </p>
            </v-col>
            <v-col cols="12" md="6">
              <h4 class="text-subtitle-2 mb-2">Nach</h4>
              <p class="text-body-1">
                {{ moveDetails.toAddress?.street }} {{ moveDetails.toAddress?.houseNumber }}<br>
                {{ moveDetails.toAddress?.postalCode }} {{ moveDetails.toAddress?.city }}<br>
                {{ moveDetails.toAddress?.country }}
              </p>
              <p class="text-body-2 text-medium-emphasis mt-2">
                Stockwerk: {{ moveDetails.toFloor?.floor }}<br>
                Fahrstuhl: {{ moveDetails.toFloor?.hasElevator ? 'Ja' : 'Nein' }}
              </p>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-row>
            <v-col cols="12" md="6">
              <p class="text-body-1">
                <strong>Umzugsdatum:</strong> {{ moveDetails.moveDate }}
              </p>
            </v-col>
            <v-col cols="12" md="6">
              <p class="text-body-1">
                <strong>Umzugskartons:</strong> 
                {{ moveDetails.needsBoxes ? `Ja (${moveDetails.boxesCount} Stück)` : 'Nein' }}
              </p>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="500">
      <v-card>
        <v-card-title>Angebot annehmen?</v-card-title>
        <v-card-text>
          Möchten Sie dieses Angebot wirklich annehmen? 
          Alle anderen Angebote werden automatisch abgelehnt.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showConfirmDialog = false">
            Abbrechen
          </v-btn>
          <v-btn
            color="success"
            :loading="actionLoading"
            @click="confirmAccept"
          >
            Bestätigen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { OfferStatus, FinalOfferStatus, type OfferResponse, type FinalOfferResponse } from '@/types'

const props = defineProps<{
  id: string
}>()

const route = useRoute()
const offerId = ref(props.id || (route.params.id as string))

const loading = ref(false)
const actionLoading = ref(false)
const showConfirmDialog = ref(false)
const selectedOfferId = ref('')

const offer = ref<OfferResponse | null>(null)
const finalOffers = ref<FinalOfferResponse[]>([])
const moveDetails = ref({
  fromAddress: { street: '', houseNumber: '', postalCode: '', city: '', country: '' },
  toAddress: { street: '', houseNumber: '', postalCode: '', city: '', country: '' },
  fromFloor: { floor: 0, hasElevator: false, needsNoParkingZone: false },
  toFloor: { floor: 0, hasElevator: false, needsNoParkingZone: false },
  moveDate: '',
  needsBoxes: false,
  boxesCount: 0
})

onMounted(async () => {
  loading.value = true
  
  // TODO: Load offer details from API
  // For now, mock data
  offer.value = {
    id: offerId.value,
    status: OfferStatus.ESTIMATES_READY,
    videoId: 'mock-video-id',
    createdAt: new Date().toISOString()
  }
  
  finalOffers.value = [
    {
      id: 'offer-1',
      offerId: offerId.value,
      companyId: 'company-1',
      totalPrice: 1250.00,
      validityDays: 14,
      notes: 'Inklusive Verpackungsmaterial',
      status: FinalOfferStatus.SUBMITTED,
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      isExpired: false
    },
    {
      id: 'offer-2',
      offerId: offerId.value,
      companyId: 'company-2',
      totalPrice: 1380.00,
      validityDays: 7,
      status: FinalOfferStatus.SUBMITTED,
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      isExpired: false
    }
  ]
  
  loading.value = false
})

function getStatusColor(status?: OfferStatus): string {
  const colors: Record<string, string> = {
    [OfferStatus.DRAFT]: 'grey',
    [OfferStatus.INVENTORY_PENDING]: 'warning',
    [OfferStatus.INVENTORY_CONFIRMED]: 'info',
    [OfferStatus.ESTIMATES_READY]: 'success',
    [OfferStatus.FINAL_OFFER_SUBMITTED]: 'primary',
    [OfferStatus.ACCEPTED]: 'success',
    [OfferStatus.REJECTED]: 'error'
  }
  return colors[status || ''] || 'grey'
}

function getStatusIcon(status?: OfferStatus): string {
  const icons: Record<string, string> = {
    [OfferStatus.DRAFT]: 'mdi-pencil',
    [OfferStatus.INVENTORY_PENDING]: 'mdi-clock',
    [OfferStatus.INVENTORY_CONFIRMED]: 'mdi-check-circle',
    [OfferStatus.ESTIMATES_READY]: 'mdi-calculator',
    [OfferStatus.FINAL_OFFER_SUBMITTED]: 'mdi-send',
    [OfferStatus.ACCEPTED]: 'mdi-check-decagram',
    [OfferStatus.REJECTED]: 'mdi-close-circle'
  }
  return icons[status || ''] || 'mdi-help'
}

function getStatusLabel(status?: OfferStatus): string {
  const labels: Record<string, string> = {
    [OfferStatus.DRAFT]: 'Entwurf',
    [OfferStatus.INVENTORY_PENDING]: 'Inventar wird erstellt',
    [OfferStatus.INVENTORY_CONFIRMED]: 'Inventar bestätigt',
    [OfferStatus.ESTIMATES_READY]: 'Schätzungen verfügbar',
    [OfferStatus.FINAL_OFFER_SUBMITTED]: 'Angebot eingegangen',
    [OfferStatus.ACCEPTED]: 'Angenommen',
    [OfferStatus.REJECTED]: 'Abgelehnt'
  }
  return labels[status || ''] || status
}

function getFinalOfferStatusColor(status: FinalOfferStatus): string {
  const colors: Record<string, string> = {
    [FinalOfferStatus.DRAFT]: 'grey',
    [FinalOfferStatus.SUBMITTED]: 'primary',
    [FinalOfferStatus.ACCEPTED]: 'success',
    [FinalOfferStatus.REJECTED]: 'error',
    [FinalOfferStatus.EXPIRED]: 'warning'
  }
  return colors[status] || 'grey'
}

function getFinalOfferStatusLabel(status: FinalOfferStatus): string {
  const labels: Record<string, string> = {
    [FinalOfferStatus.DRAFT]: 'Entwurf',
    [FinalOfferStatus.SUBMITTED]: 'Eingereicht',
    [FinalOfferStatus.ACCEPTED]: 'Angenommen',
    [FinalOfferStatus.REJECTED]: 'Abgelehnt',
    [FinalOfferStatus.EXPIRED]: 'Abgelaufen'
  }
  return labels[status] || status
}

function getCompanyInitials(companyId: string): string {
  return companyId.slice(0, 2).toUpperCase()
}

function acceptOffer(offerId: string) {
  selectedOfferId.value = offerId
  showConfirmDialog.value = true
}

async function confirmAccept() {
  actionLoading.value = true
  
  try {
    // TODO: Call API to accept offer
    console.log('Accepting offer:', selectedOfferId.value)
    
    // Update local state
    const offer = finalOffers.value.find(o => o.id === selectedOfferId.value)
    if (offer) {
      offer.status = FinalOfferStatus.ACCEPTED
    }
    
    showConfirmDialog.value = false
  } catch (err) {
    console.error('Failed to accept offer:', err)
  } finally {
    actionLoading.value = false
  }
}

async function rejectOffer(offerId: string) {
  actionLoading.value = true
  
  try {
    // TODO: Call API to reject offer
    console.log('Rejecting offer:', offerId)
    
    // Update local state
    const offer = finalOffers.value.find(o => o.id === offerId)
    if (offer) {
      offer.status = FinalOfferStatus.REJECTED
    }
  } catch (err) {
    console.error('Failed to reject offer:', err)
  } finally {
    actionLoading.value = false
  }
}
</script>
