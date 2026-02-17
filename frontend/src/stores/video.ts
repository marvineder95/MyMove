import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { VideoResponse, AnalysisJobResponse } from '@/types'
import { videoApi, aiApi } from '@/api'

export const useVideoStore = defineStore('video', () => {
  // State
  const currentVideo = ref<VideoResponse | null>(null)
  const analysisJob = ref<AnalysisJobResponse | null>(null)
  const uploadProgress = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function uploadVideo(file: File) {
    loading.value = true
    error.value = null
    uploadProgress.value = 0

    try {
      const response = await videoApi.upload(file)
      currentVideo.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to upload video'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function startAnalysis(videoId: string, offerId?: string) {
    loading.value = true
    error.value = null

    try {
      const response = await aiApi.startAnalysis(videoId, offerId)
      analysisJob.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to start analysis'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function checkAnalysisStatus(jobId: string) {
    try {
      const response = await aiApi.checkStatus(jobId)
      analysisJob.value = response
      return response
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Failed to check analysis status'
      throw err
    }
  }

  async function pollAnalysisStatus(jobId: string, onComplete?: () => void) {
    const poll = async () => {
      try {
        const job = await checkAnalysisStatus(jobId)
        
        if (job.status === 'SUCCEEDED') {
          onComplete?.()
          return
        }
        
        if (job.status === 'FAILED') {
          error.value = job.errorMessage || 'Analysis failed'
          return
        }
        
        // Continue polling
        setTimeout(() => poll(), 2000)
      } catch {
        // Stop polling on error
      }
    }
    
    poll()
  }

  function clearVideo() {
    currentVideo.value = null
    analysisJob.value = null
    uploadProgress.value = 0
    error.value = null
  }

  return {
    currentVideo,
    analysisJob,
    uploadProgress,
    loading,
    error,
    uploadVideo,
    startAnalysis,
    checkAnalysisStatus,
    pollAnalysisStatus,
    clearVideo
  }
})
