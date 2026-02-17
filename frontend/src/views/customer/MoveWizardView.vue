<template>
  <div>
    <h1 class="text-h4 mb-6">Neuer Umzug</h1>

    <!-- Stepper -->
    <v-stepper
      v-model="currentStep"
      :items="stepLabels"
      class="mb-6"
    >
      <!-- Step 1: Move Details -->
      <template #item.1>
        <v-card flat class="pa-4">
          <h2 class="text-h6 mb-4">Umzugsdaten</h2>
          
          <v-row>
            <!-- From Address -->
            <v-col cols="12" md="6">
              <h3 class="text-subtitle-1 mb-3">Von Adresse</h3>
              
              <v-text-field
                v-model="moveDetails.fromAddress!.street"
                label="Straße *"
                required
              />
              
              <v-text-field
                v-model="moveDetails.fromAddress!.houseNumber"
                label="Hausnummer *"
                required
              />
              
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="moveDetails.fromAddress!.postalCode"
                    label="PLZ *"
                    required
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="moveDetails.fromAddress!.city"
                    label="Ort *"
                    required
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model="moveDetails.fromAddress!.country"
                label="Land *"
                required
              />

              <!-- Floor Details -->
              <v-divider class="my-4" />
              <h4 class="text-subtitle-2 mb-3">Stockwerk-Details</h4>
              
              <v-text-field
                v-model.number="moveDetails.fromFloor!.floor"
                label="Stockwerk * (0 = EG, -1 = Keller)"
                type="number"
                required
              />
              
              <v-checkbox
                v-model="moveDetails.fromFloor!.hasElevator"
                label="Fahrstuhl vorhanden"
              />
              
              <v-checkbox
                v-model="moveDetails.fromFloor!.needsNoParkingZone"
                label="Halteverband erforderlich"
              />
            </v-col>

            <!-- To Address -->
            <v-col cols="12" md="6">
              <h3 class="text-subtitle-1 mb-3">Nach Adresse</h3>
              
              <v-text-field
                v-model="moveDetails.toAddress!.street"
                label="Straße *"
                required
              />
              
              <v-text-field
                v-model="moveDetails.toAddress!.houseNumber"
                label="Hausnummer *"
                required
              />
              
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="moveDetails.toAddress!.postalCode"
                    label="PLZ *"
                    required
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="moveDetails.toAddress!.city"
                    label="Ort *"
                    required
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model="moveDetails.toAddress!.country"
                label="Land *"
                required
              />

              <!-- Floor Details -->
              <v-divider class="my-4" />
              <h4 class="text-subtitle-2 mb-3">Stockwerk-Details</h4>
              
              <v-text-field
                v-model.number="moveDetails.toFloor!.floor"
                label="Stockwerk * (0 = EG, -1 = Keller)"
                type="number"
                required
              />
              
              <v-checkbox
                v-model="moveDetails.toFloor!.hasElevator"
                label="Fahrstuhl vorhanden"
              />
              
              <v-checkbox
                v-model="moveDetails.toFloor!.needsNoParkingZone"
                label="Halteverband erforderlich"
              />
            </v-col>
          </v-row>

          <!-- Move Date and Boxes -->
          <v-divider class="my-4" />
          
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="moveDetails.moveDate"
                label="Umzugsdatum *"
                type="date"
                required
              />
            </v-col>
            
            <v-col cols="12" md="6">
              <v-checkbox
                v-model="moveDetails.needsBoxes"
                label="Umzugskartons benötigt"
              />
              
              <v-text-field
                v-if="moveDetails.needsBoxes"
                v-model.number="moveDetails.boxesCount"
                label="Anzahl Kartons"
                type="number"
                min="1"
              />
            </v-col>
          </v-row>

          <!-- Actions -->
          <div class="d-flex justify-end mt-6">
            <v-btn
              color="primary"
              :disabled="!isMoveDetailsValid"
              @click="nextStep"
            >
              Weiter
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </div>
        </v-card>
      </template>

      <!-- Step 2: Video Upload -->
      <template #item.2>
        <v-card flat class="pa-4">
          <h2 class="text-h6 mb-4">Video hochladen</h2>
          
          <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <p class="mb-1">
              <strong>Tipps für das Video:</strong>
            </p>
            <ul class="pl-4">
              <li>Gehen Sie langsam durch alle Räume</li>
              <li>Film Sie alle Möbel und Gegenstände</li>
              <li>Max. Dateigröße: 500 MB</li>
              <li>Unterstützte Formate: MP4, MOV, AVI</li>
            </ul>
          </v-alert>

          <v-file-input
            v-model="videoFile"
            label="Video auswählen"
            accept="video/*"
            prepend-icon="mdi-video"
            :loading="wizardLoading"
            :disabled="wizardLoading"
            show-size
            @change="handleVideoSelect"
          />

          <!-- Upload Progress -->
          <v-progress-linear
            v-if="wizardLoading"
            indeterminate
            color="primary"
            class="mb-4"
          />

          <!-- Uploaded Video Info -->
          <v-alert
            v-if="uploadedVideo"
            type="success"
            variant="tonal"
            class="mb-4"
          >
            <p class="mb-1">
              <strong>Video erfolgreich hochgeladen!</strong>
            </p>
            <p class="mb-0">
              {{ uploadedVideo.filename }} ({{ formatFileSize(uploadedVideo.sizeBytes) }})
            </p>
          </v-alert>

          <!-- Actions -->
          <div class="d-flex justify-space-between mt-6">
            <v-btn
              variant="text"
              @click="previousStep"
            >
              Zurück
            </v-btn>
            <v-btn
              color="primary"
              :disabled="!uploadedVideo || wizardLoading"
              @click="proceedToAnalysis"
            >
              Weiter
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </div>
        </v-card>
      </template>

      <!-- Step 3: Analysis Status -->
      <template #item.3>
        <v-card flat class="pa-4">
          <h2 class="text-h6 mb-4">KI-Analyse</h2>
          
          <!-- PENDING / RUNNING -->
          <div
            v-if="analysisJob?.status === 'PENDING' || analysisJob?.status === 'RUNNING'"
            class="text-center py-8"
          >
            <v-progress-circular
              indeterminate
              color="primary"
              size="96"
              width="8"
              class="mb-4"
            />
            <h3 class="text-h6 mb-2">
              {{ analysisJob?.status === 'PENDING' ? 'Analyse wird gestartet...' : 'Analyse läuft...' }}
            </h3>
            <p class="text-body-1 text-medium-emphasis">
              Unsere KI analysiert Ihr Video und erkennt Ihr Inventar.
              Dies kann einige Minuten dauern.
            </p>
          </div>

          <!-- SUCCEEDED -->
          <div
            v-else-if="analysisJob?.status === 'SUCCEEDED'"
            class="text-center py-8"
          >
            <v-icon
              size="96"
              color="success"
              class="mb-4"
            >
              mdi-check-circle
            </v-icon>
            <h3 class="text-h6 mb-2">Analyse abgeschlossen!</h3>
            <p class="text-body-1 text-medium-emphasis mb-4">
              Wir haben <strong>{{ analysisJob?.detectedItems?.length || 0 }}</strong> Gegenstände erkannt
              mit einem Gesamtvolumen von <strong>{{ analysisJob?.totalVolumeM3?.toFixed(2) || '0.00' }} m³</strong>.
            </p>
            <v-btn
              color="primary"
              @click="proceedToInventory"
            >
              Inventar prüfen
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </div>

          <!-- FAILED -->
          <div
            v-else-if="analysisJob?.status === 'FAILED'"
            class="text-center py-8"
          >
            <v-icon
              size="96"
              color="error"
              class="mb-4"
            >
              mdi-alert-circle
            </v-icon>
            <h3 class="text-h6 mb-2">Analyse fehlgeschlagen</h3>
            <p class="text-body-1 text-medium-emphasis mb-4">
              {{ analysisJob?.errorMessage || 'Ein Fehler ist aufgetreten.' }}
            </p>
            <v-btn
              color="primary"
              @click="retryAnalysis"
            >
              Erneut versuchen
              <v-icon end>mdi-refresh</v-icon>
            </v-btn>
          </div>

          <!-- No Job Yet -->
          <div v-else class="text-center py-8">
            <p>Analyse wird gestartet...</p>
          </div>

          <!-- Actions -->
          <div class="d-flex justify-start mt-6">
            <v-btn
              variant="text"
              @click="previousStep"
            >
              Zurück
            </v-btn>
          </div>
        </v-card>
      </template>

      <!-- Step 4: Inventory Edit -->
      <template #item.4>
        <v-card flat class="pa-4">
          <h2 class="text-h6 mb-4">
            Inventar bearbeiten
            <v-chip class="ml-2" size="small">
              {{ inventoryItems.length }} Gegenstände
            </v-chip>
          </h2>

          <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            Überprüfen Sie die erkannten Gegenstände. Sie können Mängel korrigieren, 
            Mengen ändern oder fehlende Gegenstände hinzufügen.
          </v-alert>

          <!-- Add New Item -->
          <v-card variant="outlined" class="mb-4 pa-4">
            <h3 class="text-subtitle-2 mb-3">Gegenstand hinzufügen</h3>
            <v-row>
              <v-col cols="12" md="5">
                <v-text-field
                  v-model="newItemName"
                  label="Bezeichnung"
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col cols="6" md="3">
                <v-text-field
                  v-model.number="newItemQuantity"
                  label="Anzahl"
                  type="number"
                  min="1"
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col cols="6" md="2">
                <v-text-field
                  v-model="newItemCategory"
                  label="Kategorie"
                  density="compact"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-btn
                  color="primary"
                  block
                  :disabled="!newItemName || newItemQuantity < 1"
                  @click="addItem"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card>

          <!-- Inventory List -->
          <v-data-table
            :headers="inventoryHeaders"
            :items="inventoryItems"
            class="elevation-1"
          >
            <template #item.source="{ item }">
              <v-chip
                size="small"
                :color="item.source === 'AI_DETECTED' ? 'info' : 'grey'"
              >
                {{ item.source === 'AI_DETECTED' ? 'KI' : 'Manuell' }}
              </v-chip>
            </template>

            <template #item.confidence="{ item }">
              <v-progress-linear
                v-if="item.confidence !== undefined"
                :model-value="item.confidence * 100"
                :color="item.confidence > 0.8 ? 'success' : item.confidence > 0.5 ? 'warning' : 'error'"
                height="8"
                rounded
              >
                <template #default>
                  {{ Math.round(item.confidence * 100) }}%
                </template>
              </v-progress-linear>
              <span v-else>-</span>
            </template>

            <template #item.quantity="{ item, index }">
              <v-text-field
                v-model.number="item.quantity"
                type="number"
                min="1"
                density="compact"
                hide-details
                style="width: 80px"
                @change="updateItem(index, item.name, item.quantity)"
              />
            </template>

            <template #item.actions="{ item, index }">
              <v-btn
                icon
                size="small"
                color="error"
                variant="text"
                @click="removeItem(index)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>

          <!-- Summary -->
          <v-card variant="tonal" class="mt-4 pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-body-2 mb-1">
                  <strong>Gesamtvolumen:</strong> {{ totalVolume.toFixed(2) }} m³
                </p>
                <p class="text-body-2 mb-0">
                  <strong>Gesamtanzahl:</strong> {{ inventoryItems.reduce((sum, item) => sum + item.quantity, 0) }} Gegenstände
                </p>
              </div>
              <v-btn
                color="success"
                :loading="wizardLoading"
                @click="confirmAndProceed"
              >
                Inventar bestätigen
                <v-icon end>mdi-check</v-icon>
              </v-btn>
            </div>
          </v-card>

          <!-- Actions -->
          <div class="d-flex justify-start mt-6">
            <v-btn
              variant="text"
              @click="previousStep"
            >
              Zurück
            </v-btn>
          </div>
        </v-card>
      </template>

      <!-- Step 5: Confirm & Submit -->
      <template #item.5>
        <v-card flat class="pa-4">
          <h2 class="text-h6 mb-4">Zusammenfassung</h2>

          <!-- Offer Created Successfully -->
          <div v-if="currentOffer" class="text-center py-8">
            <v-icon
              size="96"
              color="success"
              class="mb-4"
            >
              mdi-check-circle
            </v-icon>
            <h3 class="text-h5 mb-2">Anfrage erfolgreich erstellt!</h3>
            <p class="text-body-1 text-medium-emphasis mb-6">
              Ihre Umzugsanfrage wurde erstellt und an unsere Partnerfirmen weitergeleitet.
              Sie erhalten in Kürze erste Preisschätzungen.
            </p>
            
            <v-card variant="outlined" class="mb-6 mx-auto" max-width="500">
              <v-card-text>
                <p class="text-body-2 mb-1">
                  <strong>Anfrage-ID:</strong> {{ currentOffer.id }}
                </p>
                <p class="text-body-2 mb-0">
                  <strong>Status:</strong> 
                  <v-chip size="small" color="info">
                    {{ getStatusLabel(currentOffer.status) }}
                  </v-chip>
                </p>
              </v-card-text>
            </v-card>

            <div class="d-flex justify-center gap-4">
              <v-btn
                color="primary"
                to="/customer"
              >
                Zum Dashboard
              </v-btn>
              <v-btn
                variant="outlined"
                @click="resetAndNew"
              >
                Neuer Umzug
              </v-btn>
            </div>
          </div>

          <!-- Creating Offer -->
          <div v-else-if="wizardLoading" class="text-center py-8">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
              class="mb-4"
            />
            <p>Anfrage wird erstellt...</p>
          </div>

          <!-- Ready to Submit -->
          <div v-else class="text-center py-8">
            <v-icon
              size="96"
              color="primary"
              class="mb-4"
            >
              mdi-send-circle
            </v-icon>
            <h3 class="text-h5 mb-2">Bereit zum Absenden</h3>
            <p class="text-body-1 text-medium-emphasis mb-6">
              Ihre Inventarliste ist bestätigt. Klicken Sie auf "Anfrage senden", 
              um Ihre Umzugsanfrage an unsere Partnerfirmen zu senden.
            </p>

            <v-btn
              color="primary"
              size="large"
              :loading="wizardLoading"
              @click="submitOffer"
            >
              Anfrage senden
              <v-icon end>mdi-send</v-icon>
            </v-btn>
          </div>
        </v-card>
      </template>
    </v-stepper>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerStore, WizardStep } from '@/stores'
