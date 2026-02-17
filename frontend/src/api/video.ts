import { apiClient } from './client'
import type { VideoResponse } from '@/types'

export const videoApi = {
  /**
   * Upload a video file
   */
  upload(file: File): Promise<VideoResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.postMultipart('/videos/upload', formData)
  }
}
