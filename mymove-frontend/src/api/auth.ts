import api from './index'
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types'

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload),

  registerCompany: (payload: RegisterPayload & { companyName: string }) =>
    api.post<AuthResponse>('/auth/register-company', payload),

  getMe: () =>
    api.get<{ id: number; email: string; firstName: string; lastName: string; role: string }>('/auth/me'),

  devLogin: (role: 'admin' | 'company' | 'end_customer') =>
    api.post<AuthResponse>('/auth/dev-login', { role }),
}