import { AnalysisJobStatus, OfferStatus } from '@/types'
import type { InventoryItemResponse } from '@/types'

const router = useRouter()
const customerStore = useCustomerStore()

// Local refs
const videoFile = ref<File[]>([])
const newItemName = ref('')
const newItemQuantity = ref(1)
const newItemCategory = ref('')

// Table headers
const inventoryHeaders = [
  { title: 'Bezeichnung', key: 'name' },
  { title: 'Kategorie', key: 'category' },
  { title: 'Quelle', key: 'source' },
  { title: 'Konfidenz', key: 'confidence' },
  { title: 'Anzahl', key: 'quantity', align: 'center' as const },
  { title: 'Volumen (m³)', key: 'totalVolume' },
  { title: '', key: 'actions', sortable: false }
]

// Computed from store
const currentStep = computed({
  get: () => customerStore.currentStep,
  set: (val) => customerStore.goToStep(val)
})

const stepLabels = [
  'Umzugsdaten',
  'Video Upload',
  'KI-Analyse',
  'Inventar',
  'Bestätigung'
]

const moveDetails = computed(() => customerStore.moveDetails)
const isMoveDetailsValid = computed(() => customerStore.isMoveDetailsValid)
const wizardLoading = computed(() => customerStore.wizardLoading)
const uploadedVideo = computed(() => customerStore.uploadedVideo)
const analysisJob = computed(() => customerStore.analysisJob)
const inventoryItems = computed(() => customerStore.inventoryItems)
const totalVolume = computed(() => customerStore.totalVolume)
const currentOffer = computed(() => customerStore.currentOffer)

