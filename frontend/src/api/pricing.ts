import { apiClient } from './client'
import type { PriceEstimateResponse, FinalOfferResponse, FinalOfferRequest } from '@/types'

export const pricingApi = {
  /**
   * Calculate price estimate for company and offer
   */
  calculateEstimate(companyId: string, offerId: string): Promise<PriceEstimateResponse> {
    return apiClient.post(`/v1/pricing/calculate?companyId=${companyId}&offerId=${offerId}`)
  },

  /**
   * Get estimate by ID
   */
  getEstimate(estimateId: string): Promise<PriceEstimateResponse> {
    return apiClient.get(`/v1/pricing/estimates/${estimateId}`)
  },

  /**
   * Get estimates by offer ID
   */
  getEstimatesByOffer(offerId: string): Promise<PriceEstimateResponse[]> {
    return apiClient.get(`/v1/pricing/estimates/by-offer/${offerId}`)
  },

  /**
   * Get estimate by company and offer
   */
  getEstimateByCompanyAndOffer(companyId: string, offerId: string): Promise<PriceEstimateResponse> {
    return apiClient.get(`/v1/pricing/estimates/by-company-and-offer?companyId=${companyId}&offerId=${offerId}`)
  },

  // ========== Company Final Offer Endpoints ==========

  /**
   * Create draft final offer for an offer
   */
  createDraftOffer(offerId: string, companyId: string, request: FinalOfferRequest): Promise<FinalOfferResponse> {
    return apiClient.post(`/v1/company/dashboard/offers/${offerId}/final-offer?companyId=${companyId}`, request)
  },

  /**
   * Update draft final offer
   */
  updateDraftOffer(finalOfferId: string, companyId: string, request: FinalOfferRequest): Promise<FinalOfferResponse> {
    return apiClient.put(`/v1/company/dashboard/final-offers/${finalOfferId}?companyId=${companyId}`, request)
  },

  /**
   * Submit final offer to customer
   */
  submitOffer(finalOfferId: string, companyId: string): Promise<FinalOfferResponse> {
    return apiClient.post(`/v1/company/dashboard/final-offers/${finalOfferId}/submit?companyId=${companyId}`)
  },

  /**
   * Get company's final offers
   */
  getMyOffers(companyId: string): Promise<FinalOfferResponse[]> {
    return apiClient.get(`/v1/company/dashboard/my-offers?companyId=${companyId}`)
  }
}
