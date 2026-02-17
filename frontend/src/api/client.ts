import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    })

    // Request interceptor to add Basic Auth header
    this.client.interceptors.request.use(
      (config) => {
        const authStore = useAuthStore()
        if (authStore.credentials) {
          config.headers.Authorization = `Basic ${authStore.credentials}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          const authStore = useAuthStore()
          authStore.logout()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  // Special method for multipart/form-data (file uploads)
  async postMultipart<T>(url: string, formData: FormData): Promise<T> {
    const authStore = useAuthStore()
    
    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Authorization': authStore.credentials ? `Basic ${authStore.credentials}` : undefined,
        'Content-Type': undefined  // Let browser set it with boundary
      }
    })
    return response.data
  }
}

export const apiClient = new ApiClient()
