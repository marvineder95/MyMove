<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { adminApi, type AdminCompany, type CompanyDocument } from '@/api/admin'
import AdminLayout from '@/components/admin/AdminLayout.vue'

const { success: toastSuccess, error: toastError } = useToast()

const router = useRouter()
const authStore = useAuthStore()

const companies = ref<AdminCompany[]>([])
const isLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const statusFilter = ref('')
const selectedCompany = ref<AdminCompany | null>(null)
const showModal = ref(false)
const rejectReason = ref('')
const actionLoading = ref(false)

// Document reject modal
const rejectDocModalOpen = ref(false)
const rejectDocTarget = ref<CompanyDocument | null>(null)
const rejectDocReason = ref('')

onMounted(async () => {
  if (authStore.user?.role !== 'ADMIN') {
    router.push('/')
    return
  }
  await loadCompanies()
})

async function loadCompanies() {
  isLoading.value = true
  try {
    const { data } = await adminApi.getCompanies(
      currentPage.value,
      20,
      statusFilter.value || undefined,
    )
    companies.value = data.data
    totalPages.value = data.meta.totalPages
  } catch {
    // ignore
  } finally {
    isLoading.value = false
  }
}

function tradeLicenseStatus(company: AdminCompany): { label: string; class: string } {
  const doc = company.documents?.find((d) => d.documentType === 'TRADE_LICENSE')
  if (!doc) return { label: 'Nicht hochgeladen', class: 'bg-gray-100 text-gray-500' }
  if (doc.status === 'PENDING') return { label: 'Ausstehend', class: 'bg-amber-100 text-amber-700' }
  if (doc.status === 'VERIFIED') return { label: 'Geprüft', class: 'bg-green-100 text-green-700' }
  if (doc.status === 'REJECTED') return { label: 'Abgelehnt', class: 'bg-red-100 text-red-700' }
  return { label: doc.status, class: 'bg-gray-100 text-gray-500' }
}

function companyStatusClass(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    SUSPENDED: 'bg-gray-100 text-gray-500',
  }
  return map[status] || 'bg-gray-100 text-gray-500'
}

function openModal(company: AdminCompany) {
  selectedCompany.value = company
  rejectReason.value = ''
  showModal.value = true
}

async function approve(company: AdminCompany) {
  actionLoading.value = true
  try {
    await adminApi.approveCompany(company.id)
    showModal.value = false
    toastSuccess('✓ Unternehmen genehmigt', `${company.companyName} wurde erfolgreich freigegeben.`)
    await loadCompanies()
  } catch {
    toastError('✗ Genehmigung fehlgeschlagen')
  } finally {
    actionLoading.value = false
  }
}

async function reject(company: AdminCompany) {
  if (!rejectReason.value.trim()) return
  actionLoading.value = true
  try {
    await adminApi.rejectCompany(company.id, rejectReason.value.trim())
    showModal.value = false
    toastSuccess('✗ Unternehmen abgelehnt', `${company.companyName} wurde abgelehnt.`)
    await loadCompanies()
  } catch {
    toastError('✗ Ablehnung fehlgeschlagen')
  } finally {
    actionLoading.value = false
  }
}

async function suspend(company: AdminCompany) {
  const reason = prompt('Grund für die Sperrung:')
  if (!reason) return
  actionLoading.value = true
  try {
    await adminApi.suspendCompany(company.id, reason)
    showModal.value = false
    toastSuccess('✗ Unternehmen gesperrt', `${company.companyName} wurde gesperrt.`)
    await loadCompanies()
  } catch {
    toastError('✗ Sperrung fehlgeschlagen')
  } finally {
    actionLoading.value = false
  }
}

async function verifyDocument(doc: CompanyDocument) {
  actionLoading.value = true
  try {
    await adminApi.verifyDocument(doc.id)
    showModal.value = false
    toastSuccess('✓ Gewerbeschein geprüft & freigegeben', 'Das Dokument wurde erfolgreich verifiziert.')
    await loadCompanies()
  } catch {
    toastError('✗ Verifizierung fehlgeschlagen')
  } finally {
    actionLoading.value = false
  }
}

function rejectDocument(doc: CompanyDocument) {
  rejectDocTarget.value = doc
  rejectDocReason.value = ''
  rejectDocModalOpen.value = true
}

