import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { defineStore } from 'pinia'
import { api } from './api'

export type ItemSource = 'AI_DETECTED' | 'MANUAL'

export interface InventoryItem {
  name: string
  quantity: number
  confidence: number | null
  source: ItemSource
  category: string | null
  volume: number | null
  totalVolume: number
}

export interface InventoryList {
  id: string
  offerId: string
  status: 'DRAFT' | 'CONFIRMED'
  items: InventoryItem[]
  itemTypeCount: number
  totalItemCount: number
  aiDetectedItemCount: number
  manualItemCount: number
  averageAiConfidence: number | null
  totalVolume: number
  createdAt: string
  confirmedAt: string | null
}

export interface CreateInventoryItemData {
  name: string
  quantity: number
  category?: string
  volume?: number
}

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const currentInventory: Ref<InventoryList | null> = ref(null)
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const isEditing: Ref<boolean> = ref(false)

  // Getters
  const canEdit: ComputedRef<boolean> = computed(() => 
    currentInventory.value?.status === 'DRAFT' ?? false
  )
  
  const isConfirmed: ComputedRef<boolean> = computed(() => 
    currentInventory.value?.status === 'CONFIRMED' ?? false
  )

  const aiDetectedItems: ComputedRef<InventoryItem[]> = computed(() =>
    currentInventory.value?.items.filter(item => item.source === 'AI_DETECTED') ?? []
  )

  const manualItems: ComputedRef<InventoryItem[]> = computed(() =>
    currentInventory.value?.items.filter(item => item.source === 'MANUAL') ?? []
  )

  // Actions
  const fetchInventory = async (inventoryId: string): Promise<InventoryList> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<InventoryList>(`/inventories/${inventoryId}`)
      currentInventory.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch inventory.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const fetchInventoryByOffer = async (offerId: string): Promise<InventoryList> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<InventoryList>(`/inventories/by-offer/${offerId}`)
      currentInventory.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch inventory for offer.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const addItem = async (inventoryId: string, itemData: CreateInventoryItemData): Promise<InventoryList> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<InventoryList>(`/inventories/${inventoryId}/items`, itemData)
      currentInventory.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add item.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const updateItem = async (inventoryId: string, itemIndex: number, updates: Partial<CreateInventoryItemData>): Promise<InventoryList> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.patch<InventoryList>(`/inventories/${inventoryId}/items/${itemIndex}`, updates)
      currentInventory.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update item.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const removeItem = async (inventoryId: string, itemIndex: number): Promise<InventoryList> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.delete<InventoryList>(`/inventories/${inventoryId}/items/${itemIndex}`)
      currentInventory.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to remove item.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const replaceAllItems = async (inventoryId: string, items: CreateInventoryItemData[]): Promise<InventoryList> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.put<InventoryList>(`/inventories/${inventoryId}/items`, items)
      currentInventory.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update items.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const confirmInventory = async (inventoryId: string): Promise<InventoryList> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<InventoryList>(`/inventories/${inventoryId}/confirm`)
      currentInventory.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to confirm inventory.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const setEditing = (editing: boolean): void => {
    isEditing.value = editing
  }

  const clearError = (): void => {
    error.value = null
  }

  const resetStore = (): void => {
    currentInventory.value = null
    loading.value = false
    error.value = null
    isEditing.value = false
  }

  return {
    // State
    currentInventory,
    loading,
    error,
    isEditing,
    // Getters
    canEdit,
    isConfirmed,
    aiDetectedItems,
    manualItems,
    // Actions
    fetchInventory,
    fetchInventoryByOffer,
    addItem,
    updateItem,
    removeItem,
    replaceAllItems,
    confirmInventory,
    setEditing,
    clearError,
    resetStore,
  }
})

export default useInventoryStore