// Methods
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getStatusLabel(status: OfferStatus): string {
  const labels: Record<string, string> = {
    [OfferStatus.DRAFT]: 'Entwurf',
    [OfferStatus.INVENTORY_PENDING]: 'Inventar wird erstellt',
    [OfferStatus.INVENTORY_CONFIRMED]: 'Inventar bestätigt',
    [OfferStatus.ESTIMATES_READY]: 'Schätzungen verfügbar'
  }
  return labels[status] || status
}

async function handleVideoSelect() {
  if (videoFile.value && videoFile.value.length > 0) {
    const file = videoFile.value[0]
    try {
      await customerStore.uploadVideo(file)
    } catch (err) {
      console.error('Upload failed:', err)
    }
  }
}

async function proceedToAnalysis() {
  if (!uploadedVideo.value) return
  
  try {
    // Create the offer first
    await customerStore.createOffer()
    
    // Then start analysis
    const job = await customerStore.startAnalysis()
    customerStore.nextStep()
    
    // Start polling
    if (job?.id) {
      customerStore.startPollingAnalysis(job.id)
    }
  } catch (err) {
    console.error('Failed to proceed:', err)
  }
}

function retryAnalysis() {
  if (analysisJob.value?.id) {
    customerStore.startPollingAnalysis(analysisJob.value.id)
  }
}

