import api from './index'
import type { User } from '@/types'

export interface UpdateProfilePayload {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  locale?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export const userApi = {
  getMe: () =>
    api.get<{ user: User }>('/users/me'),

  updateMe: (payload: UpdateProfilePayload) =>
    api.patch<{ user: User }>('/users/me', payload),

  changePassword: (payload: ChangePasswordPayload) =>
    api.patch<void>('/users/me/password', payload),

  deleteMe: () =>
    api.delete<void>('/users/me'),
}
