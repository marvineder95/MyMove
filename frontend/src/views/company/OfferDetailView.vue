<template>
  <div>
    <v-btn
      variant="text"
      to="/company"
      prepend-icon="mdi-arrow-left"
      class="mb-4"
    >
      Zurück zum Dashboard
    </v-btn>

    <h1 class="text-h4 mb-6">
      Umzugsanfrage #{{ offerId?.slice(0, 8) }}
    </h1>

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

    <template v-else-if="selectedOffer">
      <v-row>
        <!-- Left Column: Move Details -->
        <v-col cols="12" lg="8">
          <!-- Move Info -->
          <v-card class="mb-6">
            <v-card-title>Umzugsdetails</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <h4 class="text-subtitle-2 mb-2 text-medium-emphasis">Von</h4>
                  <p class="text-body-1">
                    <strong>{{ selectedOffer.fromCity }}</strong>
                  </p>
                  <p class="text-body-2">
                    Stockwerk: {{ selectedOffer.fromFloor }}<br>
                    Fahrstuhl: {{ selectedOffer.fromHasElevator ? 'Ja' : 'Nein' }}
                  </p>
                </v-col>

                <v-col cols="12" md="6">
                  <h4 class="text-subtitle-2 mb-2 text-medium-emphasis">Nach</h4>
                  <p class="text-body-1">
                    <strong>{{ selectedOffer.toCity }}</strong>
                  </p>
                  <p class="text-body-2">
                    Stockwerk: {{ selectedOffer.toFloor }}<br>
                    Fahrstuhl: {{ selectedOffer.toHasElevator ? 'Ja' : 'Nein' }}
                  </p>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <v-row>
                <v-col cols="12" md="6">
                  <p class="text-body-1">
                    <strong>Umzugsdatum:</strong><br>
                    {{ selectedOffer.moveDate ? new Date(selectedOffer.moveDate).toLocaleDateString('de-AT') : 'Nicht angegeben' }}
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Inventory -->
          <v-card class="mb-6">
            <v-card-title class="d-flex align-center">
              Inventar
              <v-spacer />
              <v-btn
                variant="text"
                size="small"
                :loading="loadingInventory"
                @click="loadInventory"
              >
                <v-icon start>mdi-refresh</v-icon>
                Aktualisieren
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-data-table
                v-if="selectedOfferInventory"
                :headers="inventoryHeaders"
                :items="selectedOfferInventory.items"
                density="compact"
              >
                <template #item.source="{ item }">
                  <v-chip
                    size="x-small"
                    :color="item.source === 'AI_DETECTED' ? 'info' : 'grey'"
                  >
                    {{ item.source === 'AI_DETECTED' ? 'KI' : 'Manuell' }}
                  </v-chip>
                </template>

                <template #bottom>
                  <div class="pa-4 d-flex justify-end">
                    <strong>Gesamtvolumen: {{ selectedOfferInventory.totalVolume.toFixed(2) }} m³</strong>
                  </div>
                </template>
              </v-data-table>

              <div v-else class="text-center py-8">
                <v-btn
                  color="primary"
                  :loading="loadingInventory"
                  @click="loadInventory"
                >
                  Inventar laden
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column: Pricing & Actions -->
        <v-col cols="12" lg="4">
          <!-- Price Estimate -->
          <v-card class="mb-6" v-if="selectedOffer.priceEstimate">
            <v-card-title class="text-h6">Preisschätzung</v-card-title>
            <v-card-text>
              <div class="text-center mb-4">
                <div class="text-h3 font-weight-bold text-success">
                  € {{ selectedOffer.priceEstimate.totalPrice.toFixed(2) }}
                </div>
                <p class="text-caption text-medium-emphasis">
                  Geschätzte Arbeitszeit: {{ selectedOffer.priceEstimate.estimatedHours.toFixed(1) }} h
                </p>
              </div>

              <v-divider class="my-4" />

              <h4 class="text-subtitle-2 mb-2">Kostenaufstellung</h4>
              <v-list density="compact">
                <v-list-item>
                  <template #prepend>Grundgebühr</template>
                  <template #append>€ {{ selectedOffer.priceEstimate.breakdown.baseFee.toFixed(2) }}</template>
                </v-list-item>
                <v-list-item>
                  <template #prepend>Anfahrt</template>
                  <template #append>€ {{ selectedOffer.priceEstimate.breakdown.travelFee.toFixed(2) }}</template>
                </v-list-item>
                <v-list-item>
                  <template #prepend>Arbeitskosten</template>
                  <template #append>€ {{ selectedOffer.priceEstimate.breakdown.laborCost.toFixed(2) }}</template>
                </v-list-item>
                <v-list-item>
                  <template #prepend>Volumenkosten</template>
                  <template #append>€ {{ selectedOffer.priceEstimate.breakdown.volumeCost.toFixed(2) }}</template>
                </v-list-item>
                <v-list-item v-if="selectedOffer.priceEstimate.breakdown.floorSurcharge > 0">
                  <template #prepend>Stockwerkzuschlag</template>
                  <template #append>€ {{ selectedOffer.priceEstimate.breakdown.floorSurcharge.toFixed(2) }}</template>
                </v-list-item>
              </v-list>

              <v-divider class="my-4" />

              <div class="d-flex justify-space-between text-h6">
                <span>Gesamt</span>
                <span>€ {{ selectedOffer.priceEstimate.breakdown.total.toFixed(2) }}</span>
              </div>
            </v-card-text>
          </v-card>

          <!-- Calculate Estimate Button -->
          <v-card v-else class="mb-6">
            <v-card-text class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-calculator
              </v-icon>
              <h3 class="text-h6 mb-2">Noch keine Schätzung</h3>
              <p class="text-body-2 text-medium-emphasis mb-4">
                Berechnen Sie eine Preisschätzung basierend auf Ihren Konditionen.
              </p>
              <v-btn
                color="primary"
                :loading="calculating"
                @click="calculateEstimate"
              >
                Schätzung berechnen
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Final Offer Actions -->
          <v-card v-if="selectedOffer.canSubmitFinalOffer">
            <v-card-title>Finale Offerte</v-card-title>
            <v-card-text>
              <v-alert
                v-if="currentFinalOffer?.status === 'SUBMITTED'"
                type="success"
                variant="tonal"
                class="mb-4"
              >
                Offerte wurde eingereicht!
              </v-alert>

              <template v-else>
                <v-text-field
                  v-model.number="finalOfferPrice"
                  label="Endpreis (€)"
                  type="number"
                  prefix="€"
                  class="mb-4"
                />

                <v-text-field
                  v-model.number="finalOfferValidityDays"
                  label="Gültigkeit (Tage)"
                  type="number"
                  min="1"
                  max="30"
                  suffix="Tage"
                  class="mb-4"
                />

                <v-textarea
                  v-model="finalOfferNotes"
                  label="Notizen (optional)"
                  rows="3"
                  class="mb-4"
                />

                <v-checkbox
                  v-model="acceptCalculatedPrice"
                  label="Berechnete Schätzung übernehmen"
                  class="mb-4"
                />
              </template>
            </v-card-text>

            <v-card-actions>
              <v-btn
                v-if="currentFinalOffer?.status !== 'SUBMITTED'"
                color="primary"
                block
                :loading="submitting"
                :disabled="!canSubmit"
                @click="submitFinalOffer"
              >
                Offerte einreichen
              </v-btn>
            </v-card-actions>
          </v-card>

          <v-card v-else class="text-center pa-6">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">
              mdi-lock
            </v-icon>
            <p class="text-body-2 text-medium-emphasis">
              Offerte kann noch nicht eingereicht werden
            </p>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Not Found -->
    <v-card v-else class="pa-8 text-center">
      <v-icon size="64" color="error" class="mb-4">mdi-alert</v-icon>
      <h3 class="text-h6 mb-2">Anfrage nicht gefunden</h3>
      <v-btn color="primary" to="/company">Zurück zum Dashboard</v-btn>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCompanyStore } from '@/stores'