async function proceedToInventory() {
  customerStore.stopPollingAnalysis()
  
  try {
    // Load inventory from analysis results
    // For now, we'll create a mock inventory based on detected items
    const detectedItems = analysisJob.value?.detectedItems || []
    
    // Convert detected items to inventory items
    const items = detectedItems.map(item => ({
      name: item.label,
      quantity: item.quantity,
      confidence: item.confidence,
      source: 'AI_DETECTED' as const,
      category: 'Möbel',
      volume: item.estimatedVolumeM3,
      totalVolume: (item.estimatedVolumeM3 || 0) * item.quantity
    }))
    
    // Mock inventory response for UI
    const mockInventory = {
      id: 'mock-inventory-id',
      offerId: currentOffer.value?.id || '',
      status: 'DRAFT' as const,
      items,
      itemTypeCount: items.length,
      totalItemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      aiDetectedItemCount: items.length,
      manualItemCount: 0,
      averageAiConfidence: detectedItems.reduce((sum, i) => sum + i.confidence, 0) / detectedItems.length,
      totalVolume: items.reduce((sum, i) => sum + i.totalVolume, 0),
      createdAt: new Date().toISOString()
    }
    
    customerStore.inventory = mockInventory
    customerStore.nextStep()
  } catch (err) {
    console.error('Failed to load inventory:', err)
  }
}

