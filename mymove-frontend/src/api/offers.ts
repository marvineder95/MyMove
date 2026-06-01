import api from './index'
import type { Offer } from '@/types'

export const offersApi = {
  getForRequest: (requestId: number) =>
    api.get<Offer[]>(`/offers/requests/${requestId}`),

  accept: (offerId: number) =>
    api.post<Offer>(`/offers/${offerId}/accept`),

  reject: (offerId: number) =>
    api.post<Offer>(`/offers/${offerId}/reject`),
}
