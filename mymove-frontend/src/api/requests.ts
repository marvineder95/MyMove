import api from './index'
import type {
  MoveRequest,
  CreateMoveRequestPayload,
  InventoryItem,
  CreateItemPayload,
  UpdateItemPayload,
  EstimateResult,
} from '@/types'

export const requestsApi = {
  create: (payload: CreateMoveRequestPayload) =>
    api.post<MoveRequest>('/requests', payload),

  getMy: (page = 1, limit = 10) =>
    api.get<{ data: MoveRequest[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/requests/my?page=${page}&limit=${limit}`),

  getById: (id: number) =>
    api.get<MoveRequest>(`/requests/${id}`),

  update: (id: number, payload: Partial<CreateMoveRequestPayload>) =>
    api.patch<MoveRequest>(`/requests/${id}`, payload),

  updateStatus: (id: number, status: string, selectedCompanyId?: number) =>
    api.patch<MoveRequest>(`/requests/${id}/status`, { status, selectedCompanyId }),

  delete: (id: number) =>
    api.delete(`/requests/${id}`),

  // Video
  initiateVideo: (id: number) =>
    api.post<{ uploadUrl: string; s3Key: string; videoId: number; expiresAt: string }>(`/requests/${id}/video`, {}),

  uploadVideo: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('video', file)
    return api.post<{ id: number; s3Url: string | null }>(`/requests/${id}/video/upload`, formData)
  },

  confirmVideo: (id: number, videoId: number) =>
    api.post(`/requests/${id}/video/confirm`, { videoId }),

  // Inventory
  getItems: (id: number) =>
    api.get<InventoryItem[]>(`/requests/${id}/items`),

  addItem: (id: number, payload: CreateItemPayload) =>
    api.post<InventoryItem>(`/requests/${id}/items`, payload),

  updateItem: (id: number, itemId: number, payload: UpdateItemPayload) =>
    api.patch<InventoryItem>(`/requests/${id}/items/${itemId}`, payload),

  deleteItem: (id: number, itemId: number) =>
    api.delete(`/requests/${id}/items/${itemId}`),

  bulkReplaceItems: (id: number, items: CreateItemPayload[]) =>
    api.put<InventoryItem[]>(`/requests/${id}/items`, { items }),

  getInventorySummary: (id: number) =>
    api.get<{ totalItems: number; totalQuantity: number; totalVolume: number; totalWeight: number; aiDetectedCount: number }>(`/requests/${id}/items/summary`),

  // Estimate
  getEstimate: (id: number, distanceKm: number) =>
    api.get<EstimateResult>(`/requests/${id}/estimate?distance_km=${distanceKm}`),
}
