<template>
  <div>
    <h1 class="text-h4 mb-6">Admin Dashboard</h1>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card color="warning" variant="tonal">
          <v-card-text class="d-flex align-center pa-4">
            <v-icon size="48" class="mr-4">mdi-clock-outline</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ pendingCount }}</div>
              <div class="text-body-2">Ausstehend</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="success" variant="tonal">
          <v-card-text class="d-flex align-center pa-4">
            <v-icon size="48" class="mr-4">mdi-check-circle</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ approvedCount }}</div>
              <div class="text-body-2">Freigeschaltet</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="error" variant="tonal">
          <v-card-text class="d-flex align-center pa-4">
            <v-icon size="48" class="mr-4">mdi-close-circle</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ rejectedCount }}</div>
              <div class="text-body-2">Abgelehnt</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="primary" variant="tonal">
          <v-card-text class="d-flex align-center pa-4">
            <v-icon size="48" class="mr-4">mdi-domain</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ totalCount }}</div>
              <div class="text-body-2">Gesamt</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filter Tabs -->
    <v-card>
      <v-tabs v-model="activeTab" bg-color="grey-lighten-4">
        <v-tab value="PENDING">
          <v-icon start>mdi-clock-outline</v-icon>
          Ausstehend ({{ pendingCount }})
        </v-tab>
        <v-tab value="APPROVED">
          <v-icon start>mdi-check-circle</v-icon>
          Freigeschaltet ({{ approvedCount }})
        </v-tab>
        <v-tab value="REJECTED">
          <v-icon start>mdi-close-circle</v-icon>
          Abgelehnt ({{ rejectedCount }})
        </v-tab>
      </v-tabs>

      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="filteredCompanies"
          :loading="loading"
          hover
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <v-avatar color="primary" size="32" class="mr-3">
                <span class="text-caption text-white">
                  {{ item.name.slice(0, 2).toUpperCase() }}
                </span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
              </div>
            </div>
          </template>

          <template #item.location="{ item }">
            {{ item.city }}
          </template>

          <template #item.services="{ item }">
            <v-chip
              v-for="service in item.services.slice(0, 2)"
              :key="service"
              size="x-small"
              class="mr-1"
            >
              {{ formatServiceName(service) }}
            </v-chip>
            <v-chip
              v-if="item.services.length > 2"
              size="x-small"
              variant="outlined"
            >
              +{{ item.services.length - 2 }}
            </v-chip>
          </template>

          <template #item.pricing="{ item }">
            <div v-if="item.pricingConditions">
              <div class="text-caption">
                € {{ item.pricingConditions.hourlyRate }}/h
              </div>
              <div class="text-caption text-medium-emphasis">
                + € {{ item.pricingConditions.travelFee }} Anfahrt
              </div>
            </div>
            <span v-else class="text-caption text-medium-emphasis">-</span>
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

          <template #item.actions="{ item }">
            <v-btn
              color="primary"
              size="small"
              variant="text"
              :to="`/admin/companies/${item.id}`"
            >
              Details
            </v-btn>
          </template>

          <template #no-data>
            <div class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-domain-off
              </v-icon>
              <h3 class="text-h6 mb-2">Keine Firmen</h3>
              <p class="text-body-1 text-medium-emphasis">
                Keine Firmen im Status "{{ getStatusLabel(activeTab) }}" vorhanden.
              </p>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAdminStore } from '@/stores'
import { CompanyStatus } from '@/types'

const adminStore = useAdminStore()

const activeTab = ref<CompanyStatus>('PENDING' as CompanyStatus)
const headers = [
  { title: 'Firma', key: 'name' },
  { title: 'Ort', key: 'location' },
  { title: 'Dienstleistungen', key: 'services' },
  { title: 'Preise', key: 'pricing' },
  { title: 'Status', key: 'status' },
  { title: 'Registriert', key: 'createdAt' },
  { title: '', key: 'actions', sortable: false }
]

const loading = computed(() => adminStore.loading)
const companies = computed(() => adminStore.companies)
const pendingCompanies = computed(() => adminStore.pendingCompanies)
const approvedCompanies = computed(() => adminStore.approvedCompanies)
const rejectedCompanies = computed(() => adminStore.rejectedCompanies)

// Stats from backend
const pendingCount = computed(() => adminStore.pendingCount)
const approvedCount = computed(() => adminStore.approvedCount)
const rejectedCount = computed(() => adminStore.rejectedCount)
const totalCount = computed(() => adminStore.totalCount)

const filteredCompanies = computed(() => {
  switch (activeTab.value) {
    case 'PENDING':
      return pendingCompanies.value
    case 'APPROVED':
      return approvedCompanies.value
    case 'REJECTED':
      return rejectedCompanies.value
    default:
      return companies.value
  }
})

watch(activeTab, (newTab) => {
  loadCompanies(newTab)
})

onMounted(async () => {
  // Load stats for all statuses
  await adminStore.loadStats()
  // Load companies for current tab
  await loadCompanies(activeTab.value)
})

async function loadCompanies(status: CompanyStatus) {
  try {
    await adminStore.loadCompanies(status)
  } catch (err) {
    console.error('Failed to load companies:', err)
  }
}

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

function getStatusColor(status: CompanyStatus): string {
  const colors: Record<string, string> = {
    [CompanyStatus.PENDING]: 'warning',
    [CompanyStatus.APPROVED]: 'success',
    [CompanyStatus.REJECTED]: 'error'
  }
  return colors[status] || 'grey'
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    [CompanyStatus.PENDING]: 'Ausstehend',
    [CompanyStatus.APPROVED]: 'Freigeschaltet',
    [CompanyStatus.REJECTED]: 'Abgelehnt'
  }
  return labels[status] || status
}
</script>
