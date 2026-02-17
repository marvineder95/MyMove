<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          {{ $t('inventory.title') }}
        </h1>
        <p class="mt-2 text-gray-600">
          {{ $t('inventory.subtitle') }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-700">{{ error }}</p>
        <Button @click="loadInventory" variant="secondary" class="mt-2">
          {{ $t('common.retry') }}
        </Button>
      </div>

      <!-- Content -->
      <template v-else-if="inventory">
        <!-- AI Info Banner -->
        <div v-if="hasAiItems" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div class="flex items-start">
            <svg class="h-5 w-5 text-blue-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-blue-800 font-medium">
                {{ $t('inventory.aiDetected', { count: inventory.aiDetectedItemCount }) }}
              </p>
              <p v-if="inventory.averageAiConfidence" class="text-blue-600 text-sm mt-1">
                {{ $t('inventory.confidence', { percentage: Math.round(inventory.averageAiConfidence * 100) }) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <div class="text-center">
              <p class="text-sm text-gray-500">{{ $t('inventory.totalItems') }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ inventory.totalItemCount }}</p>
            </div>
          </Card>
          <Card>
            <div class="text-center">
              <p class="text-sm text-gray-500">{{ $t('inventory.categories') }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ inventory.itemTypeCount }}</p>
            </div>
          </Card>
          <Card>
            <div class="text-center">
              <p class="text-sm text-gray-500">{{ $t('inventory.totalVolume') }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ inventory.totalVolume.toFixed(2) }} m³</p>
            </div>
          </Card>
          <Card>
            <div class="text-center">
              <p class="text-sm text-gray-500">{{ $t('inventory.status') }}</p>
              <span :class="statusBadgeClass" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ inventory.status }}
              </span>
            </div>
          </Card>
        </div>

        <!-- Inventory List -->
        <Card class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-900">{{ $t('inventory.items') }}</h2>
            <Button v-if="canEdit" @click="showAddModal = true" variant="primary" size="sm">
              + {{ $t('inventory.addItem') }}
            </Button>
          </div>

          <div class="space-y-2">
            <div
              v-for="(item, index) in inventory.items"
              :key="index"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center space-x-4">
                <!-- AI/Manual Badge -->
                <span
                  :class="item.source === 'AI_DETECTED' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                >
                  {{ item.source === 'AI_DETECTED' ? 'AI' : $t('inventory.manual') }}
                </span>
                
                <div>
                  <p class="font-medium text-gray-900">{{ item.name }}</p>
                  <p v-if="item.category" class="text-sm text-gray-500">{{ item.category }}</p>
                </div>
              </div>

              <div class="flex items-center space-x-4">
                <div class="text-right">
                  <p class="text-sm text-gray-900">
                    {{ $t('inventory.quantity') }}: {{ item.quantity }}
                  </p>
                  <p v-if="item.volume" class="text-sm text-gray-500">
                    {{ item.volume.toFixed(2) }} m³
                  </p>
                </div>

                <!-- Confidence for AI items -->
                <div v-if="item.confidence" class="w-16">
                  <div class="text-xs text-gray-500 mb-1">{{ Math.round(item.confidence * 100) }}%</div>
                  <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      class="bg-blue-600 h-1.5 rounded-full"
                      :style="{ width: `${item.confidence * 100}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Actions -->
                <div v-if="canEdit" class="flex space-x-2">
                  <button
                    @click="editItem(index, item)"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="removeItem(index)"
                    class="text-red-600 hover:text-red-800"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="inventory.items.length === 0" class="text-center py-8 text-gray-500">
            {{ $t('inventory.empty') }}
          </div>
        </Card>

        <!-- Confirm Button -->
        <div v-if="canEdit" class="flex justify-end space-x-4">
          <Button @click="confirmInventory" variant="primary" size="lg" :loading="confirming">
            {{ $t('inventory.confirm') }}
          </Button>
        </div>

        <!-- Already Confirmed Message -->
        <div v-else-if="isConfirmed" class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p class="text-green-800 font-medium">
            {{ $t('inventory.confirmedMessage') }}
          </p>
          <router-link
            :to="`/offers/${inventory.offerId}/offers`"
            class="mt-2 inline-block text-blue-600 hover:text-blue-800"
          >
            {{ $t('inventory.viewOffers') }} →
          </router-link>
        </div>
      </template>

      <!-- Add/Edit Modal -->
      <Modal v-model="showAddModal" :title="editingItem ? $t('inventory.editItem') : $t('inventory.addItem')">
        <form @submit.prevent="saveItem" class="space-y-4">
          <FormInput
            v-model="itemForm.name"
            :label="$t('inventory.itemName')"
            required
          />
          <FormInput
            v-model.number="itemForm.quantity"
            type="number"
            :label="$t('inventory.quantity')"
            min="1"
            required
          />
          <FormInput
            v-model="itemForm.category"
            :label="$t('inventory.category')"
            placeholder="z.B. Möbel, Elektronik"
          />
          <FormInput
            v-model.number="itemForm.volume"
            type="number"
            step="0.01"
            :label="$t('inventory.volumeM3')"
            placeholder="Optional"
          />
          <div class="flex justify-end space-x-2">
            <Button type="button" variant="secondary" @click="showAddModal = false">
              {{ $t('common.cancel') }}
            </Button>
            <Button type="submit" variant="primary" :loading="savingItem">
              {{ editingItem ? $t('common.save') : $t('common.add') }}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInventoryStore, type InventoryItem, type CreateInventoryItemData } from '../stores/inventory'
