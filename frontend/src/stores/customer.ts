import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  CreateOfferRequest, 
  OfferResponse, 
  VideoResponse, 
  AnalysisJobResponse,
  InventoryResponse,
  InventoryItemRequest,
  FinalOfferResponse,
  Address,
  FloorDetails
} from '@/types'
import { offersApi, videoApi, aiApi, inventoryApi } from '@/api'
import { AnalysisJobStatus, OfferStatus } from '@/types'

// Wizard step definitions
export enum WizardStep {
  MOVE_DETAILS = 1,
  VIDEO_UPLOAD = 2,
  ANALYSIS_STATUS = 3,
  INVENTORY_EDIT = 4,
  CONFIRM_SUBMIT = 5,
  VIEW_OFFERS = 6
}

export const useCustomerStore = defineStore('customer', () => {
  // Wizard state
  const currentStep = ref<WizardStep>(WizardStep.MOVE_DETAILS)
  const wizardLoading = ref(false)
  const wizardError = ref<string | null>(null)

  // Move request data (Step 1)
  const moveDetails = ref<Partial<CreateOfferRequest>>({
    fromAddress: {
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      country: 'Österreich'
    } as Address,
    toAddress: {
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      country: 'Österreich'
    } as Address,
    fromFloor: {
      floor: 0,
      hasElevator: false,
      needsNoParkingZone: false
    } as FloorDetails,
    toFloor: {
      floor: 0,
      hasElevator: false,
      needsNoParkingZone: false
    } as FloorDetails,
    needsBoxes: false,
    moveDate: new Date().toISOString().split('T')[0]
  })

  // Video and analysis state (Steps 2-3)
  const uploadedVideo = ref<VideoResponse | null>(null)
  const analysisJob = ref<AnalysisJobResponse | null>(null)
  const analysisPollingInterval = ref<number | null>(null)

  // Offer and inventory state (Steps 4-5)
  const currentOffer = ref<OfferResponse | null>(null)
  const inventory = ref<InventoryResponse | null>(null)

  // Offers list (Step 6)
  const finalOffers = ref<FinalOfferResponse[]>([])
  const selectedOffer = ref<FinalOfferResponse | null>(null)

  // Getters
  const isMoveDetailsValid = computed(() => {
    const from = moveDetails.value.fromAddress
    const to = moveDetails.value.toAddress
    return from?.street && from?.houseNumber && from?.postalCode && from?.city &&
           to?.street && to?.houseNumber && to?.postalCode && to?.city &&
           moveDetails.value.moveDate
  })

  const canProceedToUpload = computed(() => isMoveDetailsValid.value)
  const canProceedToAnalysis = computed(() => uploadedVideo.value !== null)
  const isAnalysisComplete = computed(() => 
    analysisJob.value?.status === AnalysisJobStatus.SUCCEEDED
  )
  const isAnalysisFailed = computed(() => 
    analysisJob.value?.status === AnalysisJobStatus.FAILED
  )

  const inventoryItems = computed(() => inventory.value?.items || [])
  const totalVolume = computed(() => inventory.value?.totalVolume || 0)

  // Actions

  // Step 1: Save move details
  function setMoveDetails(details: Partial<CreateOfferRequest>) {
    moveDetails.value = { ...moveDetails.value, ...details }
  }

  // Step 2: Upload video
  async function uploadVideo(file: File): Promise<VideoResponse> {
    wizardLoading.value = true
    wizardError.value = null
    
    try {
      const response = await videoApi.upload(file)
      uploadedVideo.value = response
      return response
    } catch (err: any) {
      wizardError.value = err.response?.data?.message || 'Video upload failed'
      throw err
    } finally {
      wizardLoading.value = false
    }
  }

  // Step 3: Start and poll analysis
  async function startAnalysis(): Promise<AnalysisJobResponse> {
    if (!uploadedVideo.value) throw new Error('No video uploaded')
    
    wizardLoading.value = true
    wizardError.value = null
    
    try {
      const response = await aiApi.startAnalysis(
        uploadedVideo.value.id, 
        currentOffer.value?.id
      )
      analysisJob.value = response
      return response
    } catch (err: any) {
      wizardError.value = err.response?.data?.message || 'Failed to start analysis'
      throw err
    } finally {
      wizardLoading.value = false
    }
  }

  function startPollingAnalysis(jobId: string) {
    stopPollingAnalysis()
    
    analysisPollingInterval.value = window.setInterval(async () => {
      try {
        const job = await aiApi.checkStatus(jobId)
        analysisJob.value = job
        
        if (job.status === AnalysisJobStatus.SUCCEEDED || 
            job.status === AnalysisJobStatus.FAILED) {
          stopPollingAnalysis()
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 2000) // Poll every 2 seconds
  }

  function stopPollingAnalysis() {
    if (analysisPollingInterval.value) {
      clearInterval(analysisPollingInterval.value)
      analysisPollingInterval.value = null
    }
  }

  // Create the offer (after move details + video)
  async function createOffer(): Promise<OfferResponse> {
    wizardLoading.value = true
    wizardError.value = null
    
    try {
      const request: CreateOfferRequest = {
        videoId: uploadedVideo.value?.id,
        fromAddress: moveDetails.value.fromAddress!,
        toAddress: moveDetails.value.toAddress!,
        fromFloor: moveDetails.value.fromFloor!,
        toFloor: moveDetails.value.toFloor!,
        needsBoxes: moveDetails.value.needsBoxes || false,
        boxesCount: moveDetails.value.boxesCount,
        moveDate: moveDetails.value.moveDate!,
        specialRequirements: moveDetails.value.needsBoxes ? {
          needsBoxes: true,
          boxesCount: moveDetails.value.boxesCount
        } : undefined
      }
      
      const response = await offersApi.create(request)
      currentOffer.value = response
      return response
    } catch (err: any) {
      wizardError.value = err.response?.data?.message || 'Failed to create offer'
      throw err
    } finally {
      wizardLoading.value = false
    }
  }

  // Step 4: Load inventory
  async function loadInventory(inventoryId: string): Promise<InventoryResponse> {
    wizardLoading.value = true
    wizardError.value = null
    
    try {
      const response = await inventoryApi.getById(inventoryId)
      inventory.value = response
      return response
    } catch (err: any) {
      wizardError.value = err.response?.data?.message || 'Failed to load inventory'
      throw err
    } finally {
      wizardLoading.value = false
    }
  }

  async function loadInventoryByOffer(offerId: string): Promise<InventoryResponse> {
    wizardLoading.value = true
    wizardError.value = null
    
    try {
      const response = await inventoryApi.getByOfferId(offerId)
      inventory.value = response
      return response
    } catch (err: any) {
      wizardError.value = err.response?.data?.message || 'Failed to load inventory'
      throw err
    } finally {
      wizardLoading.value = false
    }
  }

  // Inventory editing
  async function addInventoryItem(request: InventoryItemRequest): Promise<void> {
    if (!inventory.value) return
    
    try {
      const response = await inventoryApi.addItem(inventory.value.id, request)
      inventory.value = response
    } catch (err: any) {
      wizardError.value = err.response?.data?.message || 'Failed to add item'
      throw err
    }
  }

  async function updateInventoryItem(index: number, name: string, quantity: number): Promise<void> {
    if (!inventory.value) return
    
    try {
      const response = await inventoryApi.updateItem(inventory.value.id, index, { name, quantity })
      inventory.value = response
    } catch (err: any) {
      wizardError.value = err.response?.data?.message || 'Failed to update item'
      throw err
    }
  }

  async function removeInventoryItem(index: number): Promise<void> {
    if (!inventory.value) return
    
    try {
      const response = await inventoryApi.removeItem(inventory.value.id, index)
      inventory.value = response
    } catch (err: any) {
      wizardError.value = err.response?.data?.message || 'Failed to remove item'
      throw err
    }
  }

  // Step 5: Confirm inventory
  async function confirmInventory(): Promise<InventoryResponse> {
    if (!inventory.value) throw new Error('No inventory loaded')
    
    wizardLoading.value = true
    wizardError.value = null
    
    try {
      const response = await inventoryApi.confirm(inventory.value.id)
      inventory.value = response
      return response
    } catch (err: any) {
      wizardError.value = err.response?.data?.message || 'Failed to confirm inventory'
      throw err
    } finally {
      wizardLoading.value = false
    }
  }

  // Step 6: Load final offers
  async function loadFinalOffers(offerId: string): Promise<FinalOfferResponse[]> {
    wizardLoading.value = true
    wizardError.value = null
    
    try {
      const response = await offersApi.getFinalOffers(offerId)
      finalOffers.value = response
      return response
    } catch (err: any) {
      wizardError.value = err.response?.data?.message || 'Failed to load offers'
      throw err
    } finally {
      wizardLoading.value = false
    }
  }

  async function acceptFinalOffer(finalOfferId: string): Promise<FinalOfferResponse> {
    try {
      const response = await offersApi.acceptFinalOffer(finalOfferId)
      // Refresh the list
      if (currentOffer.value) {
        await loadFinalOffers(currentOffer.value.id)
      }
      return response
    } catch (err: any) {
      wizardError.value = err.response?.data?.message || 'Failed to accept offer'
      throw err
    }
  }

  async function rejectFinalOffer(finalOfferId: string, reason?: string): Promise<FinalOfferResponse> {
    try {
      const response = await offersApi.rejectFinalOffer(finalOfferId, reason ? { reason } : undefined)
      // Refresh the list
      if (currentOffer.value) {
        await loadFinalOffers(currentOffer.value.id)
      }
      return response
    } catch (err: any) {
      wizardError.value = err.response?.data?.message || 'Failed to reject offer'
      throw err
    }
  }

  // Wizard navigation
  function goToStep(step: WizardStep) {
    currentStep.value = step
  }

  function nextStep() {
    if (currentStep.value < WizardStep.VIEW_OFFERS) {
      currentStep.value++
    }
  }

  function previousStep() {
    if (currentStep.value > WizardStep.MOVE_DETAILS) {
      currentStep.value--
    }
  }

  // Reset wizard
  function resetWizard() {
    currentStep.value = WizardStep.MOVE_DETAILS
    moveDetails.value = {
      fromAddress: { street: '', houseNumber: '', postalCode: '', city: '', country: 'Österreich' } as Address,
      toAddress: { street: '', houseNumber: '', postalCode: '', city: '', country: 'Österreich' } as Address,
      fromFloor: { floor: 0, hasElevator: false, needsNoParkingZone: false } as FloorDetails,
      toFloor: { floor: 0, hasElevator: false, needsNoParkingZone: false } as FloorDetails,
      needsBoxes: false,
      moveDate: new Date().toISOString().split('T')[0]
    }
    uploadedVideo.value = null
    analysisJob.value = null
    currentOffer.value = null
    inventory.value = null
    finalOffers.value = []
    selectedOffer.value = null
    stopPollingAnalysis()
    wizardError.value = null
  }

  return {
    // State
    currentStep,
    wizardLoading,
    wizardError,
    moveDetails,
    uploadedVideo,
    analysisJob,
    currentOffer,
    inventory,
    finalOffers,
    selectedOffer,
    
    // Getters
    isMoveDetailsValid,
    canProceedToUpload,
    canProceedToAnalysis,
    isAnalysisComplete,
    isAnalysisFailed,
    inventoryItems,
    totalVolume,
    
    // Actions
    setMoveDetails,
    uploadVideo,
    startAnalysis,
    startPollingAnalysis,
    stopPollingAnalysis,
    createOffer,
    loadInventory,
    loadInventoryByOffer,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
    confirmInventory,
    loadFinalOffers,
    acceptFinalOffer,
    rejectFinalOffer,
    goToStep,
    nextStep,
    previousStep,
    resetWizard
  }
})
