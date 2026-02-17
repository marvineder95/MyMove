import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  CompanyOfferResponse, 
  FinalOfferResponse, 
  FinalOfferRequest,
  InventoryResponse,
  PriceEstimateResponse,
  CompanyStatus
} from '@/types'
import { companyApi, pricingApi, inventoryApi } from '@/api'
import { FinalOfferStatus } from '@/types'

export const useCompanyStore = defineStore('company', () => {
  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Company profile/status
  const companyStatus = ref<CompanyStatus>('PENDING' as CompanyStatus)
  const rejectionReason = ref<string | null>(null)
  
  // Dashboard data
  const availableOffers = ref<CompanyOfferResponse[]>([])
  const selectedOffer = ref<CompanyOfferResponse | null>(null)
  const selectedOfferInventory = ref<InventoryResponse | null>(null)
  
  // Final offers
  const myFinalOffers = ref<FinalOfferResponse[]>([])
  const currentFinalOffer = ref<FinalOfferResponse | null>(null)

  // Getters
  const isApproved = computed(() => companyStatus.value === 'APPROVED' as CompanyStatus)
  const isPending = computed(() => companyStatus.value === 'PENDING' as CompanyStatus)
  const isRejected = computed(() => companyStatus.value === 'REJECTED' as CompanyStatus)
  
  const hasEstimates = computed(() => 
    availableOffers.value.some(o => o.priceEstimate !== null)
  )
  
  const canSubmitFinalOffer = computed(() => 
    selectedOffer.value?.canSubmitFinalOffer === true
  )

  // Actions
  
  // Load available offers for company
  async function loadAvailableOffers(): Promise<CompanyOfferResponse[]> {
    loading.value = true
    error.value = null
    
    try {
      const response = await companyApi.getAvailableOffers()
      availableOffers.value = response
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load offers'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get offer details
  async function loadOfferDetails(offerId: string): Promise<CompanyOfferResponse> {
    loading.value = true
    error.value = null
    
    try {
      const response = await companyApi.getOfferDetails(offerId)
      selectedOffer.value = response
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load offer details'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get offer inventory
  async function loadOfferInventory(offerId: string): Promise<InventoryResponse> {
    loading.value = true
    error.value = null
    
    try {
      const response = await inventoryApi.getByOfferId(offerId)
      selectedOfferInventory.value = response
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load inventory'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Calculate estimate
  async function calculateEstimate(companyId: string, offerId: string): Promise<PriceEstimateResponse> {
    loading.value = true
    error.value = null
    
    try {
      const response = await pricingApi.calculateEstimate(companyId, offerId)
      // Refresh the offer details to show the new estimate
      await loadOfferDetails(offerId)
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to calculate estimate'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create draft final offer
  async function createDraftOffer(
    offerId: string, 
    companyId: string, 
    request: FinalOfferRequest
  ): Promise<FinalOfferResponse> {
    loading.value = true
    error.value = null
    
    try {
      const response = await pricingApi.createDraftOffer(offerId, companyId, request)
      currentFinalOffer.value = response
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create offer'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update draft final offer
  async function updateDraftOffer(
    finalOfferId: string,
    companyId: string,
    request: FinalOfferRequest
  ): Promise<FinalOfferResponse> {
    loading.value = true
    error.value = null
    
    try {
      const response = await pricingApi.updateDraftOffer(finalOfferId, companyId, request)
      currentFinalOffer.value = response
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update offer'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Submit final offer to customer
  async function submitFinalOffer(finalOfferId: string, companyId: string): Promise<FinalOfferResponse> {
    loading.value = true
    error.value = null
    
    try {
      const response = await pricingApi.submitOffer(finalOfferId, companyId)
      currentFinalOffer.value = response
      // Refresh the lists
      await loadMyOffers(companyId)
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to submit offer'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get my final offers
  async function loadMyOffers(companyId: string): Promise<FinalOfferResponse[]> {
    loading.value = true
    error.value = null
    
    try {
      const response = await pricingApi.getMyOffers(companyId)
      myFinalOffers.value = response
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load my offers'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Accept the calculated estimate price
  async function acceptEstimatePrice(
    offerId: string,
    companyId: string,
    validityDays: number = 7,
    notes?: string
  ): Promise<FinalOfferResponse> {
    const request: FinalOfferRequest = {
      acceptEstimatePrice: true,
      validityDays,
      notes
    }
    return createDraftOffer(offerId, companyId, request)
  }

  // Set company status (for demo/testing)
  function setCompanyStatus(status: CompanyStatus, reason?: string) {
    companyStatus.value = status
    rejectionReason.value = reason || null
  }

  // Select an offer
  function selectOffer(offer: CompanyOfferResponse | null) {
    selectedOffer.value = offer
    selectedOfferInventory.value = null
  }

  // Clear error
  function clearError() {
    error.value = null
  }

  return {
    // State
    loading,
    error,
    companyStatus,
    rejectionReason,
    availableOffers,
    selectedOffer,
    selectedOfferInventory,
    myFinalOffers,
    currentFinalOffer,
    
    // Getters
    isApproved,
    isPending,
    isRejected,
    hasEstimates,
    canSubmitFinalOffer,
    
    // Actions
    loadAvailableOffers,
    loadOfferDetails,
    loadOfferInventory,
    calculateEstimate,
    createDraftOffer,
    updateDraftOffer,
    submitFinalOffer,
    loadMyOffers,
    acceptEstimatePrice,
    setCompanyStatus,
    selectOffer,
    clearError
  }
})
