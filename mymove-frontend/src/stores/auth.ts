import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'
import { authApi } from '@/api/auth'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isCustomer = computed(() => user.value?.role === 'END_CUSTOMER')
  const isCompany = computed(() => user.value?.role === 'COMPANY')
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await authApi.login({ email, password })
      token.value = data.accessToken
      user.value = data.user
      localStorage.setItem('token', data.accessToken)
      return true
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function register(payload: { email: string; password: string; firstName: string; lastName: string; phone?: string }) {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await authApi.register(payload)
      token.value = data.accessToken
      user.value = data.user
      localStorage.setItem('token', data.accessToken)
      return true
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Registration failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function devLogin(role: 'admin' | 'company' | 'end_customer') {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await authApi.devLogin(role)
      token.value = data.accessToken
      user.value = data.user
      localStorage.setItem('token', data.accessToken)
      return true
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      error.value = e.response?.data?.message || 'Dev login failed'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const { data } = await authApi.getMe()
      user.value = data as User
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    supabase.auth.signOut()
  }

  return {
    token,
    user,
    isLoading,
    error,
    isAuthenticated,
    isCustomer,
    isCompany,
    isAdmin,
    login,
    register,
    devLogin,
    loginWithGoogle,
    fetchUser,
    logout,
  }
})
