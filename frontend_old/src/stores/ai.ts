import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from './api'

export type AnalysisJobStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'

export interface DetectedItem {
  label: string
  description: string | null
  confidence: number
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  } | null
  estimatedVolumeM3: number | null
  quantity: number
}

export interface AnalysisJob {
  id: string
  videoId: string
  offerId: string | null
  status: AnalysisJobStatus
  detectedItems: DetectedItem[] | null
  errorMessage: string | null
  totalVolumeM3: number | null
  roomType: string | null
  processingTimeSeconds: number | null
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  retryCount: number
  isCompleted: boolean
}

export const useAiStore = defineStore('ai', () => {
  // State
  const currentJob: Ref<AnalysisJob | null> = ref(null)
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const pollInterval: Ref<number | null> = ref(null)

  // Actions
  const startAnalysis = async (videoId: string, offerId?: string): Promise<AnalysisJob> => {
    loading.value = true
    error.value = null

    try {
      const params = offerId ? `?offerId=${offerId}` : ''
      const response = await api.post<AnalysisJob>(`/ai/analyze/${videoId}${params}`)
      currentJob.value = response.data
      
      // Auto-start polling if job is pending or running
      if (response.data.status === 'PENDING' || response.data.status === 'RUNNING') {
        startPolling(response.data.id)
      }
      
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to start analysis.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const fetchJob = async (jobId: string): Promise<AnalysisJob> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<AnalysisJob>(`/ai/jobs/${jobId}`)
      currentJob.value = response.data
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch job.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const checkStatus = async (jobId: string): Promise<AnalysisJob> => {
    try {
      const response = await api.post<AnalysisJob>(`/ai/jobs/${jobId}/check-status`)
      currentJob.value = response.data
      
      // Stop polling if completed
      if (response.data.isCompleted && pollInterval.value) {
        stopPolling()
      }
      
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to check status.'
      error.value = errorMessage
      throw new Error(errorMessage)
    }
  }

  const startPolling = (jobId: string, intervalMs: number = 3000): void => {
    // Clear existing interval
    stopPolling()
    
    pollInterval.value = window.setInterval(async () => {
      try {
        const job = await checkStatus(jobId)
        if (job.isCompleted) {
          stopPolling()
        }
      } catch (err) {
        // Stop polling on error
        stopPolling()
      }
    }, intervalMs)
  }

  const stopPolling = (): void => {
    if (pollInterval.value) {
      clearInterval(pollInterval.value)
      pollInterval.value = null
    }
  }

  const fetchJobsByVideo = async (videoId: string): Promise<AnalysisJob[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<AnalysisJob[]>(`/ai/jobs/by-video/${videoId}`)
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch jobs.'
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
    stopPolling()
    currentJob.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    currentJob,
    loading,
    error,
    pollInterval,
    // Actions
    startAnalysis,
    fetchJob,
    checkStatus,
    startPolling,
    stopPolling,
    fetchJobsByVideo,
    clearError,
    resetStore,
  }
})

export default useAiStore