import { storeToRefs } from 'pinia'
import Card from '../components/UI/Card.vue'
import Button from '../components/UI/Button.vue'
import LoadingSpinner from '../components/UI/LoadingSpinner.vue'
import FormInput from '../components/UI/FormInput.vue'
import Modal from '../components/UI/Modal.vue'

const route = useRoute()
const router = useRouter()
const inventoryStore = useInventoryStore()

const { currentInventory: inventory, loading, error, canEdit, isConfirmed } = storeToRefs(inventoryStore)

const showAddModal = ref(false)
const editingItem = ref<number | null>(null)
const savingItem = ref(false)
const confirming = ref(false)

const itemForm = ref<CreateInventoryItemData>({
  name: '',
  quantity: 1,
  category: '',
  volume: undefined,
})

const hasAiItems = computed(() => 
  inventory.value?.items.some(item => item.source === 'AI_DETECTED') ?? false
)

const statusBadgeClass = computed(() => {
  if (inventory.value?.status === 'CONFIRMED') {
    return 'bg-green-100 text-green-800'
  }
  return 'bg-yellow-100 text-yellow-800'
})

const loadInventory = async () => {
  const inventoryId = route.params.id as string
  if (inventoryId) {
    await inventoryStore.fetchInventory(inventoryId)
  }
}

const editItem = (index: number, item: InventoryItem) => {
  editingItem.value = index
  itemForm.value = {
    name: item.name,
    quantity: item.quantity,
    category: item.category || '',
    volume: item.volume || undefined,
  }
  showAddModal.value = true
}

const saveItem = async () => {
  if (!inventory.value) return
  
  savingItem.value = true
  try {
    if (editingItem.value !== null) {
      await inventoryStore.updateItem(inventory.value.id, editingItem.value, itemForm.value)
    } else {
      await inventoryStore.addItem(inventory.value.id, itemForm.value)
    }
    showAddModal.value = false
    resetForm()
  } finally {
    savingItem.value = false
  }
}

const removeItem = async (index: number) => {
  if (!inventory.value) return
  if (!confirm('Möchten Sie diesen Artikel wirklich entfernen?')) return
  
  await inventoryStore.removeItem(inventory.value.id, index)
}

const confirmInventory = async () => {
  if (!inventory.value) return
  if (!confirm('Nach der Bestätigung können Sie die Inventarliste nicht mehr bearbeiten. Fortfahren?')) return
  
  confirming.value = true
  try {
    await inventoryStore.confirmInventory(inventory.value.id)
    // Redirect to offers comparison page
    router.push(`/offers/${inventory.value.offerId}/offers`)
  } finally {
    confirming.value = false
  }
}

const resetForm = () => {
  editingItem.value = null
  itemForm.value = {
    name: '',
    quantity: 1,
    category: '',
    volume: undefined,
  }
}

onMounted(() => {
  loadInventory()
})
</script>
