import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Role, UserCredentials, AuthState, RegisterCompanyRequest, RegisterCompanyResponse } from '@/types'
import { authApi } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const isAuthenticated = ref(false)
  const user = ref<{ email: string; role: Role; companyId?: string } | null>(null)
  const credentials = ref<string | null>(localStorage.getItem('credentials'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAdmin = computed(() => user.value?.role === Role.ADMIN)
  const isCompany = computed(() => user.value?.role === Role.COMPANY)
  const isCustomer = computed(() => user.value?.role === Role.CUSTOMER)
  const currentUser = computed(() => user.value)

  // Initialize from localStorage
  if (credentials.value) {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
        isAuthenticated.value = true
      } catch {
        logout()
      }
    }
  }

  // Actions
  async function login(creds: UserCredentials, role: Role = Role.CUSTOMER, companyId?: string) {
    loading.value = true
    error.value = null
    
    try {
      // Store base64 encoded credentials for Basic Auth
      const base64Creds = btoa(`${creds.email}:${creds.password}`)
      credentials.value = base64Creds
      
      // Store user info
      user.value = { email: creds.email, role, companyId }
      isAuthenticated.value = true
      
      // Persist to localStorage
      localStorage.setItem('credentials', base64Creds)
      localStorage.setItem('user', JSON.stringify(user.value))
      
      return true
    } catch (err) {
      error.value = 'Login failed. Please try again.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function registerCompany(request: RegisterCompanyRequest): Promise<RegisterCompanyResponse> {
    loading.value = true
    error.value = null
    
    try {
      const response = await authApi.registerCompany(request)
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    isAuthenticated.value = false
    user.value = null
    credentials.value = null
    localStorage.removeItem('credentials')
    localStorage.removeItem('user')
  }

  function clearError() {
    error.value = null
  }

  return {
    isAuthenticated,
    user,
    credentials,
    loading,
    error,
    isAdmin,
    isCompany,
    isCustomer,
    currentUser,
    login,
    registerCompany,
    logout,
    clearError
  }
})
