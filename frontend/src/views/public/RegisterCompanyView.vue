<template>
  <v-app>
    <v-app-bar color="primary" flat>
      <v-app-bar-title>MyMove</v-app-bar-title>
      <v-spacer />
      <v-btn variant="text" to="/">Zurück</v-btn>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <!-- Loading Overlay - Full Screen -->
      <v-overlay
        v-model="showLoadingOverlay"
        class="align-center justify-center"
      >
        <div class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="80"
            width="8"
            class="mb-6"
          />
          <h3 class="text-h5 text-white">Registrierung wird verarbeitet...</h3>
        </div>
      </v-overlay>

      <!-- Success Overlay - Full Screen -->
      <v-overlay
        v-model="showSuccessOverlay"
        class="align-center justify-center"
      >
        <v-card class="pa-8 text-center" max-width="450" rounded="lg">
          <v-icon
            size="80"
            color="success"
            class="mb-4"
          >
            mdi-check-circle
          </v-icon>
          <h3 class="text-h4 mb-3">Registrierung erfolgreich!</h3>
          <p class="text-body-1 text-medium-emphasis mb-6">
            Ihr Konto wird von uns geprüft. Sie erhalten eine E-Mail sobald Ihre Firma freigeschaltet wurde.
          </p>
          <v-progress-linear
            indeterminate
            color="primary"
            class="mb-3"
            rounded
          />
          <p class="text-caption text-medium-emphasis">
            Weiterleitung zur Startseite...
          </p>
        </v-card>
      </v-overlay>

      <v-container class="py-8">
        <v-row justify="center">
          <v-col cols="12" lg="10">
            <v-card class="pa-6">
              <v-card-title class="text-h5 text-center mb-2">
                Als Umzugsfirma registrieren
              </v-card-title>
              <v-card-subtitle class="text-center mb-6">
                Werden Sie Partner und erhalten Sie Umzugsanfragen in Ihrer Region
              </v-card-subtitle>

              <v-form @submit.prevent="handleSubmit" ref="form">
                <v-row>
                  <!-- Company Info -->
                  <v-col cols="12">
                    <h3 class="text-h6 mb-4">Firmendaten</h3>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.companyName"
                      label="Firmenname *"
                      required
                      :rules="[v => !!v || 'Firmenname erforderlich']"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.email"
                      label="E-Mail *"
                      type="email"
                      required
                      :rules="[
                        v => !!v || 'E-Mail erforderlich',
                        v => /.+@.+\..+/.test(v) || 'Gültige E-Mail eingeben'
                      ]"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.password"
                      label="Passwort *"
                      type="password"
                      required
                      :rules="[
                        v => !!v || 'Passwort erforderlich',
                        v => v.length >= 6 || 'Mindestens 6 Zeichen'
                      ]"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.phone"
                      label="Telefon *"
                      required
                      :rules="[v => !!v || 'Telefon erforderlich']"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.website"
                      label="Website"
                      placeholder="www.beispiel.at"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.atuNumber"
                      label="ATU-Nummer *"
                      required
                      :rules="[v => !!v || 'ATU-Nummer erforderlich']"
                      placeholder="ATU12345678"
                    />
                  </v-col>

                  <!-- Address -->
                  <v-col cols="12">
                    <h3 class="text-h6 mb-4 mt-4">Adresse</h3>
                  </v-col>

                  <v-col cols="12" md="8">
                    <v-text-field
                      v-model="formData.addressLine"
                      label="Straße und Hausnummer *"
                      required
                      :rules="[v => !!v || 'Adresse erforderlich']"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="formData.postalCode"
                      label="PLZ *"
                      required
                      :rules="[v => !!v || 'PLZ erforderlich']"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.city"
                      label="Ort *"
                      required
                      :rules="[v => !!v || 'Ort erforderlich']"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.country"
                      label="Land *"
                      required
                      :rules="[v => !!v || 'Land erforderlich']"
                      value="Österreich"
                    />
                  </v-col>

                  <!-- Services -->
                  <v-col cols="12">
                    <h3 class="text-h6 mb-4 mt-4">Dienstleistungen *</h3>
                  </v-col>

                  <v-col cols="12">
                    <v-select
                      v-model="formData.services"
                      :items="serviceOptions"
                      label="Angebotene Dienstleistungen"
                      multiple
                      chips
                      required
                      :rules="[v => v.length > 0 || 'Mindestens eine Dienstleistung auswählen']"
                    />
                  </v-col>

                  <!-- Pricing (Optional) -->
                  <v-col cols="12">
                    <h3 class="text-h6 mb-4 mt-4">Preiskonditionen (optional)</h3>
                    <p class="text-body-2 text-medium-emphasis mb-2">
                      Diese können auch später nach dem ersten Login festgelegt werden.
                    </p>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="formData.hourlyRate"
                      label="Stundensatz (€)"
                      type="number"
                      min="0"
                      max="500"
                      prefix="€"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="formData.travelFee"
                      label="Anfahrtskosten (€)"
                      type="number"
                      min="0"
                      max="1000"
                      prefix="€"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model.number="formData.baseFee"
                      label="Grundgebühr (€)"
                      type="number"
                      min="0"
                      prefix="€"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model.number="formData.extraChargePercent"
                      label="Aufschlag (%)"
                      type="number"
                      min="0"
                      max="100"
                      suffix="%"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model.number="formData.minimumPrice"
                      label="Mindestpreis (€)"
                      type="number"
                      min="0"
                      prefix="€"
                    />
                  </v-col>

                  <!-- Trade License -->
                  <v-col cols="12">
                    <h3 class="text-h6 mb-4 mt-4">Gewerbeschein *</h3>
                  </v-col>

                  <v-col cols="12">
                    <v-file-input
                      v-model="formData.tradeLicenseFile"
                      label="Gewerbeschein hochladen"
                      accept=".pdf,.jpg,.jpeg,.png"
                      prepend-icon="mdi-file-upload"
                      required
                      :rules="[v => !!v || 'Gewerbeschein erforderlich']"
                      show-size
                    />
                  </v-col>

                  <!-- Submit -->
                  <v-col cols="12" class="mt-4">
                    <v-alert
                      v-if="error"
                      type="error"
                      variant="tonal"
                      class="mb-4"
                      closable
                      @click:close="error = ''"
                    >
                      {{ error }}
                    </v-alert>

                    <v-btn
                      type="submit"
                      color="primary"
                      size="large"
                      block
                      :loading="loading"
                      :disabled="success"
                    >
                      Registrierung absenden
                    </v-btn>

                    <div class="text-center mt-4">
                      <v-btn
                        variant="text"
                        to="/login"
                      >
                        Bereits registriert? Hier anmelden
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import { CompanyService } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const form = ref<any>(null)
const loading = ref(false)
const error = ref('')
const success = ref(false)
const showLoadingOverlay = ref(false)
const showSuccessOverlay = ref(false)

