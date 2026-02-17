import { apiClient } from './client'
import type { AnalysisJobResponse } from '@/types'

export const aiApi = {
  /**
   * Start AI analysis for a video
   */
  startAnalysis(videoId: string, offerId?: string): Promise<AnalysisJobResponse> {
    const params = offerId ? `?offerId=${offerId}` : ''
    return apiClient.post(`/v1/ai/analyze/${videoId}${params}`)
  },

  /**
   * Get analysis job by ID
   */
  getJob(jobId: string): Promise<AnalysisJobResponse> {
    return apiClient.get(`/v1/ai/jobs/${jobId}`)
  },

  /**
   * Check and update job status
   */
  checkStatus(jobId: string): Promise<AnalysisJobResponse> {
    return apiClient.post(`/v1/ai/jobs/${jobId}/check-status`)
  },

  /**
   * Get jobs by video ID
   */
  getJobsByVideo(videoId: string): Promise<AnalysisJobResponse[]> {
    return apiClient.get(`/v1/ai/jobs/by-video/${videoId}`)
  },

  /**
   * Get job by offer ID
   */
  getJobByOffer(offerId: string): Promise<AnalysisJobResponse> {
    return apiClient.get(`/v1/ai/jobs/by-offer/${offerId}`)
  }
}