async function confirmRejectDocument() {
  if (!rejectDocTarget.value || !rejectDocReason.value.trim()) return
  actionLoading.value = true
  try {
    await adminApi.rejectDocument(rejectDocTarget.value.id, rejectDocReason.value.trim())
    rejectDocModalOpen.value = false
    showModal.value = false
    toastSuccess('✗ Gewerbeschein abgelehnt', `Dokument abgelehnt: ${rejectDocReason.value.trim()}`)
    await loadCompanies()
  } catch {
    toastError('✗ Ablehnung fehlgeschlagen')
  } finally {
    actionLoading.value = false
    rejectDocTarget.value = null
  }
}

async function resetDocument(doc: CompanyDocument) {
  actionLoading.value = true
  try {
    await adminApi.resetDocument(doc.id)
    showModal.value = false
    toastSuccess('↩ Gewerbeschein zurückgesetzt', 'Das Dokument wurde auf Ausstehend gesetzt.')
    await loadCompanies()
  } catch {
    toastError('↩ Zurücksetzen fehlgeschlagen')
  } finally {
    actionLoading.value = false
  }
}

const statusOptions = [
  { value: '', label: 'Alle Status' },
  { value: 'PENDING', label: 'Ausstehend' },
  { value: 'APPROVED', label: 'Genehmigt' },
  { value: 'REJECTED', label: 'Abgelehnt' },
  { value: 'SUSPENDED', label: 'Gesperrt' },
]

watch(statusFilter, () => {
  currentPage.value = 1
  loadCompanies()
})
</script>

