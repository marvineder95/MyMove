import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { 
  PriceEstimateResponse, 
  FinalOfferResponse, 
  FinalOfferRequest 
} from '@/types'
import { pricingApi } from '@/api'

export const usePricingStore = defineStore('pricing', () => {
  // State
  const currentEstimate = ref<PriceEstimateResponse | null>(null)
  const estimates = ref<PriceEstimateResponse[]>([])
  const finalOffers = ref<FinalOfferResponse[]>([])
  const currentFinalOffer = ref<FinalOfferResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function calculateEstimate(companyId: string, offerId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await pricingApi.calculateEstimate(companyId, offerId)
      currentEstimate.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to calculate estimate'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEstimatesByOffer(offerId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await pricingApi.getEstimatesByOffer(offerId)
      estimates.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to fetch estimates'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchEstimateByCompanyAndOffer(companyId: string, offerId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await pricingApi.getEstimateByCompanyAndOffer(companyId, offerId)
      currentEstimate.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to fetch estimate'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Company Final Offer actions
  async function createDraftOffer(offerId: string, companyId: string, request: FinalOfferRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await pricingApi.createDraftOffer(offerId, companyId, request)
      currentFinalOffer.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to create draft offer'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateDraftOffer(finalOfferId: string, companyId: string, request: FinalOfferRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await pricingApi.updateDraftOffer(finalOfferId, companyId, request)
      currentFinalOffer.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to update draft offer'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function submitOffer(finalOfferId: string, companyId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await pricingApi.submitOffer(finalOfferId, companyId)
      currentFinalOffer.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to submit offer'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMyOffers(companyId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await pricingApi.getMyOffers(companyId)
      finalOffers.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to fetch my offers'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearEstimate() {
    currentEstimate.value = null
  }

  function clearFinalOffer() {
    currentFinalOffer.value = null
  }

  return {
    currentEstimate,
    estimates,
    finalOffers,
    currentFinalOffer,
    loading,
    error,
    calculateEstimate,
    fetchEstimatesByOffer,
    fetchEstimateByCompanyAndOffer,
    createDraftOffer,
    updateDraftOffer,
    submitOffer,
    fetchMyOffers,
    clearEstimate,
    clearFinalOffer
  }
})
