import { apiClient } from './client'
import type { CompanyOfferResponse, CompanyAdminResponse, CompanyStatsResponse, RejectCompanyRequest } from '@/types'

export const companyApi = {
  /**
   * Get available offers for logged-in company
   */
  getAvailableOffers(): Promise<CompanyOfferResponse[]> {
    return apiClient.get('/v1/company/dashboard/offers')
  },

  /**
   * Get offer details for company
   */
  getOfferDetails(offerId: string): Promise<CompanyOfferResponse> {
    return apiClient.get(`/v1/company/dashboard/offers/${offerId}`)
  },

  /**
   * Get inventory for an offer (company view)
   */
  getOfferInventory(offerId: string): Promise<unknown> {
    return apiClient.get(`/v1/company/dashboard/offers/${offerId}/inventory`)
  },

  // ========== Admin Endpoints ==========

  /**
   * Get company statistics (admin only)
   */
  getCompanyStats(): Promise<CompanyStatsResponse> {
    return apiClient.get('/v1/admin/companies/stats')
  },

  /**
   * List companies by status (admin only)
   */
  listCompanies(status: string = 'PENDING'): Promise<CompanyAdminResponse[]> {
    return apiClient.get(`/v1/admin/companies?status=${status}`)
  },

  /**
   * Approve a company (admin only)
   */
  approveCompany(companyId: string): Promise<CompanyAdminResponse> {
    return apiClient.post(`/v1/admin/companies/${companyId}/approve`)
  },

  /**
   * Reject a company (admin only)
   */
  rejectCompany(companyId: string, request: RejectCompanyRequest): Promise<CompanyAdminResponse> {
    return apiClient.post(`/v1/admin/companies/${companyId}/reject`, request)
  }
}
