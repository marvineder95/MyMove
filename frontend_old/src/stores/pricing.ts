import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { defineStore } from 'pinia'
import { api } from './api'

export interface PriceBreakdown {
  baseFee: number
  travelFee: number
  laborCost: number
  volumeCost: number
  floorSurcharge: number
  distanceSurcharge: number
  otherSurcharges: number
  subtotal: number
  total: number
  details: Record<string, number>
}

export interface PriceEstimate {
  id: string
  offerId: string
  companyId: string
  totalPrice: number
  priceRangeLow: number
  priceRangeHigh: number
  breakdown: PriceBreakdown
  estimatedHours: number
  estimatedVolume: number
  currency: string
  calculatedAt: string
  validUntil: string
  isValid: boolean
}

export type FinalOfferStatus = 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'

export interface FinalOffer {
  id: string
  offerId: string
  companyId: string
  totalPrice: number
  breakdown: PriceBreakdown
  validityDays: number
  notes: string | null
  status: FinalOfferStatus
  createdAt: string
  submittedAt: string | null
  acceptedAt: string | null
  rejectedAt: string | null
  rejectionReason: string | null
  isExpired: boolean
}

export const usePricingStore = defineStore('pricing', () => {
  // State
  const currentEstimate: Ref<PriceEstimate | null> = ref(null)
  const estimates: Ref<PriceEstimate[]> = ref([])
  const finalOffers: Ref<FinalOffer[]> = ref([])
  const currentFinalOffer: Ref<FinalOffer | null> = ref(null)
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  // Getters
  const validEstimates: ComputedRef<PriceEstimate[]> = computed(() =>
    estimates.value.filter(e => e.isValid)
  )

  const submittedOffers: ComputedRef<FinalOffer[]> = computed(() =>
    finalOffers.value.filter(o => o.status === 'SUBMITTED' && !o.isExpired)
  )

  const bestOffer: ComputedRef<FinalOffer | null> = computed(() => {
    const valid = submittedOffers.value
    if (valid.length === 0) return null
    return valid.reduce((min, offer) => offer.totalPrice < min.totalPrice ? offer : min)
  })

  // Actions - Estimates
  const calculateEstimate = async (companyId: string, offerId: string): Promise<PriceEstimate> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<PriceEstimate>(`/pricing/calculate?companyId=${companyId}&offerId=${offerId}`)
      currentEstimate.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to calculate estimate.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const fetchEstimatesForOffer = async (offerId: string): Promise<PriceEstimate[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<PriceEstimate[]>(`/pricing/estimates/by-offer/${offerId}`)
      estimates.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch estimates.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  // Actions - Final Offers (Company)
  const submitFinalOffer = async (
    companyId: string, 
    offerId: string, 
    data: { acceptEstimatePrice: boolean; validityDays?: number; notes?: string }
  ): Promise<FinalOffer> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<FinalOffer>(
        `/company/dashboard/offers/${offerId}/final-offer?companyId=${companyId}`,
        data
      )
      currentFinalOffer.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to submit offer.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const fetchMyFinalOffers = async (companyId: string): Promise<FinalOffer[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<FinalOffer[]>(`/company/dashboard/my-offers?companyId=${companyId}`)
      finalOffers.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch my offers.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  // Actions - Final Offers (Customer)
  const fetchFinalOffersForOffer = async (offerId: string): Promise<FinalOffer[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<FinalOffer[]>(`/offers/${offerId}/final-offers`)
      finalOffers.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch offers.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const acceptFinalOffer = async (finalOfferId: string): Promise<FinalOffer> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<FinalOffer>(`/final-offers/${finalOfferId}/accept`)
      currentFinalOffer.value = response.data
      
      // Update in list
      const index = finalOffers.value.findIndex(o => o.id === finalOfferId)
      if (index !== -1) {
        finalOffers.value[index] = response.data
      }
      
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to accept offer.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const rejectFinalOffer = async (finalOfferId: string, reason?: string): Promise<FinalOffer> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<FinalOffer>(`/final-offers/${finalOfferId}/reject`, { reason })
      currentFinalOffer.value = response.data
      
      // Update in list
      const index = finalOffers.value.findIndex(o => o.id === finalOfferId)
      if (index !== -1) {
        finalOffers.value[index] = response.data
      }
      
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reject offer.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const clearError = (): void => {
    error.value = null
  }

  const resetStore = (): void => {
    currentEstimate.value = null
    estimates.value = []
    finalOffers.value = []
    currentFinalOffer.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    currentEstimate,
    estimates,
    finalOffers,
    currentFinalOffer,
    loading,
    error,
    // Getters
    validEstimates,
    submittedOffers,
    bestOffer,
    // Actions
    calculateEstimate,
    fetchEstimatesForOffer,
    submitFinalOffer,
    fetchMyFinalOffers,
    fetchFinalOffersForOffer,
    acceptFinalOffer,
    rejectFinalOffer,
    clearError,
    resetStore,
  }
})

export default usePricingStore