<template>
  <AdminLayout>
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Unternehmen</h1>
          <p class="text-gray-500 mt-1">Alle registrierten Unternehmen verwalten</p>
        </div>
        <select
          v-model="statusFilter"
          class="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-primary-500"
        >
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">ID</th>
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Unternehmen</th>
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Gewerbeschein</th>
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Registriert</th>
                <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="6" class="px-6 py-8 text-center text-gray-400">Laden...</td>
              </tr>
              <tr v-else-if="companies.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-400">Keine Unternehmen gefunden</td>
              </tr>
              <tr
                v-for="company in companies"
                :key="company.id"
                class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td class="px-6 py-4 text-sm text-gray-500">#{{ company.id }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400">
                      {{ company.companyName?.slice(0, 2).toUpperCase() }}
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ company.companyName }}</p>
                      <p class="text-xs text-gray-400">{{ company.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span :class="['text-xs font-medium px-2.5 py-1 rounded-full', companyStatusClass(company.status)]">
                    {{ company.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span :class="['text-xs font-medium px-2.5 py-1 rounded-full', tradeLicenseStatus(company).class]">
                    {{ tradeLicenseStatus(company).label }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ new Date(company.createdAt).toLocaleDateString('de-DE') }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button
                      @click="openModal(company)"
                      class="text-xs font-medium text-primary-600 hover:text-primary-700 px-2 py-1 rounded-lg hover:bg-primary-50 transition-colors"
                    >
                      Details
                    </button>
                    <button
                      v-if="company.status === 'PENDING'"
                      @click="approve(company)"
                      :disabled="actionLoading"
                      class="text-xs font-medium text-green-600 hover:text-green-700 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      Genehmigen
                    </button>
                    <button
                      v-if="company.status === 'PENDING'"
                      @click="openModal(company)"
                      :disabled="actionLoading"
                      class="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Ablehnen
                    </button>
                    <button
                      v-if="company.status === 'APPROVED'"
                      @click="suspend(company)"
                      :disabled="actionLoading"
                      class="text-xs font-medium text-gray-600 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Sperren
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button
            @click="currentPage--; loadCompanies()"
            :disabled="currentPage <= 1"
            class="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
          >
            ← Zurück
          </button>
          <span class="text-sm text-gray-500">Seite {{ currentPage }} / {{ totalPages }}</span>
          <button
            @click="currentPage++; loadCompanies()"
            :disabled="currentPage >= totalPages"
            class="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
          >
            Weiter →
          </button>
        </div>
      </div>
    </div>

    <!-- Company Detail Modal -->
    <div v-if="showModal && selectedCompany" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showModal = false"></div>
      <div class="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedCompany.companyName }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500">E-Mail</p>
              <p class="font-medium text-gray-900">{{ selectedCompany.email || '—' }}</p>
            </div>
            <div>
              <p class="text-gray-500">Telefon</p>
              <p class="font-medium text-gray-900">{{ selectedCompany.phone || '—' }}</p>
            </div>
            <div>
              <p class="text-gray-500">Website</p>
              <p class="font-medium text-gray-900">{{ selectedCompany.website || '—' }}</p>
            </div>
            <div>
              <p class="text-gray-500">Steuernummer</p>
              <p class="font-medium text-gray-900">{{ selectedCompany.taxId || '—' }}</p>
            </div>
            <div>
              <p class="text-gray-500">Standort</p>
              <p class="font-medium text-gray-900">{{ selectedCompany.mainLocation || '—' }}</p>
            </div>
            <div>
              <p class="text-gray-500">Status</p>
              <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', companyStatusClass(selectedCompany.status)]">
                {{ selectedCompany.status }}
              </span>
            </div>
          </div>

          <div class="border-t border-gray-100 pt-4">
            <h4 class="text-sm font-semibold text-gray-900 mb-2">Dokumente</h4>
            <div v-if="!selectedCompany.documents?.length" class="text-sm text-gray-400">
              Keine Dokumente hochgeladen
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="doc in selectedCompany.documents"
                :key="doc.id"
                class="p-3 bg-gray-50 rounded-xl"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                      <path d="M14 3v5h5M16 13H8M16 17H8M10 9H8" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ doc.documentType === 'TRADE_LICENSE' ? 'Gewerbeschein' : doc.documentType }}</p>
                      <a
                        :href="doc.fileUrl"
                        target="_blank"
                        class="text-xs text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        {{ doc.fileName }}
                      </a>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span :class="['text-xs font-medium px-2 py-0.5 rounded-full',
                      doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                      doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700']">
                      {{ doc.status === 'PENDING' ? 'Ausstehend' : doc.status === 'VERIFIED' ? 'Geprüft' : 'Abgelehnt' }}
                    </span>
                  </div>
                </div>

                <!-- PDF Preview -->
                <div v-if="doc.fileUrl?.endsWith('.pdf')" class="mt-2 border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <iframe
                    :src="doc.fileUrl"
                    class="w-full h-64"
                    type="application/pdf"
                  ></iframe>
                </div>

                <!-- Action buttons -->
                <div class="flex items-center gap-2 mt-2 flex-wrap">
                  <button
                    v-if="doc.status !== 'VERIFIED'"
                    @click="verifyDocument(doc)"
                    :disabled="actionLoading"
                    class="text-xs font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {{ doc.status === 'REJECTED' ? '✓ Freigeben' : '✓ Prüfen & freigeben' }}
                  </button>
                  <button
                    v-if="doc.status !== 'REJECTED'"
                    @click="rejectDocument(doc)"
                    :disabled="actionLoading"
                    class="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Ablehnen
                  </button>
                  <button
                    v-if="doc.status !== 'PENDING'"
                    @click="resetDocument(doc)"
                    :disabled="actionLoading"
                    class="text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    ↩ Auf ausstehend setzen
                  </button>
                </div>

                <div v-if="doc.rejectionReason" class="mt-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  Ablehnungsgrund: {{ doc.rejectionReason }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedCompany.status === 'PENDING'" class="border-t border-gray-100 pt-4">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Ablehnungsgrund
            </label>
            <textarea
              v-model="rejectReason"
              rows="2"
              placeholder="Grund für die Ablehnung..."
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-primary-500 resize-none"
            ></textarea>
            <div class="flex gap-2 mt-3">
              <button
                @click="approve(selectedCompany)"
                :disabled="actionLoading"
                class="flex-1 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors"
              >
                Genehmigen
              </button>
              <button
                @click="reject(selectedCompany)"
                :disabled="actionLoading || !rejectReason.trim()"
                class="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl transition-colors"
              >
                Ablehnen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Document Reason Modal -->
    <div v-if="rejectDocModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="rejectDocModalOpen = false"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <span class="text-red-600 text-lg">✗</span>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Dokument ablehnen</h3>
            <p class="text-sm text-gray-500">{{ rejectDocTarget?.fileName }}</p>
          </div>
        </div>

        <div class="space-y-3">
          <label class="block text-sm font-medium text-gray-700">
            Grund für die Ablehnung <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="rejectDocReason"
            rows="3"
            placeholder="z.B. Gewerbeschein unvollständig, falsche Daten, abgelaufen..."
            class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 resize-none transition-all"
            @keydown.enter.prevent="confirmRejectDocument"
          ></textarea>
          <p v-if="!rejectDocReason.trim()" class="text-xs text-gray-400">
            Bitte gib einen Grund ein, um fortzufahren.
          </p>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="rejectDocModalOpen = false"
            class="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Abbrechen
          </button>
          <button
            @click="confirmRejectDocument"
            :disabled="actionLoading || !rejectDocReason.trim()"
            class="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            {{ actionLoading ? 'Wird abgelehnt...' : 'Ablehnen' }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
