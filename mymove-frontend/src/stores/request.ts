import { defineStore } from 'pinia'
import { ref } from 'vue'
import { requestsApi } from '@/api/requests'
import type { MoveRequest, InventoryItem, CreateItemPayload, EstimateResult } from '@/types'

export const useRequestStore = defineStore('request', () => {
  const requests = ref<MoveRequest[]>([])
  const currentRequest = ref<MoveRequest | null>(null)
  const items = ref<InventoryItem[]>([])
  const estimate = ref<EstimateResult | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMyRequests(page = 1, limit = 10) {
    isLoading.value = true
    try {
      const { data } = await requestsApi.getMy(page, limit)
      requests.value = data.data
      return data.meta
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to load requests'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRequest(id: number) {
    isLoading.value = true
    try {
      const { data } = await requestsApi.getById(id)
      currentRequest.value = data
      return data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to load request'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createRequest(payload: {
    originAddress: string
    destinationAddress: string
    moveDate: string
    floorsOrigin?: number
    floorsDestination?: number
    elevator?: boolean
    parkingDistance?: number
    extras?: { assemblyRequired: boolean; boxesNeeded: boolean; noParkingZoneRequired: boolean; isFlexibleDate?: boolean }
  }) {
    isLoading.value = true
    try {
      const { data } = await requestsApi.create(payload)
      currentRequest.value = data
      requests.value.unshift(data)
      return data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to create request'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchItems(requestId: number) {
    try {
      const { data } = await requestsApi.getItems(requestId)
      items.value = data
      return data
    } catch {
      items.value = []
      return []
    }
  }

  async function addItem(requestId: number, payload: CreateItemPayload) {
    try {
      const { data } = await requestsApi.addItem(requestId, payload)
      items.value.unshift(data)
      return data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to add item'
      return null
    }
  }

  async function updateItem(requestId: number, itemId: number, payload: Partial<CreateItemPayload>) {
    try {
      const { data } = await requestsApi.updateItem(requestId, itemId, payload)
      const idx = items.value.findIndex((i) => i.id === itemId)
      if (idx !== -1) items.value[idx] = data
      return data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to update item'
      return null
    }
  }

  async function deleteItem(requestId: number, itemId: number) {
    try {
      await requestsApi.deleteItem(requestId, itemId)
      items.value = items.value.filter((i) => i.id !== itemId)
      return true
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to delete item'
      return false
    }
  }

  async function fetchEstimate(requestId: number, distanceKm: number) {
    isLoading.value = true
    try {
      const { data } = await requestsApi.getEstimate(requestId, distanceKm)
      estimate.value = data
      return data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to get estimate'
      return null
    } finally {
      isLoading.value = false
    }
  }

  function clearEstimate() {
    estimate.value = null
  }

  return {
    requests,
    currentRequest,
    items,
    estimate,
    isLoading,
    error,
    fetchMyRequests,
    fetchRequest,
    createRequest,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    fetchEstimate,
    clearEstimate,
  }
})