import type { InventoryItemResponse, InventoryResponse } from '@/types'

const props = defineProps<{
  id: string
}>()

const route = useRoute()
const companyStore = useCompanyStore()

const offerId = ref(props.id || (route.params.id as string))
const loading = ref(false)
const loadingInventory = ref(false)
const calculating = ref(false)
const submitting = ref(false)

const selectedOffer = computed(() => companyStore.selectedOffer)
const selectedOfferInventory = computed(() => companyStore.selectedOfferInventory)
const currentFinalOffer = computed(() => companyStore.currentFinalOffer)

const finalOfferPrice = ref(0)
const finalOfferValidityDays = ref(7)
const finalOfferNotes = ref('')
const acceptCalculatedPrice = ref(true)

const canSubmit = computed(() => {
  if (acceptCalculatedPrice.value && selectedOffer.value?.priceEstimate) {
    return true
  }
  return finalOfferPrice.value > 0 && finalOfferValidityDays.value > 0
})

const inventoryHeaders = [
  { title: 'Gegenstand', key: 'name' },
  { title: 'Anzahl', key: 'quantity', align: 'center' as const },
  { title: 'Quelle', key: 'source' },
  { title: 'Volumen (m³)', key: 'totalVolume', align: 'right' as const }
]

onMounted(async () => {
  loading.value = true
  
  try {
    await companyStore.loadOfferDetails(offerId.value)
    
    if (selectedOffer.value?.priceEstimate) {
      finalOfferPrice.value = selectedOffer.value.priceEstimate.totalPrice
    }
  } catch (err) {
    console.error('Failed to load offer:', err)
  } finally {
    loading.value = false
  }
})

async function loadInventory() {
  loadingInventory.value = true
  
  try {
    await companyStore.loadOfferInventory(offerId.value)
  } catch (err) {
    console.error('Failed to load inventory:', err)
  } finally {
    loadingInventory.value = false
  }
}

async function calculateEstimate() {
  calculating.value = true
  
  try {
    // Mock company ID for demo
    await companyStore.calculateEstimate('mock-company-id', offerId.value)
  } catch (err) {
    console.error('Failed to calculate estimate:', err)
  } finally {
    calculating.value = false
  }
}

async function submitFinalOffer() {
  submitting.value = true
  
  try {
    const request = acceptCalculatedPrice.value
      ? {
          acceptEstimatePrice: true,
          validityDays: finalOfferValidityDays.value,
          notes: finalOfferNotes.value || undefined
        }
      : {
          totalPrice: finalOfferPrice.value,
          validityDays: finalOfferValidityDays.value,
          notes: finalOfferNotes.value || undefined
        }
    
    await companyStore.createDraftOffer(offerId.value, 'mock-company-id', request)
    
    // Submit immediately
    if (companyStore.currentFinalOffer) {
      await companyStore.submitFinalOffer(
        companyStore.currentFinalOffer.id,
        'mock-company-id'
      )
    }
  } catch (err) {
    console.error('Failed to submit offer:', err)
  } finally {
    submitting.value = false
  }
}
</script>
