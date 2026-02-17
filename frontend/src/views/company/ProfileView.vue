<template>
  <div>
    <h1 class="text-h4 mb-6">Firmenprofil</h1>

    <v-row>
      <!-- Company Status -->
      <v-col cols="12" md="4">
        <v-card class="mb-6">
          <v-card-title>Status</v-card-title>
          <v-card-text class="text-center py-6">
            <v-icon
              size="64"
              :color="statusColor"
              class="mb-4"
            >
              {{ statusIcon }}
            </v-icon>
            <h3 class="text-h5 mb-2">{{ statusLabel }}</h3>
            <p v-if="rejectionReason" class="text-body-2 text-error">
              {{ rejectionReason }}
            </p>
          </v-card-text>
        </v-card>

        <!-- Quick Stats -->
        <v-card>
          <v-card-title>Statistiken</v-card-title>
          <v-list>
            <v-list-item>
              <template #prepend>
                <v-icon color="primary">mdi-inbox</v-icon>
              </template>
              <v-list-item-title>Verfügbare Anfragen</v-list-item-title>
              <template #append>
                <v-chip color="primary">{{ availableOffers.length }}</v-chip>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="success">mdi-file-document</v-icon>
              </template>
              <v-list-item-title>Gesendete Angebote</v-list-item-title>
              <template #append>
                <v-chip color="success">{{ submittedOffersCount }}</v-chip>
              </template>
            </v-list-item>

            <v-list-item>
              <template #prepend>
                <v-icon color="info">mdi-check-decagram</v-icon>
              </template>
              <v-list-item-title>Angenommene Angebote</v-list-item-title>
              <template #append>
                <v-chip color="info">{{ acceptedOffersCount }}</v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Company Info -->
      <v-col cols="12" md="8">
        <v-card class="mb-6">
          <v-card-title>Firmendaten</v-card-title>
          <v-card-text>
            <v-form>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.companyName"
                    label="Firmenname"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.email"
                    label="E-Mail"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.phone"
                    label="Telefon"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.atuNumber"
                    label="ATU-Nummer"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="profile.address"
                    label="Adresse"
                    readonly
                    variant="outlined"
                  />
                </v-col>

                <v-col cols="12">
                  <v-select
                    v-model="profile.services"
                    label="Dienstleistungen"
                    :items="profile.services"
                    multiple
                    chips
                    readonly
                    variant="outlined"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Pricing Conditions -->
        <v-card>
          <v-card-title>Preiskonditionen</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="pricing.hourlyRate"
                  label="Stundensatz (€)"
                  type="number"
                  prefix="€"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="pricing.travelFee"
                  label="Anfahrtskosten (€)"
                  type="number"
                  prefix="€"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="pricing.baseFee"
                  label="Grundgebühr (€)"
                  type="number"
                  prefix="€"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="pricing.extraChargePercent"
                  label="Aufschlag (%)"
                  type="number"
                  suffix="%"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="pricing.minimumPrice"
                  label="Mindestpreis (€)"
                  type="number"
                  prefix="€"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-alert
              type="info"
              variant="tonal"
              class="mt-4"
            >
              Änderungen an den Preiskonditionen wirken sich auf zukünftige 
              Preisschätzungen aus.
            </v-alert>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              :loading="saving"
              @click="savePricing"
            >
              Speichern
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor">
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCompanyStore, useAuthStore } from '@/stores'
import { CompanyStatus, FinalOfferStatus } from '@/types'

const companyStore = useCompanyStore()
const authStore = useAuthStore()

const saving = ref(false)
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const availableOffers = computed(() => companyStore.availableOffers)
const myFinalOffers = computed(() => companyStore.myFinalOffers)

const submittedOffersCount = computed(() => 
  myFinalOffers.value.filter(o => o.status === FinalOfferStatus.SUBMITTED).length
)

const acceptedOffersCount = computed(() => 
  myFinalOffers.value.filter(o => o.status === FinalOfferStatus.ACCEPTED).length
)

const statusColor = computed(() => {
  const colors = {
    [CompanyStatus.PENDING]: 'warning',
    [CompanyStatus.APPROVED]: 'success',
    [CompanyStatus.REJECTED]: 'error'
  }
  return colors[companyStore.companyStatus] || 'grey'
})

const statusIcon = computed(() => {
  const icons = {
    [CompanyStatus.PENDING]: 'mdi-clock-outline',
    [CompanyStatus.APPROVED]: 'mdi-check-circle',
    [CompanyStatus.REJECTED]: 'mdi-close-circle'
  }
  return icons[companyStore.companyStatus] || 'mdi-help'
})

const statusLabel = computed(() => {
  const labels = {
    [CompanyStatus.PENDING]: 'Ausstehend',
    [CompanyStatus.APPROVED]: 'Freigeschaltet',
    [CompanyStatus.REJECTED]: 'Abgelehnt'
  }
  return labels[companyStore.companyStatus] || 'Unbekannt'
})

const rejectionReason = computed(() => companyStore.rejectionReason)

// Mock profile data
const profile = ref({
  companyName: 'Muster Umzüge GmbH',
  email: authStore.user?.email || 'firma@beispiel.at',
  phone: '+43 123 456789',
  atuNumber: 'ATU12345678',
  address: 'Musterstraße 1, 1010 Wien, Österreich',
  services: ['Umzüge', 'Entrümpelungen', 'Möbelmontage']
})

const pricing = ref({
  hourlyRate: 55,
  travelFee: 35,
  baseFee: 150,
  extraChargePercent: 10,
  minimumPrice: 300
})

async function savePricing() {
  saving.value = true
  
  try {
    // TODO: Call API to save pricing conditions
    console.log('Saving pricing:', pricing.value)
    
    snackbarMessage.value = 'Preiskonditionen gespeichert'
    snackbarColor.value = 'success'
  } catch (err) {
    snackbarMessage.value = 'Fehler beim Speichern'
    snackbarColor.value = 'error'
  } finally {
    saving.value = false
    showSnackbar.value = true
  }
}
</script>