async function addItem() {
  if (!newItemName.value || newItemQuantity.value < 1) return
  
  try {
    await customerStore.addInventoryItem({
      name: newItemName.value,
      quantity: newItemQuantity.value,
      category: newItemCategory.value || undefined
    })
    
    newItemName.value = ''
    newItemQuantity.value = 1
    newItemCategory.value = ''
  } catch (err) {
    console.error('Failed to add item:', err)
  }
}

async function updateItem(index: number, name: string, quantity: number) {
  try {
    await customerStore.updateInventoryItem(index, name, quantity)
  } catch (err) {
    console.error('Failed to update item:', err)
  }
}

async function removeItem(index: number) {
  try {
    await customerStore.removeInventoryItem(index)
  } catch (err) {
    console.error('Failed to remove item:', err)
  }
}

async function confirmAndProceed() {
  try {
    await customerStore.confirmInventory()
    customerStore.nextStep()
  } catch (err) {
    console.error('Failed to confirm inventory:', err)
  }
}

async function submitOffer() {
  // In the actual flow, the offer is already created
  // We just need to transition it to the next state
  // For now, we'll just show the success state
  customerStore.nextStep()
}

function nextStep() {
  customerStore.nextStep()
}

function previousStep() {
  customerStore.previousStep()
}

function resetAndNew() {
  customerStore.resetWizard()
}

// Cleanup
onUnmounted(() => {
  customerStore.stopPollingAnalysis()
})
</script>
