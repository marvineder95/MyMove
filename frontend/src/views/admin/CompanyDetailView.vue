<template>
  <div>
    <v-btn
      variant="text"
      to="/admin"
      prepend-icon="mdi-arrow-left"
      class="mb-4"
    >
      Zurück zur Übersicht
    </v-btn>

    <h1 class="text-h4 mb-6">Firmendetails</h1>

    <!-- Loading State -->
    <v-card v-if="loading" class="pa-8 text-center">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        class="mb-4"
      />
      <p>Lade Firmendaten...</p>
    </v-card>

    <template v-else-if="company">
      <!-- Status Banner -->
      <v-alert
        v-if="company.status === 'PENDING'"
        type="warning"
        variant="tonal"
        class="mb-6"
        title="Genehmigung ausstehend"
      >
        <p class="mb-4">
          Diese Firma wartet auf Ihre Genehmigung. 
          Überprüfen Sie die Firmendaten und den Gewerbeschein.
        </p>
        <div class="d-flex gap-2">
          <v-btn
            color="success"
            :loading="processing"
            @click="approveCompany"
          >
            <v-icon start>mdi-check</v-icon>
            Genehmigen
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            @click="showRejectDialog = true"
          >
            <v-icon start>mdi-close</v-icon>
            Ablehnen
          </v-btn>
        </div>
      </v-alert>

      <v-alert
        v-else-if="company.status === 'APPROVED'"
        type="success"
        variant="tonal"
        class="mb-6"
        title="Freigeschaltet"
      >
        Diese Firma wurde am {{ company.reviewedAt ? new Date(company.reviewedAt).toLocaleDateString('de-AT') : '-' }} freigeschaltet.
      </v-alert>

      <v-alert
        v-else-if="company.status === 'REJECTED'"
        type="error"
        variant="tonal"
        class="mb-6"
        title="Abgelehnt"
      >
        <p class="mb-0">
          <strong>Grund:</strong> {{ company.rejectionReason }}
        </p>
      </v-alert>

      <v-row>
        <!-- Company Info -->
        <v-col cols="12" md="8">
          <v-card class="mb-6">
            <v-card-title>Firmendaten</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-list density="compact">
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="primary">mdi-domain</v-icon>
                      </template>
                      <v-list-item-title>{{ company.name }}</v-list-item-title>
                      <v-list-item-subtitle>Firmenname</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template #prepend>
                        <v-icon color="primary">mdi-email</v-icon>
                      </template>
                      <v-list-item-title>{{ company.email }}</v-list-item-title>
                      <v-list-item-subtitle>E-Mail</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template #prepend>
                        <v-icon color="primary">mdi-phone</v-icon>
                      </template>
                      <v-list-item-title>{{ company.phone }}</v-list-item-title>
                      <v-list-item-subtitle>Telefon</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template #prepend>
                        <v-icon color="primary">mdi-identifier</v-icon>
                      </template>
                      <v-list-item-title>{{ company.atuNumber }}</v-list-item-title>
                      <v-list-item-subtitle>ATU-Nummer</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>

                <v-col cols="12" md="6">
                  <v-list density="compact">
                    <v-list-item>
                      <template #prepend>
                        <v-icon color="primary">mdi-map-marker</v-icon>
                      </template>
                      <v-list-item-title>{{ company.city }}</v-list-item-title>
                      <v-list-item-subtitle>Ort</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template #prepend>
                        <v-icon color="primary">mdi-calendar</v-icon>
                      </template>
                      <v-list-item-title>
                        {{ new Date(company.createdAt).toLocaleDateString('de-AT') }}
                      </v-list-item-title>
                      <v-list-item-subtitle>Registriert am</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item v-if="company.reviewedAt">
                      <template #prepend>
                        <v-icon color="primary">mdi-check-circle</v-icon>
                      </template>
                      <v-list-item-title>
                        {{ new Date(company.reviewedAt).toLocaleDateString('de-AT') }}
                      </v-list-item-title>
                      <v-list-item-subtitle>Geprüft am</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <h4 class="text-subtitle-1 mb-3">Dienstleistungen</h4>
              <v-chip
                v-for="service in company.services"
                :key="service"
                class="mr-2 mb-2"
              >
                {{ formatServiceName(service) }}
              </v-chip>
            </v-card-text>
          </v-card>

          <!-- Pricing Conditions -->
          <v-card v-if="company.pricingConditions">
            <v-card-title>Preiskonditionen</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="6" md="3">
                  <div class="text-caption text-medium-emphasis">Stundensatz</div>
                  <div class="text-h6">€ {{ company.pricingConditions.hourlyRate }}</div>
                </v-col>
                <v-col cols="6" md="3">
                  <div class="text-caption text-medium-emphasis">Anfahrt</div>
                  <div class="text-h6">€ {{ company.pricingConditions.travelFee }}</div>
                </v-col>
                <v-col cols="6" md="3">
                  <div class="text-caption text-medium-emphasis">Grundgebühr</div>
                  <div class="text-h6">
                    {{ company.pricingConditions.baseFee ? `€ ${company.pricingConditions.baseFee}` : '-' }}
                  </div>
                </v-col>
                <v-col cols="6" md="3">
                  <div class="text-caption text-medium-emphasis">Mindestpreis</div>
                  <div class="text-h6">
                    {{ company.pricingConditions.minimumPrice ? `€ ${company.pricingConditions.minimumPrice}` : '-' }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Document Section -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Dokumente</v-card-title>
            <v-card-text>
              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                Gewerbeschein wurde hochgeladen.
              </v-alert>

              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-file-pdf-box</v-icon>
                  </template>
                  <v-list-item-title>Gewerbeschein</v-list-item-title>
                  <template #append>
                    <v-btn
                      variant="text"
                      size="small"
                      prepend-icon="mdi-download"
                    >
                      Download
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>

              <v-divider class="my-4" />

              <h4 class="text-subtitle-2 mb-3">Aktionen</h4>

              <div v-if="company.status === 'PENDING'" class="d-flex flex-column gap-2">
                <v-btn
                  color="success"
                  block
                  :loading="processing"
                  @click="approveCompany"
                >
                  <v-icon start>mdi-check</v-icon>
                  Genehmigen
                </v-btn>
                <v-btn
                  color="error"
                  variant="outlined"
                  block
                  @click="showRejectDialog = true"
                >
                  <v-icon start>mdi-close</v-icon>
                  Ablehnen
                </v-btn>
              </div>

              <div v-else-if="company.status === 'APPROVED'">
                <v-btn
                  color="error"
                  variant="outlined"
                  block
                  @click="showRejectDialog = true"
                >
                  <v-icon start>mdi-close</v-icon>
                  Freigabe entziehen
                </v-btn>
              </div>

              <div v-else-if="company.status === 'REJECTED'">
                <v-btn
                  color="success"
                  block
                  :loading="processing"
                  @click="approveCompany"
                >
                  <v-icon start>mdi-check</v-icon>
                  Erneut genehmigen
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Not Found -->
    <v-card v-else class="pa-8 text-center">
      <v-icon size="64" color="error" class="mb-4">mdi-alert</v-icon>
      <h3 class="text-h6 mb-2">Firma nicht gefunden</h3>
      <v-btn color="primary" to="/admin">Zurück zur Übersicht</v-btn>
    </v-card>

    <!-- Reject Dialog -->
    <v-dialog v-model="showRejectDialog" max-width="500">
      <v-card>
        <v-card-title>Firma ablehnen</v-card-title>
        <v-card-text>
          <p class="mb-4">
            Bitte geben Sie einen Grund für die Ablehnung an:
          </p>
          <v-textarea
            v-model="rejectReason"
            label="Ablehnungsgrund *"
            rows="4"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showRejectDialog = false">
            Abbrechen
          </v-btn>
          <v-btn
            color="error"
            :loading="processing"
            :disabled="!rejectReason.trim()"
            @click="rejectCompany"
          >
            Ablehnen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores'
import type { CompanyAdminResponse } from '@/types'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const companyId = ref(route.params.id as string)
const loading = ref(false)
const processing = ref(false)
const showRejectDialog = ref(false)
const rejectReason = ref('')

const company = computed(() => adminStore.selectedCompany)

onMounted(async () => {
  loading.value = true
  
  try {
    // Load companies and find the selected one
    await adminStore.loadCompanies()
    const found = adminStore.companies.find(c => c.id === companyId.value)
    if (found) {
      adminStore.selectCompany(found)
    }
  } catch (err) {
    console.error('Failed to load company:', err)
  } finally {
    loading.value = false
  }
})

function formatServiceName(service: string): string {
  const names: Record<string, string> = {
    'MOVING': 'Umzüge',
    'CLEARANCE': 'Entrümpelung',
    'EVICTION_CLEARANCE': 'Räumung',
    'HOARDER_CLEARANCE': 'Messi-Räumung',
    'PIANO_TRANSPORT': 'Klavier',
    'SPECIAL_TRANSPORT': 'Sondertransport',
    'PACKING_SERVICE': 'Packen',
    'FURNITURE_ASSEMBLY': 'Montage',
    'STORAGE_SERVICE': 'Lagerung'
  }
  return names[service] || service
}

async function approveCompany() {
  processing.value = true
  
  try {
    await adminStore.approveCompany(companyId.value)
  } catch (err) {
    console.error('Failed to approve company:', err)
  } finally {
    processing.value = false
  }
}

async function rejectCompany() {
  if (!rejectReason.value.trim()) return
  
  processing.value = true
  
  try {
    await adminStore.rejectCompany(companyId.value, rejectReason.value)
    showRejectDialog.value = false
    rejectReason.value = ''
  } catch (err) {
    console.error('Failed to reject company:', err)
  } finally {
    processing.value = false
  }
}
</script>
