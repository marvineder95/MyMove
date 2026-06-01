import { defineStore } from 'pinia'
import { ref } from 'vue'
import { offersApi } from '@/api/offers'
import type { Offer } from '@/types'

export const useOfferStore = defineStore('offer', () => {
  const offers = ref<Offer[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchOffers(requestId: number) {
    isLoading.value = true
    try {
      const { data } = await offersApi.getForRequest(requestId)
      offers.value = data
      return data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to load offers'
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function acceptOffer(offerId: number) {
    isLoading.value = true
    try {
      const { data } = await offersApi.accept(offerId)
      const idx = offers.value.findIndex((o) => o.id === offerId)
      if (idx !== -1) offers.value[idx] = { ...offers.value[idx], status: 'ACCEPTED' }
      // Mark all others as rejected
      offers.value = offers.value.map((o) =>
        o.id !== offerId && o.status === 'SENT' ? { ...o, status: 'REJECTED' } : o,
      )
      return data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to accept offer'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function rejectOffer(offerId: number) {
    isLoading.value = true
    try {
      const { data } = await offersApi.reject(offerId)
      const idx = offers.value.findIndex((o) => o.id === offerId)
      if (idx !== -1) offers.value[idx] = { ...offers.value[idx], status: 'REJECTED' }
      return data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to reject offer'
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    offers,
    isLoading,
    error,
    fetchOffers,
    acceptOffer,
    rejectOffer,
  }
})
