import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { defineStore } from 'pinia'
import { api } from './api'

// Types
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'expired'
export type MoveSize = 'small' | 'medium' | 'large' | 'office'

export interface MoveDetails {
  moveSize: MoveSize
  rooms: number
  floorFrom: number
  floorTo: number
  hasElevatorFrom: boolean
  hasElevatorTo: boolean
  distanceKm: number
}

export interface ServiceDetails {
  packingService: boolean
  unpackingService: boolean
  storageService: boolean
  cleaningService: boolean
  disposalService: boolean
  specialItems: string[]
}

export interface Offer {
  id: string
  companyId: string
  companyName: string
  companyLogo?: string

  fromAddress: string
  toAddress: string
  moveDate: string
  moveDetails: MoveDetails
  serviceDetails: ServiceDetails

  // Pricing
  basePrice: number
  servicePrice: number
  totalPrice: number
  currency: string
  validUntil: string

  // Status
  status: OfferStatus

  // Timestamps
  createdAt: string
  updatedAt: string
}

// Für das interne Management (Company Dashboard)
export interface CreateOfferData {
  fromAddress: string
  toAddress: string
  moveDate: string
  moveDetails: MoveDetails
  serviceDetails: ServiceDetails
  basePrice: number
  servicePrice: number
  totalPrice: number
  validUntil: string
}

// Für das öffentliche Formular (PublicOfferForm.vue)
export interface CreatePublicOfferData {
  fromAddress: string
  toAddress: string
  moveDate: string
  moveSize: string
  name: string
  email: string
  phone: string
  notes?: string
}

export interface UpdateOfferStatusData {
  status: OfferStatus
  rejectionReason?: string
}

export interface OffersFilter {
  status?: OfferStatus
  startDate?: string
  endDate?: string
  companyId?: string
}

export const useOfferStore = defineStore('offer', () => {
  // State
  const offers: Ref<Offer[]> = ref([])
  const currentOffer: Ref<Offer | null> = ref(null)
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const totalCount: Ref<number> = ref(0)

  // Getters
  const pendingOffers: ComputedRef<Offer[]> = computed(() =>
      offers.value.filter(o => o.status === 'pending')
  )

  const acceptedOffers: ComputedRef<Offer[]> = computed(() =>
      offers.value.filter(o => o.status === 'accepted')
  )

  const rejectedOffers: ComputedRef<Offer[]> = computed(() =>
      offers.value.filter(o => o.status === 'rejected')
  )

  const expiredOffers: ComputedRef<Offer[]> = computed(() =>
      offers.value.filter(o => o.status === 'expired')
  )

  const getOfferById = (id: string): Offer | undefined => {
    return offers.value.find(o => o.id === id)
  }

  // Actions
  // Für öffentliche Angebote (PublicOfferForm.vue)
  const createOffer = async (offerData: CreatePublicOfferData): Promise<Offer> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<Offer>('/offers', offerData)
      const newOffer = response.data

      // Add to offers list
      offers.value.unshift(newOffer)
      totalCount.value++

      return newOffer
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create offer.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const fetchCompanyOffers = async (filters?: OffersFilter): Promise<Offer[]> => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()

      if (filters?.status) params.append('status', filters.status)
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)

      const response = await api.get<Offer[]>(`/offers/company?${params.toString()}`)
      offers.value = response.data

      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch company offers.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const fetchAllOffers = async (filters?: OffersFilter): Promise<Offer[]> => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams()

      if (filters?.status) params.append('status', filters.status)
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.companyId) params.append('companyId', filters.companyId)

      const response = await api.get<Offer[]>(`/offers?${params.toString()}`)
      offers.value = response.data

      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch all offers.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const fetchOfferById = async (id: string): Promise<Offer> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<Offer>(`/offers/${id}`)
      currentOffer.value = response.data

      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch offer.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const updateOffer = async (id: string, updates: Partial<CreateOfferData>): Promise<Offer> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.patch<Offer>(`/offers/${id}`, updates)
      const updatedOffer = response.data

      // Update in offers list
      const index = offers.value.findIndex(o => o.id === id)
      if (index !== -1) {
        offers.value[index] = updatedOffer
      }

      // Update current offer if it's the same
      if (currentOffer.value?.id === id) {
        currentOffer.value = updatedOffer
      }

      return updatedOffer
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update offer.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const updateOfferStatus = async (id: string, data: UpdateOfferStatusData): Promise<Offer> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.patch<Offer>(`/offers/${id}/status`, data)
      const updatedOffer = response.data

      // Update in offers list
      const index = offers.value.findIndex(o => o.id === id)
      if (index !== -1) {
        offers.value[index] = updatedOffer
      }

      // Update current offer if it's the same
      if (currentOffer.value?.id === id) {
        currentOffer.value = updatedOffer
      }

      return updatedOffer
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update offer status.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const deleteOffer = async (id: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/offers/${id}`)

      // Remove from offers list
      offers.value = offers.value.filter(o => o.id !== id)
      totalCount.value = Math.max(0, totalCount.value - 1)

      // Clear current offer if it's the same
      if (currentOffer.value?.id === id) {
        currentOffer.value = null
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete offer.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const acceptOffer = async (id: string): Promise<Offer> => {
    return updateOfferStatus(id, { status: 'accepted' })
  }

  const rejectOffer = async (id: string, reason?: string): Promise<Offer> => {
    return updateOfferStatus(id, { status: 'rejected', rejectionReason: reason })
  }

  const clearError = (): void => {
    error.value = null
  }

  const clearCurrentOffer = (): void => {
    currentOffer.value = null
  }

  const resetStore = (): void => {
    offers.value = []
    currentOffer.value = null
    loading.value = false
    error.value = null
    totalCount.value = 0
  }

  return {
    // State
    offers,
    currentOffer,
    loading,
    error,
    totalCount,
    // Getters
    pendingOffers,
    acceptedOffers,
    rejectedOffers,
    expiredOffers,
    getOfferById,
    // Actions
    createOffer,
    fetchCompanyOffers,
    fetchAllOffers,
    fetchOfferById,
    updateOffer,
    updateOfferStatus,
    deleteOffer,
    acceptOffer,
    rejectOffer,
    clearError,
    clearCurrentOffer,
    resetStore,
  }
})

export default useOfferStore