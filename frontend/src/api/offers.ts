import { apiClient } from './client'
import type { 
  CreateOfferRequest, 
  OfferResponse, 
  AssignCompanyRequest,
  FinalOfferResponse,
  RejectFinalOfferRequest
} from '@/types'

export const offersApi = {
  /**
   * Create a new offer (customer)
   */
  create(request: CreateOfferRequest): Promise<OfferResponse> {
    return apiClient.post('/v1/offers', request)
  },

  /**
   * List offers for logged-in company
   */
  listForCompany(): Promise<OfferResponse[]> {
    return apiClient.get('/v1/offers')
  },

  /**
   * Get offer by ID (company)
   */
  getById(id: string): Promise<OfferResponse> {
    return apiClient.get(`/v1/offers/${id}`)
  },

  /**
   * Send offer (company)
   */
  send(offerId: string): Promise<OfferResponse> {
    return apiClient.post(`/v1/offers/${offerId}/send`)
  },

  /**
   * Assign company to offer
   */
  assignCompany(offerId: string, request: AssignCompanyRequest): Promise<OfferResponse> {
    return apiClient.patch(`/v1/offers/${offerId}/assign-company`, request)
  },

  /**
   * Get final offers for an offer (customer comparison)
   */
  getFinalOffers(offerId: string): Promise<FinalOfferResponse[]> {
    return apiClient.get(`/v1/offers/${offerId}/final-offers`)
  },

  /**
   * Get best offer for an offer
   */
  getBestOffer(offerId: string): Promise<FinalOfferResponse> {
    return apiClient.get(`/v1/offers/${offerId}/best-offer`)
  },

  /**
   * Accept a final offer (customer)
   */
  acceptFinalOffer(finalOfferId: string): Promise<FinalOfferResponse> {
    return apiClient.post(`/v1/final-offers/${finalOfferId}/accept`)
  },

  /**
   * Reject a final offer (customer)
   */
  rejectFinalOffer(finalOfferId: string, request?: RejectFinalOfferRequest): Promise<FinalOfferResponse> {
    return apiClient.post(`/v1/final-offers/${finalOfferId}/reject`, request)
  }
}
