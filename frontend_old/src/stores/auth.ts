import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { defineStore } from 'pinia'
import { api } from './api'

// Types
export interface Address {
  street: string
  houseNumber: string
  postalCode: string
  city: string
  country: string
}

export interface Company {
  id: string
  email: string
  companyName: string
  contactPerson: string
  phone: string
  address: Address
  isVerified: boolean
  isAdmin: boolean
  logoUrl?: string
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  companyName: string
  contactPerson: string
  phone: string
  address: Address
  logo?: File
}

interface AuthResponse {
  token: string
  user: Company
}

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user: Ref<Company | null> = ref(null)
  const token: Ref<string | null> = ref(null)
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)

  // Getters
  const isAuthenticated: ComputedRef<boolean> = computed(() => !!token.value && !!user.value)
  const isAdmin: ComputedRef<boolean> = computed(() => user.value?.isAdmin ?? false)
  const isVerified: ComputedRef<boolean> = computed(() => user.value?.isVerified ?? false)

  // Actions
  const setAuthData = (authToken: string, authUser: Company): void => {
    token.value = authToken
    user.value = authUser
    
    // Persist to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, authToken)
      localStorage.setItem(USER_KEY, JSON.stringify(authUser))
    }
  }

  const clearAuthData = (): void => {
    token.value = null
    user.value = null
    
    // Clear localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  }

  const login = async (credentials: LoginCredentials): Promise<Company> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials)
      const { token: authToken, user: authUser } = response.data
      
      setAuthData(authToken, authUser)
      return authUser
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    loading.value = true
    
    try {
      // Optional: Call logout endpoint
      await api.post('/auth/logout').catch(() => {
        // Ignore errors during logout
      })
    } finally {
      clearAuthData()
      loading.value = false
    }
  }

  const registerCompany = async (formData: RegisterFormData): Promise<Company> => {
    loading.value = true
    error.value = null

    try {
      // Create FormData for multipart upload
      const data = new FormData()
      data.append('email', formData.email)
      data.append('password', formData.password)
      data.append('companyName', formData.companyName)
      data.append('contactPerson', formData.contactPerson)
      data.append('phone', formData.phone)
      data.append('address', JSON.stringify(formData.address))
      
      if (formData.logo) {
        data.append('logo', formData.logo)
      }

      const response = await api.post<AuthResponse>('/auth/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const { token: authToken, user: authUser } = response.data
      setAuthData(authToken, authUser)
      return authUser
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const fetchProfile = async (): Promise<Company> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<Company>('/auth/profile')
      user.value = response.data
      
      // Update localStorage with fresh user data
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data))
      }
      
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch profile.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (updates: Partial<Company>): Promise<Company> => {
    loading.value = true
    error.value = null

    try {
      const response = await api.patch<Company>('/auth/profile', updates)
      user.value = response.data
      
      // Update localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data))
      }
      
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await api.post('/auth/change-password', { oldPassword, newPassword })
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to change password.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const uploadLogo = async (file: File): Promise<string> => {
    loading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await api.post<{ logoUrl: string }>('/auth/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Update user with new logo URL
      if (user.value) {
        user.value.logoUrl = response.data.logoUrl
        localStorage.setItem(USER_KEY, JSON.stringify(user.value))
      }

      return response.data.logoUrl
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to upload logo.'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  // Initialize auth state from localStorage (call on app start)
  const initializeAuth = (): boolean => {
    if (typeof localStorage === 'undefined') return false

    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedUser = localStorage.getItem(USER_KEY)

    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
        return true
      } catch {
        // Invalid stored data, clear it
        clearAuthData()
        return false
      }
    }

    return false
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    isAdmin,
    isVerified,
    // Actions
    login,
    logout,
    registerCompany,
    fetchProfile,
    updateProfile,
    changePassword,
    uploadLogo,
    initializeAuth,
  }
})

export default useAuthStore