const serviceOptions = [
  { title: 'Umzüge', value: CompanyService.MOVING },
  { title: 'Entrümpelungen', value: CompanyService.CLEARANCE },
  { title: 'Räumungen', value: CompanyService.EVICTION_CLEARANCE },
  { title: 'Messi-Räumungen', value: CompanyService.HOARDER_CLEARANCE },
  { title: 'Klaviertransport', value: CompanyService.PIANO_TRANSPORT },
  { title: 'Sondertransporte', value: CompanyService.SPECIAL_TRANSPORT },
  { title: 'Ein-/Auspackservice', value: CompanyService.PACKING_SERVICE },
  { title: 'Möbelmontage', value: CompanyService.FURNITURE_ASSEMBLY },
  { title: 'Zwischenlagerung', value: CompanyService.STORAGE_SERVICE }
]

const formData = reactive({
  companyName: '',
  email: '',
  password: '',
  addressLine: '',
  city: '',
  postalCode: '',
  country: 'Österreich',
  phone: '',
  website: '',
  atuNumber: '',
  services: [] as CompanyService[],
  tradeLicenseFile: null as File | null,
  hourlyRate: 0,  // Optional, can be set later
  travelFee: 0,   // Optional, can be set later
  baseFee: undefined as number | undefined,
  extraChargePercent: undefined as number | undefined,
  minimumPrice: undefined as number | undefined
})

async function handleSubmit() {
  const valid = await form.value?.validate()
  if (!valid?.valid) return

  loading.value = true
  error.value = ''
  success.value = false

  try {
    if (!formData.tradeLicenseFile) {
      error.value = 'Bitte laden Sie einen Gewerbeschein hoch'
      loading.value = false
      return
    }

    await authStore.registerCompany({
      companyName: formData.companyName,
      email: formData.email,
      password: formData.password,
      addressLine: formData.addressLine,
      city: formData.city,
      postalCode: formData.postalCode,
      country: formData.country,
      phone: formData.phone,
      website: formData.website || undefined,
      atuNumber: formData.atuNumber,
      services: formData.services,
      tradeLicenseFile: formData.tradeLicenseFile,
      hourlyRate: formData.hourlyRate,
      travelFee: formData.travelFee,
      baseFee: formData.baseFee,
      extraChargePercent: formData.extraChargePercent,
      minimumPrice: formData.minimumPrice
    })

    // Show loading overlay for 3 seconds
    loading.value = false
    showLoadingOverlay.value = true
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Show success overlay
    showLoadingOverlay.value = false
    showSuccessOverlay.value = true
    success.value = true
    
    // Redirect after 3 seconds
    setTimeout(() => {
      router.push('/')
    }, 3000)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Registrierung fehlgeschlagen'
  } finally {
    loading.value = false
  }
}
</script>
