import api from './index'
import type {
  Company,
  CompanyDashboardData,
  AvailableRequest,
  CompanyRatingSummary,
  Review,
  Offer,
  CompanyPricing,
  CompanyProfileData,
} from '@/types'

export const companyApi = {
  getMe: () => api.get<Company>('/companies/me'),

  updateMe: (payload: Partial<Company>) =>
    api.patch<Company>('/companies/me', payload),

  getProfile: () => api.get<CompanyProfileData>('/companies/me/profile'),

  getDashboard: () => api.get<CompanyDashboardData>('/companies/me/dashboard'),

  getAvailableRequests: () =>
    api.get<AvailableRequest[]>('/companies/me/available-requests'),

  getMyOffers: () => api.get<Offer[]>('/offers/my'),

  getMyOffersByStatus: (status: string) =>
    api.get<Offer[]>(`/offers/my/status/${status}`),

  getMyReviews: (companyId: number) =>
    api.get<{ data: Review[]; meta: unknown }>(`/companies/${companyId}/reviews`),

  getMyRating: (companyId: number) =>
    api.get<CompanyRatingSummary>(`/companies/${companyId}/rating`),

  getPricing: () => api.get<CompanyPricing>('/companies/me/pricing'),

  createPricing: (payload: Partial<CompanyPricing>) =>
    api.post<CompanyPricing>('/companies/me/pricing', payload),

  updatePricing: (payload: Partial<CompanyPricing>) =>
    api.patch<CompanyPricing>('/companies/me/pricing', payload),

  requestLogoUpload: (payload: { fileType: string; fileName: string }) =>
    api.post<{ uploadUrl: string; s3Key: string; logoUrl: string; expiresAt: string }>('/companies/me/logo', payload),
}
