import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CompanyAdminResponse, CompanyStatsResponse, CompanyStatus } from '@/types'
import { companyApi } from '@/api'

export const useAdminStore = defineStore('admin', () => {
  // State
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const companies = ref<CompanyAdminResponse[]>([])
  const selectedCompany = ref<CompanyAdminResponse | null>(null)
  const currentFilter = ref<CompanyStatus>('PENDING' as CompanyStatus)
  
  // Stats from backend (all statuses)
  const stats = ref<CompanyStatsResponse>({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalCount: 0
  })

  // Getters - filtered lists
  const pendingCompanies = computed(() => 
    companies.value.filter(c => c.status === 'PENDING')
  )
  const approvedCompanies = computed(() => 
    companies.value.filter(c => c.status === 'APPROVED')
  )
  const rejectedCompanies = computed(() => 
    companies.value.filter(c => c.status === 'REJECTED')
  )
  
  // Stats getters (from backend)
  const pendingCount = computed(() => stats.value.pendingCount)
  const approvedCount = computed(() => stats.value.approvedCount)
  const rejectedCount = computed(() => stats.value.rejectedCount)
  const totalCount = computed(() => stats.value.totalCount)

  // Actions
  
  // Load stats (all statuses count)
  async function loadStats(): Promise<CompanyStatsResponse> {
    try {
      const response = await companyApi.getCompanyStats()
      stats.value = response
      return response
    } catch (err: any) {
      console.error('Failed to load stats:', err)
      throw err
    }
  }
  
  // Load companies by status
  async function loadCompanies(status?: CompanyStatus): Promise<CompanyAdminResponse[]> {
    loading.value = true
    error.value = null
    
    try {
      const filterStatus = status || currentFilter.value
      const response = await companyApi.listCompanies(filterStatus)
      companies.value = response
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load companies'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Approve a company
  async function approveCompany(companyId: string): Promise<CompanyAdminResponse> {
    loading.value = true
    error.value = null
    
    try {
      const response = await companyApi.approveCompany(companyId)
      // Remove from current list (status changed, so it doesn't match current filter anymore)
      companies.value = companies.value.filter(c => c.id !== companyId)
      // Update stats
      await loadStats()
      if (selectedCompany.value?.id === companyId) {
        selectedCompany.value = response
      }
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to approve company'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reject a company
  async function rejectCompany(companyId: string, reason: string): Promise<CompanyAdminResponse> {
    loading.value = true
    error.value = null
    
    try {
      const response = await companyApi.rejectCompany(companyId, { reason })
      // Remove from current list (status changed, so it doesn't match current filter anymore)
      companies.value = companies.value.filter(c => c.id !== companyId)
      // Update stats
      await loadStats()
      if (selectedCompany.value?.id === companyId) {
        selectedCompany.value = response
      }
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to reject company'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Select a company for detail view
  function selectCompany(company: CompanyAdminResponse | null) {
    selectedCompany.value = company
  }

  // Set filter
  function setFilter(status: CompanyStatus) {
    currentFilter.value = status
  }

  // Clear error
  function clearError() {
    error.value = null
  }

  return {
    // State
    loading,
    error,
    companies,
    selectedCompany,
    currentFilter,
    stats,
    
    // Getters
    pendingCompanies,
    approvedCompanies,
    rejectedCompanies,
    pendingCount,
    approvedCount,
    rejectedCount,
    totalCount,
    
    // Actions
    loadStats,
    loadCompanies,
    approveCompany,
    rejectCompany,
    selectCompany,
    setFilter,
    clearError
  }
})
