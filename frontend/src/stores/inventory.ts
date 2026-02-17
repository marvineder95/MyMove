import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  InventoryResponse, 
  InventoryItemRequest, 
  UpdateInventoryItemRequest,
  InventoryItemResponse 
} from '@/types'
import { inventoryApi } from '@/api'

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const currentInventory = ref<InventoryResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const items = computed(() => currentInventory.value?.items || [])
  const isConfirmed = computed(() => currentInventory.value?.status === 'CONFIRMED')
  const totalVolume = computed(() => currentInventory.value?.totalVolume || 0)
  const aiDetectedCount = computed(() => currentInventory.value?.aiDetectedItemCount || 0)
  const manualCount = computed(() => currentInventory.value?.manualItemCount || 0)

  // Actions
  async function fetchInventory(inventoryId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await inventoryApi.getById(inventoryId)
      currentInventory.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to fetch inventory'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchInventoryByOffer(offerId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await inventoryApi.getByOfferId(offerId)
      currentInventory.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to fetch inventory'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addItem(request: InventoryItemRequest) {
    if (!currentInventory.value) return
    
    loading.value = true
    error.value = null

    try {
      const response = await inventoryApi.addItem(currentInventory.value.id, request)
      currentInventory.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to add item'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateItem(index: number, request: UpdateInventoryItemRequest) {
    if (!currentInventory.value) return
    
    loading.value = true
    error.value = null

    try {
      const response = await inventoryApi.updateItem(currentInventory.value.id, index, request)
      currentInventory.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to update item'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function removeItem(index: number) {
    if (!currentInventory.value) return
    
    loading.value = true
    error.value = null

    try {
      const response = await inventoryApi.removeItem(currentInventory.value.id, index)
      currentInventory.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to remove item'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function replaceAllItems(items: InventoryItemRequest[]) {
    if (!currentInventory.value) return
    
    loading.value = true
    error.value = null

    try {
      const response = await inventoryApi.replaceItems(currentInventory.value.id, items)
      currentInventory.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to replace items'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function confirmInventory() {
    if (!currentInventory.value) return
    
    loading.value = true
    error.value = null

    try {
      const response = await inventoryApi.confirm(currentInventory.value.id)
      currentInventory.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to confirm inventory'
      throw err
    } finally {
      loading.value = false
    }
  }

  function setInventory(inventory: InventoryResponse) {
    currentInventory.value = inventory
  }

  function clearInventory() {
    currentInventory.value = null
  }

  return {
    currentInventory,
    items,
    isConfirmed,
    totalVolume,
    aiDetectedCount,
    manualCount,
    loading,
    error,
    fetchInventory,
    fetchInventoryByOffer,
    addItem,
    updateItem,
    removeItem,
    replaceAllItems,
    confirmInventory,
    setInventory,
    clearInventory
  }
})
