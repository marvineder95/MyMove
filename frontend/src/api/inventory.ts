import { apiClient } from './client'
import type { 
  InventoryResponse, 
  InventoryItemRequest, 
  UpdateInventoryItemRequest 
} from '@/types'

export const inventoryApi = {
  /**
   * Get inventory by ID
   */
  getById(id: string): Promise<InventoryResponse> {
    return apiClient.get(`/v1/inventories/${id}`)
  },

  /**
   * Get inventory by offer ID
   */
  getByOfferId(offerId: string): Promise<InventoryResponse> {
    return apiClient.get(`/v1/inventories/by-offer/${offerId}`)
  },

  /**
   * Add item to inventory
   */
  addItem(inventoryId: string, request: InventoryItemRequest): Promise<InventoryResponse> {
    return apiClient.post(`/v1/inventories/${inventoryId}/items`, request)
  },

  /**
   * Update item in inventory
   */
  updateItem(inventoryId: string, index: number, request: UpdateInventoryItemRequest): Promise<InventoryResponse> {
    return apiClient.patch(`/v1/inventories/${inventoryId}/items/${index}`, request)
  },

  /**
   * Remove item from inventory
   */
  removeItem(inventoryId: string, index: number): Promise<InventoryResponse> {
    return apiClient.delete(`/v1/inventories/${inventoryId}/items/${index}`)
  },

  /**
   * Replace all items (bulk update)
   */
  replaceItems(inventoryId: string, items: InventoryItemRequest[]): Promise<InventoryResponse> {
    return apiClient.put(`/v1/inventories/${inventoryId}/items`, items)
  },

  /**
   * Confirm inventory
   */
  confirm(inventoryId: string): Promise<InventoryResponse> {
    return apiClient.post(`/v1/inventories/${inventoryId}/confirm`)
  }
}
