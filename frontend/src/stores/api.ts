import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from './auth'


export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor - adds language header and auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add Accept-Language header from i18n
    try {
      const i18n = useI18n()
      if (i18n.locale.value) {
        config.headers['Accept-Language'] = i18n.locale.value
      }
    } catch {
      // i18n might not be available during SSR or early initialization
      config.headers['Accept-Language'] = 'de'
    }

    // Add auth token if available
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors and 401 logout
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      try {
        const authStore = useAuthStore()
        await authStore.logout()
      } catch {
        // If store not available, clear localStorage directly
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      
      // Redirect to login if in browser
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error - please check your connection')
    }

    return Promise.reject(error)
  }
)

export default api
