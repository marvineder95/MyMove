import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { companyApi } from '@/api/company'
import type {
  Company,
  CompanyDashboardData,
  AvailableRequest,
  CompanyPricing,
} from '@/types'

export const useCompanyStore = defineStore('company', () => {
  const company = ref<Company | null>(null)
  const dashboard = ref<CompanyDashboardData | null>(null)
  const availableRequests = ref<AvailableRequest[]>([])
  const pricing = ref<CompanyPricing | null>(null)
  const profileCompleteness = ref<{ percentage: number; missing: string[] } | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const companyName = computed(() => company.value?.companyName ?? '')

  async function fetchCompany() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await companyApi.getMe()
      company.value = data
      return data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to load company'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateCompany(payload: Partial<Company>) {
    isSaving.value = true
    error.value = null
    try {
      const { data } = await companyApi.updateMe(payload)
      company.value = data
      return data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to update company'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function fetchProfile() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await companyApi.getProfile()
      company.value = data.company
      profileCompleteness.value = data.completeness
      return data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to load profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchDashboard() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await companyApi.getDashboard()
      dashboard.value = data
      return data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to load dashboard'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchAvailableRequests() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await companyApi.getAvailableRequests()
      availableRequests.value = data
      return data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to load requests'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPricing() {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await companyApi.getPricing()
      pricing.value = data
      return data
    } catch (err: unknown) {
      // Pricing may not exist yet — don't treat as error
      pricing.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function savePricing(payload: Partial<CompanyPricing>) {
    isSaving.value = true
    error.value = null
    try {
      const { data } = pricing.value
        ? await companyApi.updatePricing(payload)
        : await companyApi.createPricing(payload as CompanyPricing)
      pricing.value = data
      return data
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Failed to save pricing'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  function clear() {
    company.value = null
    dashboard.value = null
    availableRequests.value = []
    pricing.value = null
    profileCompleteness.value = null
    error.value = null
  }

  return {
    company,
    dashboard,
    availableRequests,
    pricing,
    profileCompleteness,
    isLoading,
    isSaving,
    error,
    companyName,
    fetchCompany,
    updateCompany,
    fetchProfile,
    fetchDashboard,
    fetchAvailableRequests,
    fetchPricing,
    savePricing,
    clear,
  }
})
