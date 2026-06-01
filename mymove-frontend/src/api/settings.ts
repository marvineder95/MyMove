import api from './index'
import type { User, UserSettings, UserPreferences } from '@/types'

export const settingsApi = {
  getSettings: () =>
    api.get<{ user: User }>('/users/me/settings'),

  updateSettings: (payload: Partial<UserSettings>) =>
    api.patch<{ user: User }>('/users/me/settings', payload),

  updatePreferences: (payload: Partial<UserPreferences>) =>
    api.patch<{ user: User }>('/users/me/preferences', payload),
}
