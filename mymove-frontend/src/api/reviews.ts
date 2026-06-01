import api from './index'
import type { Review, CompanyRatingSummary } from '@/types'

export const reviewsApi = {
  create: (payload: { moveRequestId: number; rating: number; reviewText?: string }) =>
    api.post<Review>('/reviews', payload),

  getByCompany: (companyId: number, page = 1, limit = 20) =>
    api.get<{ data: Review[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/companies/${companyId}/reviews?page=${page}&limit=${limit}`),

  getCompanyRating: (companyId: number) =>
    api.get<CompanyRatingSummary>(`/companies/${companyId}/rating`),
}
