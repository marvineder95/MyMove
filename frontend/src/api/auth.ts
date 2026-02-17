import { apiClient } from './client'
import type { RegisterCompanyRequest, RegisterCompanyResponse } from '@/types'

export const authApi = {
  /**
   * Register a new company (multipart/form-data for file upload)
   */
  registerCompany(request: RegisterCompanyRequest): Promise<RegisterCompanyResponse> {
    const formData = new FormData()
    
    formData.append('companyName', request.companyName)
    formData.append('email', request.email)
    formData.append('password', request.password)
    formData.append('addressLine', request.addressLine)
    formData.append('city', request.city)
    formData.append('postalCode', request.postalCode)
    formData.append('country', request.country)
    formData.append('phone', request.phone)
    formData.append('atuNumber', request.atuNumber)
    formData.append('hourlyRate', (request.hourlyRate ?? 0).toString())
    formData.append('travelFee', (request.travelFee ?? 0).toString())
    
    if (request.website) formData.append('website', request.website)
    if (request.baseFee !== undefined && request.baseFee !== null) formData.append('baseFee', request.baseFee.toString())
    if (request.extraChargePercent !== undefined && request.extraChargePercent !== null) formData.append('extraChargePercent', request.extraChargePercent.toString())
    if (request.minimumPrice !== undefined && request.minimumPrice !== null) formData.append('minimumPrice', request.minimumPrice.toString())
    
    request.services.forEach(service => {
      formData.append('services', service)
    })
    
    formData.append('tradeLicenseFile', request.tradeLicenseFile)

    return apiClient.postMultipart('/auth/register', formData)
  },

  /**
   * Check if server is alive
   */
  ping(): Promise<string> {
    return apiClient.get('/v1/ping')
  }
}
