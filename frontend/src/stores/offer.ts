import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { 
  CreateOfferRequest, 
  OfferResponse, 
  CompanyOfferResponse,
  FinalOfferResponse 
} from '@/types'
import { offersApi, companyApi } from '@/api'

export const useOfferStore = defineStore('offer', () => {
  // State
  const currentOffer = ref<OfferResponse | null>(null)
  const companyOffers = ref<CompanyOfferResponse[]>([])
  const finalOffers = ref<FinalOfferResponse[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function createOffer(request: CreateOfferRequest) {
    loading.value = true
    error.value = null

    try {
      const response = await offersApi.create(request)
      currentOffer.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to create offer'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCompanyOffers() {
    loading.value = true
    error.value = null

    try {
      const response = await offersApi.listForCompany()
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to fetch offers'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAvailableOffers() {
    loading.value = true
    error.value = null

    try {
      const response = await companyApi.getAvailableOffers()
      companyOffers.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to fetch available offers'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchOfferById(offerId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await offersApi.getById(offerId)
      currentOffer.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to fetch offer'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchFinalOffers(offerId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await offersApi.getFinalOffers(offerId)
      finalOffers.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to fetch final offers'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function acceptFinalOffer(finalOfferId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await offersApi.acceptFinalOffer(finalOfferId)
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to accept offer'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearCurrentOffer() {
    currentOffer.value = null
  }

  return {
    currentOffer,
    companyOffers,
    finalOffers,
    loading,
    error,
    createOffer,
    fetchCompanyOffers,
    fetchAvailableOffers,
    fetchOfferById,
    fetchFinalOffers,
    acceptFinalOffer,
    clearCurrentOffer
  }
})
